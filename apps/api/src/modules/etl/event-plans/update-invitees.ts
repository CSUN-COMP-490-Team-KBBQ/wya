import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import { pick, uniq } from 'lodash/fp';

import { AuthContext, authorize } from '../../../auth';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../lib/errors';
import {
  Email,
  EventPlanId,
  EVENT_PLAN_ROLE,
  UserId,
} from '../../../interfaces';
import { validate } from '../../../../lib/validate';

type Params = {
  eventPlanId: EventPlanId;
  invitees: Email[];
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
      required: ['eventPlanId'],
      properties: {
        eventPlanId: { type: 'string' },
      },
    },
    restOfParams,
    makeApiError(400, 'Bad request')
  );
};

export const etlEventPlansUpdateInvitees = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/event-plans/update-invitees') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  _customValidate(params);

  const firebaseAuth = getFirebaseAuth(firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Bad firebase client')
  );

  const data: { inviteesByUserId?: UserId[] } = {};
  const errors: JSON_API_ERROR[] = [];

  const upsertInviteesByUserId: UserId[] = [];
  for (const email of params.invitees) {
    try {
      const { uid } = await firebaseAuth.getUserByEmail(email);
      upsertInviteesByUserId.push(uid);
    } catch (err: any) {
      errors.push(parseApiError(err));
      // Just catch the error and pass back, no need to throw err
    }
  }

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventPlanDocRef = firebaseFirestore.doc(
        `/event-plans/${params.eventPlanId}`
      );

      const eventPlan = (await transaction.get(eventPlanDocRef)).data();
      assert(eventPlan, makeApiError(422, 'Invalid event-plan'));

      authorize('etl/event-plans/update-invitees', context, eventPlan);

      debug(`Updating event-plan invitees: ${JSON.stringify(params, null, 4)}`);

      const existingInviteesByUserId = eventPlan?.inviteesByuserId ?? [];

      for (const userId of upsertInviteesByUserId) {
        if (existingInviteesByUserId.includes(userId)) {
          // Do nothing because userId is already an invitee
          continue;
        }

        // Create event-plan availability doc
        const eventPlanAvailabilitiesDocRef = firebaseFirestore.doc(
          `/event-plans/${params.eventPlanId}/availabilities/${userId}`
        );

        const eventPlanAvailabilitiesDocPatch = {
          data: {},
          uid: userId,
        };

        transaction.create(
          eventPlanAvailabilitiesDocRef,
          eventPlanAvailabilitiesDocPatch
        );

        // Create user event-plan doc
        const userEventPlansDocRef = firebaseFirestore.doc(
          `/users/${userId}/event-plans/${params.eventPlanId}`
        );

        const userEventPlansDocPatch = {
          ...pick(
            [
              'name',
              'description',
              'dailyStartTime',
              'dailyEndTime',
              'startDate',
              'endDate',
              'isFinalized',
            ],
            eventPlan
          ),
          role: EVENT_PLAN_ROLE.INVITEE,
        };

        transaction.create(userEventPlansDocRef, userEventPlansDocPatch);
      }

      // Update event-plan invitees
      data.inviteesByUserId = uniq([
        ...existingInviteesByUserId,
        ...upsertInviteesByUserId,
      ]);

      transaction.update(eventPlanDocRef, data);
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
    throw err;
  }

  debug('Done');

  return { data, errors };
};
