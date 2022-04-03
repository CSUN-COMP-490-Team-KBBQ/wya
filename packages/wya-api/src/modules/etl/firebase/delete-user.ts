import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';

import { etlFirebaseDeleteUserRecord } from './delete-user-record';

const debug = Debug('wya-api:etl/firebase/delete-user');

type UserId = string;

type EtlFirebaseDeleteUserParams = {
  uid: UserId;
};

type EtlFirebaseDeleteUserContext = {
  firebaseClientInjection: App;
};

export const etlFirebaseDeleteUser = async (
  params: EtlFirebaseDeleteUserParams,
  context: EtlFirebaseDeleteUserContext
) => {
  const { uid } = params;

  assert(uid);

  debug(`Deleting user: ${uid}`);

  try {
    const { firebaseClientInjection } = context;
    const firebaseAuth = getFirebaseAuth(firebaseClientInjection);

    await firebaseAuth.deleteUser(uid);

    await etlFirebaseDeleteUserRecord({ uid }, { firebaseClientInjection });

    return {
      data: [],
    };
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseDeleteUser:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
