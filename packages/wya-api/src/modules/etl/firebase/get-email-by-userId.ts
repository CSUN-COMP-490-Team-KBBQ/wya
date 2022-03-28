import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';

const debug = Debug('wya-api:etl/firebase/get-email-by-userId');

type UserId = string;

type EtlFirebaseGetEmailByUserIdParams = {
  userId: UserId;
};

type EtlFirebaseGetEmailByUserIdContext = {
  firebaseClientInjection: App;
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
    const firebaseAuth = getFirebaseAuth(firebaseClientInjection);

    const { email } = await firebaseAuth.getUser(userId);

    return {
      data: [email],
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
