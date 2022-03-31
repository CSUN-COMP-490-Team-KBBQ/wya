import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';

import { Email } from '../../interfaces';
import { makeApiError } from '../../../lib/errors';

const debug = Debug('api:etl/create-new-user');

type Params = {
  email: Email;
  password: string;
};

type Context = {
  firebaseClientInjection: App;
};

export const etlCreateNewUser = async (params: Params, context: Context) => {
  assert(params.email, makeApiError(409, 'Email is required'));
  assert(params.password, makeApiError(409, 'Password is required'));

  debug(`Creating a new user: ${JSON.stringify(params, null, 4)}`);

  const firebaseAuth = getFirebaseAuth(context.firebaseClientInjection);
  assert(firebaseAuth, makeApiError(422, 'Invalid context'));

  try {
    const { uid } = await firebaseAuth.createUser({
      email: params.email,
      password: params.password,
    });
    assert(uid);
    debug('Done');
    return {
      data: [uid],
    };
  } catch (err: any) {
    debug(err);
    throw makeApiError(500, 'Unable to create user', err);
  }
};
