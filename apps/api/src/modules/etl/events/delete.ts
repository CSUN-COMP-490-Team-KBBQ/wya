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
  assert(params.eventId, makeApiError(400, 'Event is required'));
  assert(params.hostId, makeApiError(400, 'Host is required'));
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
      const eventDocRef = firebaseFirestore.doc(`/events/${params.eventId}`);
      const event = (await transaction.get(eventDocRef)).data();

      assert(event, makeApiError(422, 'Invalid event'));

      // Assert that the params.hostId matches whats in the event doc
      assert(
        event?.hostId === params.hostId,
        makeApiError(401, 'Unauthorized')
      );

      // Remove user events
      for (const userId of [
        ...((event.guestsByUserId ?? []) as UserId[]),
        ...(([event.hostId] ?? []) as UserId[]),
      ]) {
        const userEventDocRef = firebaseFirestore.doc(
          `/users/${userId}/events/${params.eventId}`
        );
        transaction.delete(userEventDocRef);
      }

      // Remove the actual event

      // Not actually sure if this is safe to do or not. Unsure how nicely
      // a recursive delete does inside of a transaction. Seems safe because
      // we already got all the info we want out of the event
      await firebaseFirestore.recursiveDelete(eventDocRef);
    });
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to delete event');
  }

  debug('Done');
};
