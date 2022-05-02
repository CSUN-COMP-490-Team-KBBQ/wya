import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import {
  DocumentData,
  getFirestore as getFirebaseFirestore,
} from 'firebase-admin/firestore';

import { Email, UserId, FRIEND_REQUEST_STATUS } from '../../../../interfaces';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../../lib/errors';
import { validate } from '../../../../../lib/validate';
import { authorize, AuthContext } from '../../../../auth';

type Params = {
  sendToUsersByEmail: Email[];
};

export const etlUsersSendFriendRequestsCreate = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/users/send-friend-requests/create') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['sendToUsersByEmail'],
      properties: {
        sendToUsersByEmail: {
          type: 'array',
        },
      },
    },
    params,
    makeApiError(400, 'Bad request')
  );

  authorize('etl/users/send-friend-requests/create', context, {});

  const firebaseAuth = getFirebaseAuth(firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Bad firebase client')
  );

  assert(context.user && context.user.uid, makeApiError(422, 'Invalid user'));

  const data: {
    [userId: UserId]: {
      uid: UserId;

      fromUid: UserId;
      fromFirstName: string;
      fromLastName: string;

      status: FRIEND_REQUEST_STATUS;
    };
  } = {};
  const errors: JSON_API_ERROR[] = [];

  const sendToUsersByUserId: UserId[] = [];
  for (const email of params.sendToUsersByEmail) {
    try {
      const { uid } = await firebaseAuth.getUserByEmail(email);
      sendToUsersByUserId.push(uid);
    } catch (err: any) {
      errors.push(parseApiError(err));
    }
  }

  if (sendToUsersByUserId.length == 0) {
    return { data, errors };
  }

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const fromUser = (
        await transaction.get(
          firebaseFirestore.doc(`/users/${context.user?.uid}`)
        )
      ).data();

      assert(fromUser?.uid, makeApiError(422, 'Invalid user'));

      const sendToUsers: DocumentData[] = (
        await transaction.getAll(
          ...sendToUsersByUserId.map((userId) =>
            firebaseFirestore.doc(`/users/${userId}`)
          )
        )
      ).reduce(
        (acc, curr) => (curr.data() ? [...acc, curr.data()] : acc),
        [] as any
      );

      const existingSentFriendRequests: { [userId: UserId]: boolean } = (
        await transaction.getAll(
          ...sendToUsersByUserId.map((userId) =>
            firebaseFirestore.doc(
              `/users/${context.user?.uid}/send-friend-requests/${userId}`
            )
          )
        )
      ).reduce((acc, curr) => {
        const data = curr.data();
        if (data && data.toUid) {
          return {
            ...acc,
            [data.toUid]: true,
          };
        } else {
          return { ...acc };
        }
      }, {});

      const existingReceivedFriendRequests: { [userId: UserId]: boolean } = (
        await transaction.getAll(
          ...sendToUsersByUserId.map((userId) =>
            firebaseFirestore.doc(
              `/users/${context.user?.uid}/receive-friend-requests/${userId}`
            )
          )
        )
      ).reduce((acc, curr) => {
        const data = curr.data();
        if (data && data.fromUid) {
          return {
            ...acc,
            [data.fromUid]: true,
          };
        } else {
          return { ...acc };
        }
      }, {});

      const existingFriends: { [userId: UserId]: boolean } = (
        await transaction.getAll(
          ...sendToUsersByUserId.map((userId) =>
            firebaseFirestore.doc(
              `/users/${context.user?.uid}/friends/${userId}`
            )
          )
        )
      ).reduce((acc, curr) => {
        const data = curr.data();
        if (data && data.friendUid) {
          return {
            ...acc,
            [data.friendUid]: true,
          };
        } else {
          return { ...acc };
        }
      }, {});

      // Create the receive friend request doc for each user we are requesting
      // friendship from
      for (const toUser of sendToUsers) {
        // Don't send a friend request to someone we already sent a friend request to
        if (existingSentFriendRequests[toUser.uid]) {
          const err = makeApiError(
            422,
            `Friend request already sent to User ${toUser.uid}!`
          );
          errors.push(parseApiError(err));
          continue;
        }

        // Don't send a friend request to someone who sent a friend request to us
        if (existingReceivedFriendRequests[toUser.uid]) {
          const err = makeApiError(
            422,
            `User ${toUser.uid} already requested to be friends!`
          );
          errors.push(parseApiError(err));
          continue;
        }

        // Don't send a friend request to someone we are already friends with
        if (existingFriends[toUser.uid]) {
          const err = makeApiError(422, `Already friends with ${toUser.uid}!`);
          errors.push(parseApiError(err));
          continue;
        }

        assert(toUser.uid, makeApiError(422, 'Invalid user'));

        const receiveFriendRequestData = {
          uid: toUser.uid,

          fromUid: fromUser.uid,
          fromFirstName: fromUser.firstName,
          fromLastName: fromUser.lastName,

          status: FRIEND_REQUEST_STATUS.PENDING,
        };

        transaction.create(
          firebaseFirestore.doc(
            `/users/${toUser.uid}/receive-friend-requests/${fromUser.uid}`
          ),
          receiveFriendRequestData
        );

        data[toUser.uid] = receiveFriendRequestData;

        debug(`Sent friend request from ${fromUser.uid} to ${toUser.uid}`);
      }

      // Create the send friend request doc for each user we are requesting
      // friendship from
      for (const toUser of sendToUsers) {
        // Don't send a friend request to someone we already sent a friend request to
        if (existingSentFriendRequests[toUser.uid]) {
          const err = makeApiError(
            422,
            `Friend request already sent to User ${toUser.uid}!`
          );
          errors.push(parseApiError(err));
          continue;
        }

        // Don't send a friend request to someone who sent a friend request to us
        if (existingReceivedFriendRequests[toUser.uid]) {
          const err = makeApiError(
            422,
            `User ${toUser.uid} already requested to be friends!`
          );
          errors.push(parseApiError(err));
          continue;
        }

        // Don't send a friend request to someone we are already friends with
        if (existingFriends[toUser.uid]) {
          const err = makeApiError(422, `Already friends with ${toUser.uid}!`);
          errors.push(parseApiError(err));
          continue;
        }

        assert(toUser.uid, makeApiError(422, 'Invalid user'));

        const sendFriendRequestsData = {
          uid: fromUser.uid,

          toUid: toUser.uid,
          toFirstName: toUser.firstName,
          toLastName: toUser.lastName,

          status: FRIEND_REQUEST_STATUS.PENDING,
        };

        transaction.create(
          firebaseFirestore.doc(
            `/users/${fromUser.uid}/send-friend-requests/${toUser.uid}`
          ),
          sendFriendRequestsData
        );
      }
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
  }

  debug(
    `Done creating friend requests: ${JSON.stringify(
      { data, errors },
      null,
      4
    )}`
  );

  return { data, errors };
};
