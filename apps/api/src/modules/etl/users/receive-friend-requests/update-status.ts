import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { UserId, FRIEND_REQUEST_STATUS } from '../../../../interfaces';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../../lib/errors';
import { validate } from '../../../../../lib/validate';
import { authorize, AuthContext } from '../../../../auth';

type Params = {
  status: FRIEND_REQUEST_STATUS;
  fromUid: UserId;
};

export const etlUsersReceiveFriendRequestsUpdateStatus = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/users/receive-friend-requests/update-status') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          enum: [
            FRIEND_REQUEST_STATUS.ACCEPTED,
            FRIEND_REQUEST_STATUS.DECLINED,
          ],
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
      // Get the friend request that was sent to this user
      const sendersFriendRequestDocRef = firebaseFirestore.doc(
        `/users/${params.fromUid}/send-friend-requests/${context.user?.uid}`
      );
      const sendersFriendRequest = (
        await transaction.get(sendersFriendRequestDocRef)
      ).data();
      assert(
        sendersFriendRequest && sendersFriendRequest.uid === params.fromUid,
        makeApiError(422, 'Invalid friend request sent')
      );

      // Get the friend request that was received by this user
      const receivedFriendRequestDocRef = firebaseFirestore.doc(
        `/users/${context.user?.uid}/receive-friend-requests/${params.fromUid}`
      );
      const receivedFriendRequest = (
        await transaction.get(receivedFriendRequestDocRef)
      ).data();
      assert(
        receivedFriendRequest &&
          receivedFriendRequest.uid === context.user?.uid,
        makeApiError(422, 'Invalid friend request received')
      );

      authorize(
        'etl/users/receive-friend-requests/update-status',
        context,
        receivedFriendRequest
      );

      const currentStatus: FRIEND_REQUEST_STATUS = receivedFriendRequest.status;
      const intendedStatus = params.status;

      let addFriend = false;
      // Explicitly enumerating the valid status updates that are allowed
      if (
        currentStatus === FRIEND_REQUEST_STATUS.PENDING &&
        intendedStatus === FRIEND_REQUEST_STATUS.ACCEPTED
      ) {
        // Ok

        addFriend = true;
      } else if (
        currentStatus === FRIEND_REQUEST_STATUS.PENDING &&
        intendedStatus === FRIEND_REQUEST_STATUS.DECLINED
      ) {
        // Ok
      } else {
        throw makeApiError(
          422,
          `Unable to set status from ${currentStatus} to ${intendedStatus}`
        );
      }

      if (addFriend) {
        // Add friend doc to our friends collection
        transaction.create(
          firebaseFirestore.doc(
            `/users/${receivedFriendRequest.uid}/friends/${sendersFriendRequest.uid}`
          ),
          {
            uid: receivedFriendRequest.uid,

            friendUid: receivedFriendRequest.fromUid,
            friendFirstName: receivedFriendRequest.fromFirstName,
            friendLastName: receivedFriendRequest.fromLastName,
          }
        );

        // Add friend doc to sender's friends collection
        transaction.create(
          firebaseFirestore.doc(
            `/users/${sendersFriendRequest.uid}/friends/${receivedFriendRequest.uid}`
          ),
          {
            uid: sendersFriendRequest.uid,

            friendUid: sendersFriendRequest.toUid,
            friendFirstName: sendersFriendRequest.toFirstName,
            friendLastName: sendersFriendRequest.toLastName,
          }
        );
      }

      // Clean up the friend requests
      transaction.delete(sendersFriendRequestDocRef);
      transaction.delete(receivedFriendRequestDocRef);
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
  }

  return { data, errors };
};
