import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import { uniq, without, pick } from 'lodash/fp';

import {
  EventId,
  EVENT_GUEST_STATUS,
  EVENT_ROLE,
  UserId,
} from '../../../interfaces';
import { AuthContext, authorize } from '../../../auth';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../lib/errors';
import { validate } from '../../../../lib/validate';

const PROPERTIES_FROM_EVENT = [
  'name',
  'description',
  'startDate',
  'endDate',
  'dailyStartTime',
  'dailyEndTime',
  'day',
  'eventId',
];

type Params = {
  eventId: EventId;
  guestsByUserId: UserId[];
};

export const etlEventsUpdateGuests = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/events/update-guests') as any,
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

  const upsertGuestsByUserId: UserId[] = [];
  for (const userId of params.guestsByUserId) {
    try {
      await firebaseAuth.getUser(userId);
      upsertGuestsByUserId.push(userId);
    } catch (err: any) {
      errors.push(parseApiError(err));
    }
  }

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventDocRef = firebaseFirestore.doc(`/events/${params.eventId}`);

      const event = (await transaction.get(eventDocRef)).data();
      assert(event, makeApiError(422, 'Invalid event'));

      authorize('etl/events/update-guests', context, event);

      const existingGuestsByUserId: UserId[] = event?.guestsByUserId ?? [];

      // New guests are guests that are those being upserted without already
      // being an existing guest
      const newGuestsByUserId: UserId[] = without(
        existingGuestsByUserId,
        upsertGuestsByUserId
      );

      const newGuests: {
        [guestId: UserId]: { firstName: string; lastName: string; uid: UserId };
      } = (
        await transaction.getAll(
          ...newGuestsByUserId.map((guestId) =>
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

      // Create event guest doc for each new guest
      for (const [_guestUid, guest] of Object.entries(newGuests)) {
        const eventGuestsDocRef = firebaseFirestore.doc(
          `/events/${params.eventId}/guests/${guest.uid}`
        );
        const eventGuestsDocPatch = {
          uid: guest.uid,
          firstName: guest.firstName,
          lastName: guest.lastName,
          status: EVENT_GUEST_STATUS.PENDING,
        };

        transaction.create(eventGuestsDocRef, eventGuestsDocPatch);
      }

      // Create user event doc for each new guest
      for (const [_guestUid, guest] of Object.entries(newGuests)) {
        const userEventsDocRef = firebaseFirestore.doc(
          `/users/${guest.uid}/events/${params.eventId}`
        );
        const userEventsDocPatch = {
          ...pick(PROPERTIES_FROM_EVENT, event),

          role: EVENT_ROLE.GUEST,
          status: EVENT_GUEST_STATUS.PENDING,
        };

        transaction.create(userEventsDocRef, userEventsDocPatch);
      }

      // Update event guests
      data.guestsByUserId = uniq([
        ...existingGuestsByUserId,
        ...newGuestsByUserId,
      ]);

      transaction.update(eventDocRef, data);
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
  }

  debug('Done');

  return { data, errors };
};
