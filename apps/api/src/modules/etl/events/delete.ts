import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EventId, UserId } from '../../../interfaces';
import { etlEventPlansDelete } from '../event-plans/delete';
import { ApiError, makeApiError } from '../../../../lib/errors';
import { validate } from '../../../../lib/validate';
import { AuthContext, authorize } from '../../../auth';

type Params = {
  eventId: EventId;
};

export const etlEventsDelete = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/events/delete') as any,
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

  debug(`Deleting an event: ${JSON.stringify(params, null, 4)}`);

  const firebaseAuth = getFirebaseAuth(firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Invalid context')
  );

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventDocRef = firebaseFirestore.doc(`/events/${params.eventId}`);
      const event = (await transaction.get(eventDocRef)).data();

      assert(event, makeApiError(422, 'Invalid event'));

      authorize('etl/events/delete', context, event);

      // Not sure if we can create another transaction in the middle of
      // this transaction

      // Remove all associated event-plan docs
      await etlEventPlansDelete(
        {
          eventPlanId: params.eventId,
        },
        context,
        {
          debug,
          firebaseClientInjection,
        }
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
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to delete event');
  }

  debug('Done');

  return { data: {}, errors: [] };
};
