import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventId } from '../../../../interfaces';
import { AuthContext, authorize } from '../../../../auth';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../../lib/errors';
import { validate } from '../../../../../lib/validate';
import { etlEventsDeleteGuests } from '../delete-guests';

type Params = {
  eventId: EventId;
};

export const etlEventsGuestsDelete = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/events/guests/delete') as any,
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
      },
    },
    params,
    makeApiError(400, 'Bad request')
  );

  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(firebaseFirestore, makeApiError(422, 'Bad firebase client'));

  const errors: JSON_API_ERROR[] = [];

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      assert(context.user?.uid, makeApiError(422, 'Invalid user'));

      const [event, eventGuest] = (
        await transaction.getAll(
          ...[
            firebaseFirestore.doc(`/events/${params.eventId}`),
            firebaseFirestore.doc(
              `/events/${params.eventId}/guests/${context.user.uid}`
            ),
          ]
        )
      ).map((ref) => ref.data());

      assert(event, makeApiError(422, 'Invalid event'));
      assert(eventGuest, makeApiError(422, 'Invalid event guest'));

      authorize('etl/events/guests/delete', context, eventGuest);

      // HACK execute this etl functions on behalf of the host
      await etlEventsDeleteGuests(
        {
          eventId: params.eventId,
          guestsByUserId: [context.user.uid],
        },
        { user: { uid: event.hostId, email: undefined } },
        { firebaseClientInjection }
      );
      // End of HACK
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
  }

  debug('Done');

  return { data: {}, errors };
};
