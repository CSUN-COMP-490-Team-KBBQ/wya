import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventPlanId, UserId } from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';

type Params = {
  eventPlanId: EventPlanId;
  invitees: UserId[];
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
  const { eventPlanId, invitees, hostId } = params;

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
    debug(`Deleteing event-plan document`);
    const eventPlanDocumentRef = firebaseFirestore.doc(
      `/event-plans/${eventPlanId}`
    );
    await firebaseFirestore.recursiveDelete(eventPlanDocumentRef);

    debug('Deleteing event-plan document from invitees and host');
    let inviteesAndHost: UserId[] = [hostId];
    if (invitees !== undefined) {
      inviteesAndHost.push(...invitees);
    }
    for (const uid of inviteesAndHost) {
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
    throw makeApiError(500, 'Unable to delete event-plan', err);
  }

  debug('Done');
};
