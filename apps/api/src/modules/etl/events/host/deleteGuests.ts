import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventId, UserId } from '../../../../interfaces';
import { ApiError, makeApiError } from '../../../../../lib/errors';

type Params = {
  eventId: EventId;
  hostId: UserId;
  guestsByUserId: UserId[];
};

type Context = {
  firebaseClientInjection: App;
};

export const etlEventsHostDeleteGuests = async (
  params: Params,
  context: Context,
  { debug = Debug('api:etl/events/hosts/deleteGuests') as any } = {}
) => {
  assert(params.eventId, makeApiError(409, 'Event is required'));
  assert(params.hostId, makeApiError(409, 'Host is required'));
  assert(params.guestsByUserId, makeApiError(409, 'Guest(s) is/are required'));

  debug(`Deleting an guests: ${JSON.stringify(params, null, 4)}`);

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
      const eventPlanDocRef = firebaseFirestore.doc(
        `/event-plans/${params.eventId}`
      );
      const eventPlan = (await transaction.get(eventPlanDocRef)).data();
      assert(event, makeApiError(422, 'Invalid event'));
      assert(eventPlan, makeApiError(422, 'Invalid event-plan'));

      // Assert that the params.hostId matches whats in the event doc
      assert(
        event?.hostId === params.hostId,
        makeApiError(401, 'Unauthorized')
      );

      const guestsByUserId = event.guestsByUserId as UserId[];
      // Assert that the params.userId is a guest in the event doc
      for (const userId of [...((params.guestsByUserId ?? []) as UserId[])]) {
        assert(
          guestsByUserId.includes(userId),
          makeApiError(409, `User: ${userId} is not a guest`)
        );
      }

      for (const userId of [...((params.guestsByUserId ?? []) as UserId[])]) {
        // Remove event guests user
        const eventGuestsDocRef = firebaseFirestore.doc(
          `/events/${params.eventId}/guests/${userId}`
        );
        transaction.delete(eventGuestsDocRef);

        // Updating event guest in events/eventId: { guestsByUserId }
        const index = guestsByUserId.findIndex((value) => value === userId);
        guestsByUserId.splice(index, 1);
        transaction.update(eventDocRef, { guestsByUserId: guestsByUserId });

        // Remove user event
        const userEventDocRef = firebaseFirestore.doc(
          `/users/${userId}/events/${params.eventId}`
        );
        transaction.delete(userEventDocRef);

        // Updating event-plan invitee in event-plans/eventId: { inviteesByUserId }
        transaction.update(eventPlanDocRef, {
          inviteesByUserId: guestsByUserId,
        });

        // Remove user event-plan
        const userEventPlanDocRef = firebaseFirestore.doc(
          `/users/${userId}/event-plans/${params.eventId}`
        );
        transaction.delete(userEventPlanDocRef);
      }
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
