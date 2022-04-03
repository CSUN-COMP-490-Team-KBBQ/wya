import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { UserId } from '../../../interfaces';
import { makeApiError } from '../../../../lib/errors';

type Params = {
  uid: UserId;
};

type Context = {
  firebaseClientInjection: App;
};

export const etlUsersDelete = async (
  params: Params,
  context: Context,
  { debug = Debug('api:etl/users/delete') as any } = {}
) => {
  assert(params.uid, makeApiError(409, 'User is required'));

  debug(`Deleting a user: ${JSON.stringify(params, null, 4)}`);

  const firebaseAuth = getFirebaseAuth(context.firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(
    context.firebaseClientInjection
  );
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Invalid context')
  );

  try {
    debug(`Deleting user authentication`);
    await firebaseAuth.deleteUser(params.uid);

    debug(`Deleteing user document`);
    const userDocumentRef = firebaseFirestore.doc(`/users/${params.uid}`);
    await firebaseFirestore.recursiveDelete(userDocumentRef);
  } catch (err: any) {
    debug(err);
    throw makeApiError(500, 'Unable to delete user', err);
  }

  debug('Done');
};
