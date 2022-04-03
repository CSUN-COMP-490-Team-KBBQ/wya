import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';

const debug = Debug('wya-api:etl/firebase/create-new-user');

type Email = string;

type EtlFirebaseCreateNewUserParams = {
  email: Email;
  password: string;
};

type EtlFirebaseCreateNewUserContext = {
  firebaseClientInjection: App;
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
    const firebaseAuth = getFirebaseAuth(firebaseClientInjection);
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
