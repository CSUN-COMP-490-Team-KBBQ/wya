import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import { difference } from 'lodash/fp';

import { AuthContext, authorize } from '../../../auth';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../lib/errors';
import { Email, EventPlanId, UserId } from '../../../interfaces';
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

export const etlEventPlansDeleteInvitees = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/event-plans/delete-invitees') as any,
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

  const removeInviteesByUserId: UserId[] = [];
  for (const email of params.invitees) {
    try {
      const { uid } = await firebaseAuth.getUserByEmail(email);
      removeInviteesByUserId.push(uid);
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

      authorize('etl/event-plans/delete-invitees', context, eventPlan);

      debug(`Removing event-plan invitees: ${JSON.stringify(params, null, 4)}`);

      const existingInviteesByUserId: UserId[] =
        eventPlan?.inviteesByuserId ?? [];

      for (const userId of removeInviteesByUserId) {
        if (!existingInviteesByUserId.includes(userId)) {
          // Do nothing because userId is already not an invitee
          continue;
        }

        // Delete event-plan availability doc
        const eventPlanAvailabilitiesDocRef = firebaseFirestore.doc(
          `/event-plans/${params.eventPlanId}/availabilities/${userId}`
        );
        transaction.delete(eventPlanAvailabilitiesDocRef);

        // Delete user event-plan doc
        const userEventPlansDocRef = firebaseFirestore.doc(
          `/users/${userId}/event-plans/${params.eventPlanId}`
        );
        transaction.delete(userEventPlansDocRef);
      }

      // Update event-plan invitees
      data.inviteesByUserId = difference(
        existingInviteesByUserId,
        removeInviteesByUserId
      );

      transaction.update(eventPlanDocRef, data);
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
    throw err;
  }

  debug('Done');
  return { data, errors };
};
