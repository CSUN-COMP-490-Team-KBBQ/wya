import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

const debug = Debug('wya-api:etl/firebase/delete-user-record');

type UserId = string;

type EtlFirebaseDeleteUserRecordParams = {
  uid: UserId;
};

type EtlFirebaseDeleteUserRecordContext = {
  firebaseClientInjection: App;
};

export const etlFirebaseDeleteUserRecord = async (
  params: EtlFirebaseDeleteUserRecordParams,
  context: EtlFirebaseDeleteUserRecordContext
) => {
  const { uid } = params;

  assert(uid);

  debug(`Deleting user record: ${uid}`);

  try {
    const { firebaseClientInjection } = context;
    const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);

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
