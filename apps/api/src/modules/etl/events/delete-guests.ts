import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import { difference } from 'lodash/fp';

import { EventId, UserId } from '../../../interfaces';
import { AuthContext, authorize } from '../../../auth';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../lib/errors';
import { validate } from '../../../../lib/validate';

type Params = {
  eventId: EventId;
  guestsByUserId: UserId[];
};

export const etlEventsDeleteGuests = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/events/delete-guests') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['eventId'],
      properties: {
        eventId: {
          type: 'string',
        },
        guestsByUserId: {
          type: 'array',
        },
      },
    },
    params,
    makeApiError(400, 'Bad request')
  );

  const firebaseAuth = getFirebaseAuth(firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Bad firebase client')
  );

  const data: { guestsByUserId?: UserId[] } = {};
  const errors: JSON_API_ERROR[] = [];

  const removeGuestsByUserId: UserId[] = [];
  for (const userId of params.guestsByUserId) {
    try {
      const { uid } = await firebaseAuth.getUser(userId);
      removeGuestsByUserId.push(uid);
    } catch (err: any) {
      errors.push(parseApiError(err));
    }
  }

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventDocRef = firebaseFirestore.doc(`/events/${params.eventId}`);

      const event = (await transaction.get(eventDocRef)).data();
      assert(event, makeApiError(422, 'Invalid event'));

      authorize('etl/events/delete-guests', context, event);

      const eventPlanDocRef = firebaseFirestore.doc(
        `/event-plans/${params.eventId}`
      );

      const eventPlan = (await transaction.get(eventPlanDocRef)).data();
      assert(eventPlan, makeApiError(422, 'Invalid event-plan'));

      const existingGuestsByUserId: UserId[] = event?.guestsByUserId ?? [];
      for (const userId of removeGuestsByUserId) {
        if (!existingGuestsByUserId.includes(userId)) {
          // Do nothing because userId is already not a guest
          continue;
        }

        // Delete event guest doc
        const eventGuestDocRef = firebaseFirestore.doc(
          `/events/${params.eventId}/guests/${userId}`
        );
        transaction.delete(eventGuestDocRef);

        // Delete user event doc
        const userEventDocRef = firebaseFirestore.doc(
          `/users/${userId}/events/${params.eventId}`
        );
        transaction.delete(userEventDocRef);
      }

      // Update event guests
      data.guestsByUserId = difference(
        existingGuestsByUserId,
        removeGuestsByUserId
      );

      transaction.update(eventDocRef, data);

      const existingInviteeByUserId: UserId[] =
        eventPlan?.inviteesByUserId ?? [];
      for (const userId of removeGuestsByUserId) {
        if (!existingInviteeByUserId.includes(userId)) {
          // Do nothing because userId is already not an invitee
          continue;
        }

        // eventPlanId should match the eventId
        const eventPlanId = params.eventId;

        // Delete event-plan availability doc
        const eventPlanAvailabilityDocRef = firebaseFirestore.doc(
          `/event-plans/${eventPlanId}/availabilities/${userId}`
        );
        transaction.delete(eventPlanAvailabilityDocRef);

        // Delete user event-plan doc
        const userEventPlanDocRef = firebaseFirestore.doc(
          `/users/${userId}/event-plans/${eventPlanId}`
        );
        transaction.delete(userEventPlanDocRef);
      }

      // Update event-plan invitees
      transaction.update(eventPlanDocRef, {
        inviteesByUserId: difference(
          existingInviteeByUserId,
          removeGuestsByUserId
        ),
      });
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
  }

  debug('Done');

  return { data, errors };
};
