import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { UserId } from '../../../../interfaces';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../../lib/errors';
import { validate } from '../../../../../lib/validate';
import { authorize, AuthContext } from '../../../../auth';

type Params = {
  friendByUserId: UserId;
};

export const etlUsersFriendsDelete = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/users/friends/delete') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['friendByUserId'],
      properties: {
        friendByUserId: {
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

  const errors: JSON_API_ERROR[] = [];

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const userFriendDocRef = firebaseFirestore.doc(
        `/users/${context.user?.uid}/friends/${params.friendByUserId}`
      );
      const userFriend = (await transaction.get(userFriendDocRef)).data();

      assert(
        userFriend,
        makeApiError(
          422,
          `User is already not friends with ${params.friendByUserId}`
        )
      );

      authorize('etl/users/friends/delete', context, userFriend);

      debug(
        `User ${context.user?.uid} removing ${params.friendByUserId} as a friend`
      );

      transaction.delete(userFriendDocRef);
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
  }

  return { data: {}, errors };
};
