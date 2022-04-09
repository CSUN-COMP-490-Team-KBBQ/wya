import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import {
  EventPlanId,
  EVENT_GUEST_STATUS,
  EVENT_ROLE,
  UserId,
} from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';

type Params = {
  eventPlanId: EventPlanId;
  hostId: UserId;

  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
};

type Context = {
  firebaseClientInjection: App;
};

const _validate = (params: Params) => {
  for (const [key, value] of Object.entries(params)) {
    assert(value || value === '', makeApiError(409, `${key} is required`));
  }
};

export const etlEventsCreate = async (
  params: Params,
  context: Context,
  { debug = Debug('api:etl/events/create') as any } = {}
) => {
  _validate(params);

  const firebaseAuth = getFirebaseAuth(context.firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(
    context.firebaseClientInjection
  );
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Invalid context')
  );

  debug('Creating event');
  debug(params);

  const { eventPlanId, hostId, ...restOfParams } = params;
  const patches = {
    events: [] as { [EventId: string]: {} }[],
    eventGuests: [] as { [UserId: string]: {} }[],
    usersEvents: [] as { [EventId: string]: {} }[],
  };
  let eventId;

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventPlanDocRef = firebaseFirestore.doc(
        `/event-plans/${eventPlanId}`
      );

      const eventPlan = (await transaction.get(eventPlanDocRef)).data();
      assert(eventPlan, makeApiError(422, 'Invalid event plan'));
      assert(hostId === eventPlan.hostId, makeApiError(401, 'Unauthorized'));

      const { inviteesByUserId, name, description } = eventPlan as {
        inviteesByUserId: UserId[];
        name: string;
        description: string;
      };

      // Using the same uuid for both event-plans and their finalized events
      eventId = eventPlanId;
      const eventDocRef = firebaseFirestore.doc(`/events/${eventId}`);
      const eventDocPatch = {
        ...restOfParams,
        eventId,
        hostId,
        name,
        description,
        guestsByUserId: [...inviteesByUserId],
      };

      transaction.create(eventDocRef, eventDocPatch);

      patches.events.push({ [eventId]: eventDocPatch });

      for (const userId of inviteesByUserId) {
        const eventGuestsDocRef = firebaseFirestore.doc(
          `/events/${eventId}/guests/${userId}`
        );
        const eventGuestsDocPatch = {
          uid: userId,
          status: EVENT_GUEST_STATUS.PENDING,
        };

        transaction.create(eventGuestsDocRef, eventGuestsDocPatch);

        patches.eventGuests.push({ [userId]: eventGuestsDocPatch });
      }

      // Associate the event to the guest users
      for (const userId of inviteesByUserId) {
        const userEventsDocRef = firebaseFirestore.doc(
          `/users/${userId}/events/${eventPlanId}`
        );
        const userEventsDocPatch = {
          ...restOfParams,
          eventId,
          name,
          description,
          role: EVENT_ROLE.GUEST,
          status: EVENT_GUEST_STATUS.PENDING,
        };

        transaction.create(userEventsDocRef, userEventsDocPatch);

        patches.usersEvents.push({ [eventId]: userEventsDocPatch });
      }

      // Associate the event to the host user
      const hostUserEventsDocRef = firebaseFirestore.doc(
        `/users/${hostId}/events/${eventId}`
      );
      const hostUserEventsDocPatch = {
        ...restOfParams,
        eventId,
        name,
        description,
        role: EVENT_ROLE.HOST,
        // Assuming that the host is going to their own event
        status: EVENT_GUEST_STATUS.ACCEPTED,
      };

      transaction.create(hostUserEventsDocRef, hostUserEventsDocPatch);

      patches.usersEvents.push({ [eventId]: hostUserEventsDocPatch });
    });

    debug(patches);
    debug('Done');
    return {
      data: [eventId],
    };
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to create event', err);
  }
};
