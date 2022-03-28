import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';

import {
  Email,
  EventPlanDocument,
  EventPlanInfo,
  EventPlanAvailabilityDocument,
  UserEventPlanDocument,
  UserId,
} from '../../../interfaces';
import { etlFirebaseGetUserByEmail } from './get-user-by-email';

const debug = Debug('wya-api:etl/firebase/create-new-event-plan');

type EtlFirebaseCreateNewEventPlanParams = EventPlanInfo & {
  invitees: Email[];
};

type EtlFirebaseCreateNewEventPlanContext = {
  firebaseClientInjection: App;
};

const _validateParams = (params: EtlFirebaseCreateNewEventPlanParams) => {
  const { invitees, ...restOfParams } = params;
  for (const [key, value] of Object.entries(restOfParams)) {
    assert(value || value === '', `[${key}] is required`);
  }

  // If there are invitees check to make sure we have proper emails
  if (invitees.length) {
    /**
     * Regex copied from : https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
     */
    const EMAIL_REGEX =
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    for (const email of invitees) {
      assert(EMAIL_REGEX.test(email), 'Invalid email provided');
    }
  }
};

export const etlFirebaseCreateNewEventPlan = async (
  params: EtlFirebaseCreateNewEventPlanParams,
  context: EtlFirebaseCreateNewEventPlanContext
) => {
  // Should validate these params
  _validateParams(params);

  try {
    const { firebaseClientInjection } = context;
    const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);

    /** Extract */
    const eventPlanId = uuid();
    const { invitees: inviteesByEmails, hostId, ...restOfParams } = params;

    /** Transform */

    // Map and reduce the array of invitees' emails into an array of invitees' userIds
    const inviteesByUserIds: UserId[] = await (
      await Promise.all(
        inviteesByEmails.map((email) =>
          etlFirebaseGetUserByEmail({ email }, { firebaseClientInjection })
        )
      )
    ).reduce((acc: UserId[], { data: [userId] }) => {
      return [...acc, userId];
    }, []);

    /** Load */
    await firebaseFirestore.runTransaction(async (transaction) => {
      // Create the event-plan doc
      const eventPlanRef = firebaseFirestore.doc(`/event-plans/${eventPlanId}`);
      await transaction.create(eventPlanRef, {
        ...restOfParams,
        // Re adding back hostId because it was destructed earlier
        hostId,
        invitees: inviteesByUserIds,
        eventPlanId,
      } as EventPlanDocument);

      // Create the event-plan/availabilites/userId for each invitee
      const inviteesAndHostByUserId = [...inviteesByUserIds, hostId];
      await Promise.all(
        inviteesAndHostByUserId.map((userId) => {
          const eventPlanAvailabilitiesHeatMapRef = firebaseFirestore.doc(
            `/event-plans/${eventPlanId}/availabilities/${userId}`
          );
          return transaction.create(eventPlanAvailabilitiesHeatMapRef, {
            data: {},
          } as EventPlanAvailabilityDocument);
        })
      );

      // Associate event-plan doc to host
      const hostEventPlanDocRef = firebaseFirestore.doc(
        `/users/${hostId}/event-plans/${eventPlanId}`
      );
      await transaction.create(hostEventPlanDocRef, {
        ...restOfParams,
        role: 'HOST',
      } as UserEventPlanDocument);

      // Associate event-plan doc to each invitee
      await Promise.all(
        inviteesByUserIds.map((userId) => {
          const inviteeEventPlanDocRef = firebaseFirestore.doc(
            `/users/${userId}/event-plans/${eventPlanId}`
          );
          return transaction.create(inviteeEventPlanDocRef, {
            ...restOfParams,
            role: 'INVITEE',
          } as UserEventPlanDocument);
        })
      );
    });

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

      inviteesByEmails.forEach((email) => {
        if (email) {
          debug(`Sending invitation email to ${email}`);
          const [domain] = (
            process.env.DOMAINS ?? 'http://localhost:3000'
          ).split(',');
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
              debug(`${JSON.stringify(err ?? {}, null, 2)}`);
            } else {
              debug(`Send to ${email}`);
              debug(`${JSON.stringify(info ?? {}, null, 2)}`);
            }
          });
        }
      });
    } catch (err) {
      /**
       * We fail silently for now so that the rest of this etl can complete
       */
    }

    debug(`Event plan created: ${eventPlanId}`);

    return {
      data: [eventPlanId],
    };
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseCreateNewEventPlan:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
