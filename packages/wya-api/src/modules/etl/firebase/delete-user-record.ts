import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

import { UserId } from './@typings';

const debug = Debug('wya-api:etl/firebase/delete-user-record');

type EtlFirebaseDeleteUserRecordParams = {
  uid: UserId;
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

    const userRecordRef = firebaseFirestore.doc(`/${process.env.USERS}/${uid}`);
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
