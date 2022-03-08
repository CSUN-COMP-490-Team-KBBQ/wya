import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

import { Email } from '../../../interfaces';

const debug = Debug('wya-api:etl/firebase/create-new-user');

type EtlFirebaseCreateNewUserParams = {
  email: Email;
  password: string;
};

type EtlFirebaseCreateNewUserContext = {
  firebaseClientInjection: firebaseAdmin.app.App;
};

export const etlFirebaseCreateNewUser = async (
  params: EtlFirebaseCreateNewUserParams,
  context: EtlFirebaseCreateNewUserContext
) => {
  const { email, password } = params;

  assert(email);
  assert(password);

  debug(`Creating a new user: ${email}`);

  try {
    const { firebaseClientInjection } = context;
    const firebaseAuth = firebaseClientInjection.auth();
    const { uid } = await firebaseAuth.createUser({ email, password });
    assert(uid);

    return {
      data: [uid],
    };
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseCreateNewUser:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
