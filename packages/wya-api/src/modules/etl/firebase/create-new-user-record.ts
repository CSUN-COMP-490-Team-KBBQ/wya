import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

const debug = Debug('wya-api:etl/firebase/create-new-user-record');

type CreateNewUserRecordParams = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type CreateNewUserRecordContext = {
  firebase: firebaseAdmin.app.App;
};

export const etlFirebaseCreateNewUserRecord = async (
  params: CreateNewUserRecordParams,
  context: CreateNewUserRecordContext
) => {
  const { uid, email, firstName, lastName } = params;

  assert(uid);
  assert(email);

  debug(`Creating a new user record: ${uid} ${email}`);

  try {
    const { firebase } = context;
    const firebaseFirestore = firebase.firestore();
    await firebaseFirestore.doc(`/users/${uid}`).create({
      uid,
      email,
      firstName: firstName ?? 'Guest',
      lastName: lastName ?? 'Guest',
      timeFormat24Hr: false,
      events: [],
      availability: [],
    });

    return {
      data: [],
    };
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseCreateNewUserRecord:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
