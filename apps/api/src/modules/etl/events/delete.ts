import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventId, UserId } from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';
import { etlEventPlansDelete } from '../event-plans/delete';

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

      // Not sure if we can create another transaction in the middle of
      // this transaction

      // Remove all associated event-plan docs
      await etlEventPlansDelete(
        {
          eventPlanId: params.eventId,
          userId: params.userId,
          hostId: params.hostId,
        },
        { firebaseClientInjection: context.firebaseClientInjection },
        { debug }
      );

      for (const userId of [
        ...((event.guestsByUserId ?? []) as UserId[]),
        ...(([event.hostId] ?? []) as UserId[]),
      ]) {
        // Remove user events
        const userEventDocRef = firebaseFirestore.doc(
          `/users/${userId}/events/${params.eventId}`
        );
        transaction.delete(userEventDocRef);

        // Remove the event guests
        const eventGuestsDocRef = firebaseFirestore.doc(
          `/events/${params.eventId}/guests/${userId}`
        );
        transaction.delete(eventGuestsDocRef);
      }

      // Remove the actual event
      transaction.delete(eventDocRef);
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
