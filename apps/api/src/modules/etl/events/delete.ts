import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventId, UserId } from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';

type Params = {
  eventId: EventId;
  userId: UserId;
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
  const { eventId, userId, hostId } = params;
  let event;
  let guestsByUserId: UserId[] = [];

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
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventDocRef = firebaseFirestore.doc(`/events/${eventId}`);

      event = (await transaction.get(eventDocRef)).data();
      assert(event, makeApiError(422, 'Invalid event'));
      assert(hostId === event.hostId, makeApiError(401, 'Unauthorized'));
      assert(hostId === userId, makeApiError(401, 'Unauthorized'));

      guestsByUserId = event.guestsByUserId as UserId[];
    });

    debug('Done');
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to get event', err);
  }

  try {
    debug(`Deleteing event document`);

    const eventDocumentRef = firebaseFirestore.doc(`/events/${eventId}`);
    await firebaseFirestore.recursiveDelete(eventDocumentRef);
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to delete event', err);
  }
  try {
    debug('Deleteing event document from guests and host');

    for (const uid of [...guestsByUserId, hostId]) {
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
    throw makeApiError(500, 'Unable to delete event from user', err);
  }

  debug('Done');
};
