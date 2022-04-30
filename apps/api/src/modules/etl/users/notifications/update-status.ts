import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { NOTIFICATION_STATUS } from '../../../../interfaces';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../../lib/errors';
import { validate } from '../../../../../lib/validate';
import { authorize, AuthContext } from '../../../../auth';

type Params = {
  status: NOTIFICATION_STATUS;
  notificationId: string;
};

export const etlUsersNotificationsUpdateStatus = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/users/notifications/update-status') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['status', 'notificationId'],
      properties: {
        status: {
          enum: [NOTIFICATION_STATUS.SEEN],
        },
        notificationId: {
          type: 'string',
        },
      },
    },
    params,
    makeApiError(400, 'Bad request')
  );

  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(firebaseFirestore, makeApiError(422, 'Bad firebase client'));

  assert(context.user && context.user.uid, makeApiError(422, 'Invalid user'));

  const data = {};
  const errors: JSON_API_ERROR[] = [];

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const notificationDocRef = firebaseFirestore.doc(
        `/users/${context.user?.uid}/notifications/${params.notificationId}`
      );
      const notification = (await transaction.get(notificationDocRef)).data();

      assert(
        notification && notification.uid === context.user?.uid,
        makeApiError(422, 'Invalid notification')
      );

      authorize('etl/users/notifications/update-status', context, notification);

      const currentStatus: NOTIFICATION_STATUS = notification.status;
      const intendedStatus = params.status;

      // Explicitly enumerating the valid status updates that are allowed
      if (
        currentStatus === NOTIFICATION_STATUS.UNSEEN &&
        intendedStatus === NOTIFICATION_STATUS.SEEN
      ) {
        // Ok
      } else {
        throw makeApiError(
          422,
          `Unable to set status from ${currentStatus} to ${intendedStatus}`
        );
      }

      debug(
        `Updating notification ${notification.uid} status from ${currentStatus} to ${intendedStatus}`
      );
      transaction.update(notificationDocRef, { status: intendedStatus });
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
  }

  return { data, errors };
};
