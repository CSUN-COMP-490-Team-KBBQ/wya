import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventId, UserId } from '../../../../interfaces';
import { ApiError, makeApiError } from '../../../../../lib/errors';

type Params = {
  eventId: EventId;
  userId: UserId;
};

type Context = {
  firebaseClientInjection: App;
};

export const etlEventsGuestsDelete = async (
  params: Params,
  context: Context,
  { debug = Debug('api:etl/events/guests/delete') as any } = {}
) => {
  assert(params.eventId, makeApiError(400, 'Event is required'));
  assert(params.userId, makeApiError(400, 'User is required'));

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

      const guestsByUserId = event.guestsByUserId as UserId[];
      // Assert that the params.userId is a guest in the event doc
      assert(
        guestsByUserId.includes(params.userId),
        makeApiError(422, `User: ${params.userId} is not a guest`)
      );

      // Remove user from event
      const eventGuestsDocRef = firebaseFirestore.doc(
        `/events/${params.eventId}/guests/${params.userId}`
      );
      transaction.delete(eventGuestsDocRef);

      // Updating event guest in events/eventId: { guestsByUserId }
      const index = guestsByUserId.findIndex(
        (value) => value === params.userId
      );
      guestsByUserId.splice(index, 1);
      transaction.update(eventDocRef, { guestsByUserId: guestsByUserId });

      // Remove event from user
      const userEventDocRef = firebaseFirestore.doc(
        `/users/${params.userId}/events/${params.eventId}`
      );
      transaction.delete(userEventDocRef);
    });
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to get event', err);
  }

  debug('Done');
};
