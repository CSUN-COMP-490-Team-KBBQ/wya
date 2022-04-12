import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventGuest, EventId, UserId } from '../../../../interfaces';
import { ApiError, makeApiError } from '../../../../../lib/errors';

type Params = {
  eventId: EventId;
  hostId: UserId;
  eventGuests: EventGuest[];
};

type Context = {
  firebaseClientInjection: App;
};

export const etlEventsGuestsUpdate = async (
  params: Params,
  context: Context,
  { debug = Debug('api:etl/events/guests/delete') as any } = {}
) => {
  assert(params.eventId, makeApiError(400, 'Event is required'));
  assert(params.hostId, makeApiError(400, 'Host is required'));

  debug(`Updating event guests: ${JSON.stringify(params, null, 4)}`);

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

      const removedGuestsByUserId = guestsByUserId.filter(
        (uid) =>
          !params.eventGuests.map((eventGuest) => eventGuest.uid).includes(uid)
      );

      for (const userId of [...removedGuestsByUserId]) {
        // Remove event guest
        const eventGuestsDocRef = firebaseFirestore.doc(
          `/events/${params.eventId}/guests/${userId}`
        );
        transaction.delete(eventGuestsDocRef);

        // Remove user event
        const userEventDocRef = firebaseFirestore.doc(
          `/users/${userId}/events/${params.eventId}`
        );
        transaction.delete(userEventDocRef);

        // Remove user event-plan
        const userEventPlanDocRef = firebaseFirestore.doc(
          `/users/${userId}/event-plans/${params.eventId}`
        );
        transaction.delete(userEventPlanDocRef);

        // Remove user event-plan availabilities
        const eventPlanAvailabilitiesDocRef = firebaseFirestore.doc(
          `/event-plans/${params.eventId}/availabilities/${userId}`
        );
        transaction.delete(eventPlanAvailabilitiesDocRef);
      }

      // Updating event guestByUserId field
      const updatedGuestsByUserId = params.eventGuests.map(
        (eventGuest) => eventGuest.uid
      );
      transaction.update(eventDocRef, {
        guestsByUserId: updatedGuestsByUserId,
      });

      // update event-plan inviteesByUserId field
      const eventPlanDocRef = firebaseFirestore.doc(
        `/event-plans/${params.eventId}`
      );
      transaction.update(eventPlanDocRef, {
        inviteesByUserId: updatedGuestsByUserId,
      });
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
