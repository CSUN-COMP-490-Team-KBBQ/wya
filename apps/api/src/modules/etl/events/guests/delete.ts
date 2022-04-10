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
  const { eventId, userId } = params;
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
      guestsByUserId = event.guestsByUserId as UserId[];
      assert(
        guestsByUserId.includes(userId),
        makeApiError(409, `User: ${userId} is not a guest`)
      );
    });

    debug('Done');
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to get event', err);
  }

  debug(`Deleting event guest from events/eventId/guests `);

  try {
    const eventGuestsDocumentRef = firebaseFirestore.doc(
      `/events/${eventId}/guests/${userId}`
    );
    await firebaseFirestore.recursiveDelete(eventGuestsDocumentRef);
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(
      500,
      'Unable to delete event guest from events/eventId/guests',
      err
    );
  }

  debug('Updating event guest in events/eventId: { guestsByUserId }');

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventDocumentRef = firebaseFirestore.doc(`/events/${eventId}`);
      const index = guestsByUserId.findIndex((value) => value === userId);
      guestsByUserId.splice(index, 1);

      transaction.update(eventDocumentRef, { guestsByUserId: guestsByUserId });
    });
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(
      500,
      'Unable to delete event guest from events/eventId: guestsByUserId',
      err
    );
  }

  debug('Deleting event from user ');

  try {
    const userEventDocumentRef = firebaseFirestore.doc(
      `/users/${userId}/events/${eventId}`
    );
    await firebaseFirestore.recursiveDelete(userEventDocumentRef);
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to delete event from user', err);
  }

  debug('Done');
};
