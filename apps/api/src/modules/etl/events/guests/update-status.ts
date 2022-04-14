import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { UserId, EVENT_GUEST_STATUS, EventId } from '../../../../interfaces';
import { ApiError, makeApiError } from '../../../../../lib/errors';

type Params = {
  status: EVENT_GUEST_STATUS;
  uid: UserId;
  eventId: EventId;
};

type Context = {
  firebaseClientInjection: App;
};

const _validate = (params: Params) => {
  for (const [key, value] of Object.entries(params)) {
    assert(value || value === '', makeApiError(400, `${key} is required`));
  }
};

export const etlEventsGuestsUpdateStatus = async (
  params: Params,
  context: Context,
  { debug = Debug('api:etl/events/guests/update-status') as any } = {}
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

  debug('Updating event guests status');
  debug(params);

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventDocRef = firebaseFirestore.doc(`/events/${params.eventId}`);
      const eventDoc = (await transaction.get(eventDocRef)).data();
      assert(eventDoc, makeApiError(422, 'Invalid event'));

      const eventGuestDocRef = firebaseFirestore.doc(
        `/events/${params.eventId}/guests/${params.uid}`
      );
      const eventGuestDoc = (await transaction.get(eventGuestDocRef)).data();
      assert(eventGuestDoc, makeApiError(422, 'Invalid event guest'));

      // Make sure user is a guest in the event
      const isGuest =
        ((eventDoc.guestsByUserId as UserId[]) || []).includes(params.uid) &&
        eventGuestDoc.uid === params.uid;
      assert(isGuest, makeApiError(422, 'User must be a guest'));

      const { status: currentStatus } = eventGuestDoc;
      const { status: intendedStatus } = params;

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
        `/users/${params.uid}/events/${params.eventId}`
      );
      transaction.update(usersEventsDocRef, statusPatch);
    });
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to update event guests', err);
  }
};
