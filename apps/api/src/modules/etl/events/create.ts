import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import { pick } from 'lodash/fp';

import {
  EventPlanId,
  EventPlanDocument,
  EVENT_GUEST_STATUS,
  EVENT_ROLE,
  UserId,
} from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';
import { validate } from '../../../../lib/validate';
import { authorize, AuthContext } from '../../../auth';

const PROPERTIES_FROM_EVENT_PLAN = [
  'name',
  'description',
  'hostId',
  'startDate',
  'endDate',
  'dailyStartTime',
  'dailyEndTime',
];

type Params = {
  eventPlanId: EventPlanId;
  day: string;
};

export const etlEventsCreate = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/events/create') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['eventPlanId', 'day'],
      properties: {
        eventPlanId: {
          type: 'string',
        },
        day: {
          type: 'string',
        },
      },
    },
    params,
    makeApiError(400, 'Bad request')
  );

  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(firebaseFirestore, makeApiError(422, 'Invalid context'));

  debug(`Creating an event: ${JSON.stringify(params, null, 4)}`);

  // Using the same uuid for both event-plans and their finalized events
  const eventId = params.eventPlanId;

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventPlanDocRef = firebaseFirestore.doc(
        `/event-plans/${params.eventPlanId}`
      );

      const eventPlan = (await transaction.get(eventPlanDocRef)).data() as
        | EventPlanDocument
        | undefined;
      assert(
        eventPlan && eventPlan.hostId,
        makeApiError(422, 'Invalid event plan')
      );

      authorize('etl/events/create', context, eventPlan);

      const guestsByUserId = [...eventPlan.inviteesByUserId];

      const guests: {
        [guestId: UserId]: { firstName: string; lastName: string; uid: UserId };
      } = (
        await transaction.getAll(
          ...guestsByUserId.map((guestId) =>
            firebaseFirestore.doc(`/users/${guestId}`)
          )
        )
      ).reduce((acc, curr) => {
        const guest = curr.data();

        return guest
          ? {
              ...acc,
              [guest.uid]: {
                firstName: guest.firstName,
                lastName: guest.lastName,
                uid: guest.uid,
              },
            }
          : { ...acc };
      }, {});

      const eventDocRef = firebaseFirestore.doc(`/events/${eventId}`);
      const eventDocPatch = {
        ...pick(PROPERTIES_FROM_EVENT_PLAN, eventPlan),
        day: params.day,
        eventId,

        guestsByUserId,
      };

      transaction.create(eventDocRef, eventDocPatch);

      // Create event guest doc for each guest
      for (const userId of guestsByUserId) {
        const eventGuestsDocRef = firebaseFirestore.doc(
          `/events/${eventId}/guests/${userId}`
        );
        const eventGuestsDocPatch = {
          uid: guests[userId].uid,
          firstName: guests[userId].firstName,
          lastName: guests[userId].lastName,
          status: EVENT_GUEST_STATUS.PENDING,
        };

        transaction.create(eventGuestsDocRef, eventGuestsDocPatch);
      }

      // Create user event doc for each guest
      for (const userId of guestsByUserId) {
        const userEventsDocRef = firebaseFirestore.doc(
          `/users/${userId}/events/${eventId}`
        );
        const userEventsDocPatch = {
          ...pick(PROPERTIES_FROM_EVENT_PLAN, eventPlan),
          day: params.day,
          eventId,

          role: EVENT_ROLE.GUEST,
          status: EVENT_GUEST_STATUS.PENDING,
        };

        transaction.create(userEventsDocRef, userEventsDocPatch);
      }

      // Create user event doc for host
      const hostUserEventsDocRef = firebaseFirestore.doc(
        `/users/${eventPlan.hostId}/events/${eventId}`
      );
      const hostUserEventsDocPatch = {
        ...pick(PROPERTIES_FROM_EVENT_PLAN, eventPlan),
        day: params.day,
        eventId,

        role: EVENT_ROLE.HOST,
        // Assuming that the host is going to their own event
        status: EVENT_GUEST_STATUS.ACCEPTED,
      };

      transaction.create(hostUserEventsDocRef, hostUserEventsDocPatch);

      // Update event-plan isFinalized field
      transaction.update(eventPlanDocRef, { isFinalized: true });

      // Update user event-plan isFinalized field
      for (const userId of [...guestsByUserId, eventPlan.hostId]) {
        const userEventPlanDocRef = firebaseFirestore.doc(
          `/users/${userId}/event-plans/${params.eventPlanId}`
        );
        transaction.update(userEventPlanDocRef, { isFinalized: true });
      }
    });

    debug('Done');
    return {
      data: [eventId],
    };
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to create event', err);
  }
};
