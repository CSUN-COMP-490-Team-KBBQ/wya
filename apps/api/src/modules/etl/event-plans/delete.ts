import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventPlanId, UserId } from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';

type Params = {
  eventPlanId: EventPlanId;
  userId: UserId;
  hostId: UserId;
};

type Context = {
  firebaseClientInjection: App;
};

export const etlEventPlansDelete = async (
  params: Params,
  context: Context,
  { debug = Debug('api:etl/event-plans/delete') as any } = {}
) => {
  // Rough validation of params
  assert(params.eventPlanId, makeApiError(400, 'Event-plan is required'));
  assert(params.hostId, makeApiError(400, 'Host is required'));

  debug(`Deleting an event-plan: ${JSON.stringify(params, null, 4)}`);

  const firebaseAuth = getFirebaseAuth(context.firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(
    context.firebaseClientInjection
  );
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Invalid context')
  );

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventPlanDocRef = firebaseFirestore.doc(
        `/event-plans/${params.eventPlanId}`
      );
      const eventPlan = (await transaction.get(eventPlanDocRef)).data();

      assert(eventPlan, makeApiError(422, 'Invalid event-plan'));

      // Assert that the params.hostId matches whats in the event-plan doc
      assert(
        eventPlan?.hostId === params.hostId,
        makeApiError(401, 'Unauthorized')
      );

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
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to delete event-plan');
  }

  debug('Done');
};
