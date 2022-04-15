import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { UserId } from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';
import { validate } from '../../../../lib/validate';
import { authorize, AuthContext } from '../../../auth';

type Params = {
  uid: UserId;
};

export const etlUsersDelete = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/users/delete') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['uid'],
      properties: {
        uid: { type: 'string' },
      },
      additionalProperties: false,
    },
    params,
    makeApiError(400, 'Bad request')
  );

  authorize('etl/users/delete', context, { uid: params.uid });

  debug(`Deleting a user: ${JSON.stringify(params, null, 4)}`);

  const firebaseAuth = getFirebaseAuth(firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Bad firebase client')
  );

  try {
    debug(`Deleting user authentication`);
    await firebaseAuth.deleteUser(params.uid);

    debug(`Deleteing user document`);
    const userDocumentRef = firebaseFirestore.doc(`/users/${params.uid}`);
    await firebaseFirestore.recursiveDelete(userDocumentRef);
  } catch (err: any) {
    debug(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw makeApiError(500, 'Unable to delete user', err);
  }

  debug('Done');
};
