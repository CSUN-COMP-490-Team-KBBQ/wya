import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventPlanId, UserId } from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';

type Params = {
  eventPlanId: EventPlanId;
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
  const { eventPlanId, hostId } = params;
  let eventPlan;
  let inviteesByUserId: UserId[] = [];

  assert(eventPlanId, makeApiError(409, 'Event-Plan is required'));
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
        `/event-plans/${eventPlanId}`
      );

      eventPlan = (await transaction.get(eventPlanDocRef)).data();
      assert(eventPlan, makeApiError(422, 'Invalid event plan'));
      assert(hostId === eventPlan.hostId, makeApiError(401, 'Unauthorized'));
      inviteesByUserId = eventPlan.inviteesByUserId as UserId[];
    });

    debug('Done');
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to get event-plan', err);
  }

  try {
    debug(`Deleteing event-plan document`);

    const eventPlanDocumentRef = firebaseFirestore.doc(
      `/event-plans/${eventPlanId}`
    );
    await firebaseFirestore.recursiveDelete(eventPlanDocumentRef);
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to delete event-plan', err);
  }
  try {
    debug('Deleteing event-plan document from invitees and host');

    for (const uid of [...inviteesByUserId, hostId]) {
      const userEventPlanDocumentRef = firebaseFirestore.doc(
        `/users/${uid}/event-plans/${eventPlanId}`
      );
      await firebaseFirestore.recursiveDelete(userEventPlanDocumentRef);
    }
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to delete event-plan from user', err);
  }

  debug('Done');
};
