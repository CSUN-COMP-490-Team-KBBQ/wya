import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventGuest, EventId, UserId } from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';

type Params = {
  eventId: EventId;
  guests: EventGuest[];
  hostId: UserId;
};

type Context = {
  firebaseClientInjection: App;
};

export const etlEventsDelete = async (
  params: Params,
  context: Context,
  { debug = Debug('api:etl/events/delete') as any } = {}
) => {
  const { eventId, guests, hostId } = params;

  assert(eventId, makeApiError(409, 'Event is required'));

  debug(`Deleting an event: ${JSON.stringify(params, null, 4)}`);

  const firebaseAuth = getFirebaseAuth(context.firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(
    context.firebaseClientInjection
  );
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Invalid context')
  );

  try {
    debug(`Deleteing event document`);
    const eventDocumentRef = firebaseFirestore.doc(`/events/${eventId}`);
    await firebaseFirestore.recursiveDelete(eventDocumentRef);

    debug('Deleteing event document from guests and host');
    let guestsAndHost: UserId[] = [hostId];
    if (guests !== undefined) {
      guestsAndHost.push(...guests.map((value) => value.uid));
    }
    for (const uid of guestsAndHost) {
      const userEventDocumentRef = firebaseFirestore.doc(
        `/users/${uid}/events/${eventId}`
      );
      await firebaseFirestore.recursiveDelete(userEventDocumentRef);
    }
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to delete event', err);
  }

  debug('Done');
};
