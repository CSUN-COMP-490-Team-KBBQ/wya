import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';

import { Email } from '../../../interfaces';

const debug = Debug('wya-api:etl/firebase/get-user-by-email');

type EtlFirebaseGetUserByEmailParams = {
  email: Email;
};

type EtlFirebaseGetUserByEmailContext = {
  firebaseClientInjection: App;
};

export const etlFirebaseGetUserByEmail = async (
  params: EtlFirebaseGetUserByEmailParams,
  context: EtlFirebaseGetUserByEmailContext
) => {
  const { email } = params;

  assert(email);

  debug(`Getting user by email: ${email}`);

  try {
    const { firebaseClientInjection } = context;
    const firebaseAuth = getFirebaseAuth(firebaseClientInjection);

    const { uid } = await firebaseAuth.getUserByEmail(email);
    return {
      data: [uid],
    };
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseGetUserByEmail:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
