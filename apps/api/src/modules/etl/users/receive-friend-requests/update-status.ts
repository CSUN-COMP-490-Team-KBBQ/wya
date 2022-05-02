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
      const sender = (
        await transaction.get(firebaseFirestore.doc(`/users/${params.fromUid}`))
      ).data();
      assert(sender, makeApiError(422, 'Invalid sender'));

      const recipient = (
        await transaction.get(
          firebaseFirestore.doc(`/users/${context.user?.uid}`)
        )
      ).data();
      assert(recipient, makeApiError(422, 'Invalid recipient'));

      // Get the friend request that was sent to this user
      const sendersFriendRequestDocRef = firebaseFirestore.doc(
        `/users/${sender.uid}/send-friend-requests/${recipient.uid}`
      );
      const sendersFriendRequest = (
        await transaction.get(sendersFriendRequestDocRef)
      ).data();
      assert(
        sendersFriendRequest && sendersFriendRequest.uid === params.fromUid,
        makeApiError(422, 'Invalid friend request sent')
      );

      // Get the friend request that was received by this user
      const recipientsFriendRequestDocRef = firebaseFirestore.doc(
        `/users/${recipient.uid}/receive-friend-requests/${sender.uid}`
      );
      const recipientsFriendRequest = (
        await transaction.get(recipientsFriendRequestDocRef)
      ).data();
      assert(
        recipientsFriendRequest &&
          recipientsFriendRequest.uid === context.user?.uid,
        makeApiError(422, 'Invalid friend request received')
      );

      const isRecipientFriendsWithSender = (
        await transaction.get(
          firebaseFirestore.doc(`/users/${sender.uid}/friends/${recipient.uid}`)
        )
      ).exists;

      const isSenderFriendsWithRecipient = (
        await transaction.get(
          firebaseFirestore.doc(`/users/${recipient.uid}/friends/${sender.uid}`)
        )
      ).exists;

      authorize(
        'etl/users/receive-friend-requests/update-status',
        context,
        recipientsFriendRequest
      );

      const currentStatus: FRIEND_REQUEST_STATUS =
        recipientsFriendRequest.status;
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

      if (addFriend && !isRecipientFriendsWithSender) {
        // Add recipient to sender's friends collection
        transaction.create(
          firebaseFirestore.doc(
            `/users/${sender.uid}/friends/${recipient.uid}`
          ),
          {
            uid: sender.uid,

            friendUid: recipient.uid,
            friendFirstName: recipient.firstName,
            friendLastName: recipient.lastName,
          }
        );
      }

      if (addFriend && !isSenderFriendsWithRecipient) {
        // Add sender to recipient's friends collection
        transaction.create(
          firebaseFirestore.doc(
            `/users/${recipient.uid}/friends/${sender.uid}`
          ),
          {
            uid: recipient.uid,

            friendUid: sender.uid,
            friendFirstName: sender.firstName,
            friendLastName: sender.lastName,
          }
        );
      }

      // Clean up the friend requests
      transaction.delete(sendersFriendRequestDocRef);
      transaction.delete(recipientsFriendRequestDocRef);
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
  }

  return { data, errors };
};
