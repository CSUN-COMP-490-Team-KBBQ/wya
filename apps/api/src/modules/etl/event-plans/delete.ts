import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventPlanId, UserId } from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';
import { validate } from '../../../../lib/validate';
import { AuthContext, authorize } from '../../../auth';

type Params = {
  eventPlanId: EventPlanId;
};

export const etlEventPlansDelete = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/event-plans/delete') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['eventPlanId'],
      properties: {
        eventPlanId: {
          type: 'string',
        },
      },
    },
    params,
    makeApiError(400, 'Bad request')
  );

  debug(`Deleting an event-plan: ${JSON.stringify(params, null, 4)}`);

  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(firebaseFirestore, makeApiError(422, 'Bad firebase client'));

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventPlanDocRef = firebaseFirestore.doc(
        `/event-plans/${params.eventPlanId}`
      );
      const eventPlan = (await transaction.get(eventPlanDocRef)).data();

      assert(eventPlan, makeApiError(422, 'Invalid event-plan'));

      authorize('etl/event-plans/delete', context, eventPlan);

      for (const userId of [
        ...((eventPlan.inviteesByUserId ?? []) as UserId[]),
        ...(([eventPlan.hostId] ?? []) as UserId[]),
      ]) {
        // Remove user event-plans
        const userEventPlanDocRef = firebaseFirestore.doc(
          `/users/${userId}/event-plans/${params.eventPlanId}`
        );
        transaction.delete(userEventPlanDocRef);

        // Remove event-plan availabilities
        const eventPlanAvailabilitiesDocRef = firebaseFirestore.doc(
          `/event-plans/${params.eventPlanId}/availabilities/${userId}`
        );
        transaction.delete(eventPlanAvailabilitiesDocRef);
      }

      // Remove the actual event plan
      transaction.delete(eventPlanDocRef);
    });
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to delete event-plan');
  }

  debug('Done');

  return {
    data: {},
  };
};
