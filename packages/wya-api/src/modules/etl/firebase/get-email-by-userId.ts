import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

import { UserId } from '../../../interfaces';

const debug = Debug('wya-api:etl/firebase/get-email-by-userId');

type EtlFirebaseGetEmailByUserIdParams = {
  userId: UserId;
};

type EtlFirebaseGetEmailByUserIdContext = {
  firebaseClientInjection: firebaseAdmin.app.App;
};

export const etlFirebaseGetEmailByUserId = async (
  params: EtlFirebaseGetEmailByUserIdParams,
  context: EtlFirebaseGetEmailByUserIdContext
) => {
  const { userId } = params;

  assert(userId);

  debug(`Getting user by userId: ${userId}`);

  try {
    const { firebaseClientInjection } = context;
    const firebaseAuth = firebaseClientInjection.auth();

    const { email } = await firebaseAuth.getUser(userId);

    return {
      data: [email as string],
    };
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseGetUserByUserId:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
