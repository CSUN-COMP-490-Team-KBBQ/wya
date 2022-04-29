import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';

import { Email, UserId, EVENT_PLAN_ROLE } from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';
import { validate } from '../../../../lib/validate';
import { AuthContext, authorize } from '../../../auth';

type Params = {
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
  invitees: Email[];
  'g-recaptcha-response': string;
};

const _customValidate = (params: Params) => {
  const { invitees, ...restOfParams } = params;

  // Custom validation to check invitees are valid emails
  if (invitees.length > 0) {
    /**
     * Regex copied from : https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
     */
    const EMAIL_REGEX =
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    for (const email of invitees) {
      assert(
        EMAIL_REGEX.test(email),
        makeApiError(400, `Invalid email provided: ${email}`)
      );
    }
  }

  // Validate rest of the params
  validate(
    {
      type: 'object',
      required: [
        'name',
        'dailyStartTime',
        'dailyEndTime',
        'startDate',
        'endDate',
      ],
      properties: {
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        dailyStartTime: {
          type: 'string',
        },
        dailyEndTime: {
          type: 'string',
        },
        startDate: {
          type: 'string',
        },
        endDate: { type: 'string' },
        'g-recaptcha-response': {
          type: 'string',
        },
      },
    },
    restOfParams,
    makeApiError(400, 'Bad request')
  );
};

export const etlEventPlansCreate = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/event-plans/create') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  _customValidate(params);

  authorize('etl/event-plans/create', context, {});

  const firebaseAuth = getFirebaseAuth(firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Bad firebase client')
  );

  const hostId = context.user?.uid;
  assert(hostId, makeApiError(401, 'Invalid user'));

  const eventPlanId = uuid();

  const { invitees: inviteesByEmail, ...restOfParams } = params;

  debug('Creating event-plan');
  debug({ ...params, eventPlanId, hostId });

  let inviteesByUserId: UserId[] = [];
  for (const email of inviteesByEmail) {
    try {
      const { uid } = await firebaseAuth.getUserByEmail(email);
      inviteesByUserId.push(uid);
    } catch (err) {
      // For now we won't do anything if an invitee does not have a wya account
    }
  }

  const patches = {
    eventPlans: [] as { [EventPlanId: string]: {} }[],
    eventPlansAvailabilities: [] as { [UserId: string]: {} }[],
    usersEventPlans: [] as { [EventPlanId: string]: {} }[],
  };
  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventPlanDocRef = firebaseFirestore.doc(
        `/event-plans/${eventPlanId}`
      );
      const eventPlanDocPatch = {
        ...restOfParams,
        hostId,
        inviteesByUserId,
        eventPlanId,
        isFinalized: false,
      };
      transaction.create(eventPlanDocRef, eventPlanDocPatch);
      patches.eventPlans.push({ [eventPlanId]: eventPlanDocPatch });

      // Create event-plan availabilities doc for each associated user
      for (const userId of [...inviteesByUserId, hostId]) {
        const eventPlanAvailabilitiesDocRef = firebaseFirestore.doc(
          `/event-plans/${eventPlanId}/availabilities/${userId}`
        );
        const eventPlanAvailabilitiesDocPatch = {
          data: {},
          uid: userId,
        };

        transaction.create(
          eventPlanAvailabilitiesDocRef,
          eventPlanAvailabilitiesDocPatch
        );

        patches.eventPlansAvailabilities.push({
          [userId]: eventPlanAvailabilitiesDocPatch,
        });
      }

      // Associate the event-plan to the host user
      const hostUserEventPlansDocRef = firebaseFirestore.doc(
        `/users/${hostId}/event-plans/${eventPlanId}`
      );
      const hostUserEventPlansDocPatch = {
        ...restOfParams,
        eventPlanId,
        role: EVENT_PLAN_ROLE.HOST,
        isFinalized: false,
      };

      transaction.create(hostUserEventPlansDocRef, hostUserEventPlansDocPatch);

      patches.usersEventPlans.push({
        [eventPlanId]: hostUserEventPlansDocPatch,
      });

      // Associate the event-plan to the invitee users
      for (const userId of inviteesByUserId) {
        const userEventPlansDocRef = firebaseFirestore.doc(
          `/users/${userId}/event-plans/${eventPlanId}`
        );
        const userEventPlansDocPatch = {
          ...restOfParams,
          eventPlanId,
          role: EVENT_PLAN_ROLE.INVITEE,
          isFinalized: false,
        };

        transaction.create(userEventPlansDocRef, userEventPlansDocPatch);

        patches.usersEventPlans.push({ [eventPlanId]: userEventPlansDocPatch });
      }
    });
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to create event-plan', err);
  } finally {
    debug(patches);
  }

  // Send emails to invitees
  try {
    const emailTransport = nodemailer.createTransport({
      // NOTE: Using gmail as a sender because there is currently no domain for an email service
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    for (const email of inviteesByEmail) {
      if (email) {
        const [domain] = (process.env.DOMAINS ?? 'http://localhost:3000').split(
          ','
        );

        const eventPlanUrl = `${domain}/event-plans/${eventPlanId}`;
        const { name } = restOfParams;
        const mailOptions = {
          from: process.env.NODEMAILER_USERNAME,
          to: email,
          subject: `WYA?! You've been invited to an event!`,
          html:
            '<h1>WYA</h1>' +
            `<p>You've been invited to :${name}</p>` +
            `<p>Click here to view event: <a href="${eventPlanUrl}">${eventPlanUrl}</a></p>`,
        };

        emailTransport.sendMail(mailOptions, (err, info) => {
          if (err) {
            debug(`Error sending email to ${email}`);
            debug(`${JSON.stringify(err ?? {}, null, 4)}`);
          }

          if (info) {
            debug(`Sent to ${email}`);
            debug(`${JSON.stringify(info ?? {}, null, 2)}`);
          }
        });
      }
    }
  } catch (err) {
    // Don't do anything if there is an error sending out email invitations
  }

  debug('Done');
  return {
    data: [eventPlanId],
    errors: [],
  };
};
