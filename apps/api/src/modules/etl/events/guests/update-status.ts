import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { EVENT_GUEST_STATUS, EventId } from '../../../../interfaces';
import { ApiError, makeApiError } from '../../../../../lib/errors';
import { validate } from '../../../../../lib/validate';
import { authorize, AuthContext } from '../../../../auth';

type Params = {
  status: EVENT_GUEST_STATUS;
  eventId: EventId;
};

export const etlEventsGuestsUpdateStatus = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/events/guests/update-status') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['eventId', 'status'],
      properties: {
        eventId: {
          type: 'string',
        },
        status: {
          enum: [
            EVENT_GUEST_STATUS.ACCEPTED,
            EVENT_GUEST_STATUS.PENDING,
            EVENT_GUEST_STATUS.DECLINED,
          ],
        },
      },
    },
    params,
    makeApiError(400, 'Bad request')
  );

  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(firebaseFirestore, makeApiError(422, 'Invalid context'));

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventGuestDocRef = firebaseFirestore.doc(
        `/events/${params.eventId}/guests/${context.user?.uid}`
      );
      const eventGuest = (await transaction.get(eventGuestDocRef)).data();
      assert(eventGuest, makeApiError(422, 'Invalid event guest'));

      authorize('etl/events/guests/update-status', context, eventGuest);

      const { status: currentStatus } = eventGuest;
      const { status: intendedStatus } = params;

      debug(
        `Updating event guest ${context.user?.uid} status from ${currentStatus} to ${intendedStatus}`
      );

      if (currentStatus === intendedStatus) {
        return;
      }

      // Explicitly enumerating the valid status updates that are allowed
      if (
        currentStatus === EVENT_GUEST_STATUS.PENDING &&
        intendedStatus === EVENT_GUEST_STATUS.ACCEPTED
      ) {
        // Ok
      } else if (
        currentStatus === EVENT_GUEST_STATUS.PENDING &&
        intendedStatus === EVENT_GUEST_STATUS.DECLINED
      ) {
        // Ok
      } else if (
        currentStatus === EVENT_GUEST_STATUS.ACCEPTED &&
        intendedStatus === EVENT_GUEST_STATUS.DECLINED
      ) {
        // Ok
      } else if (
        currentStatus === EVENT_GUEST_STATUS.DECLINED &&
        intendedStatus === EVENT_GUEST_STATUS.ACCEPTED
      ) {
        // Ok
      } else {
        throw makeApiError(
          422,
          `Unable to set status from ${currentStatus} to ${intendedStatus}`
        );
      }
      const statusPatch = { status: intendedStatus };
      transaction.update(eventGuestDocRef, statusPatch);

      // Update in the users/events doc as well
      const usersEventsDocRef = firebaseFirestore.doc(
        `/users/${context.user?.uid}/events/${params.eventId}`
      );
      transaction.update(usersEventsDocRef, statusPatch);
    });
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to update event guests', err);
  }

  debug('Done');

  return { data: {}, errors: [] };
};
