import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

const debug = Debug('wya-api:etl/firebase/delete-user-record');

type EtlFirebaseDeleteUserRecordParams = {
  uid: string;
};

type EtlFirebaseDeleteUserRecordContext = {
  firebase: firebaseAdmin.app.App;
};

export const etlFirebaseDeleteUserRecord = async (
  params: EtlFirebaseDeleteUserRecordParams,
  context: EtlFirebaseDeleteUserRecordContext
) => {
  const { uid } = params;

  assert(uid);

  debug(`Deleting user record: ${uid}`);

  try {
    const { firebase } = context;
    const firebaseFirestore = firebase.firestore();

    const userRecordRef = firebaseFirestore.doc(`/users/${uid}`);
    await firebaseFirestore.recursiveDelete(userRecordRef);
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseDeleteUserRecord:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
