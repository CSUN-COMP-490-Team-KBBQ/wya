import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

const debug = Debug('wya-api:etl/firebase/get-user-by-email');

type etlFirebaseGetUserByEmailParams = {
  email: string;
};

type etlFirebaseGetUserByEmailContext = {
  firebase: firebaseAdmin.app.App;
};

export const etlFirebaseGetUserByEmail = async (
  params: etlFirebaseGetUserByEmailParams,
  context: etlFirebaseGetUserByEmailContext
) => {
  const { email } = params;

  assert(email);

  debug(`Getting user by email: ${email}`);

  try {
    const { firebase } = context;
    const firebaseAuth = firebase.auth();

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