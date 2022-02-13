import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

const debug = Debug('wya-api:etl/firebase/delete-user');

type EtlFirebaseDeleteUserParams = {
  uid: string;
};

type EtlFirebaseDeleteUserContext = {
  firebase: firebaseAdmin.app.App;
};

export const etlFirebaseDeleteUser = async (
  params: EtlFirebaseDeleteUserParams,
  context: EtlFirebaseDeleteUserContext
) => {
  const { uid } = params;

  assert(uid);

  debug(`Deleting user: ${uid}`);

  try {
    const { firebase } = context;
    const firebaseAuth = firebase.auth();

    await firebaseAuth.deleteUser(uid);

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
