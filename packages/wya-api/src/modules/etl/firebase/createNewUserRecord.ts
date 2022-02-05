import assert from 'assert';
import Debug from 'debug';

import { firebaseFirestore } from '../firebase';

const debug = Debug('wya-api:etl/firebase/createNewUserRecord');

type CreateNewUserRecordParams = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export const etlFirebaseCreateNewUserRecord = async (
  params: CreateNewUserRecordParams,
  { firebaseFirestoreInjection = firebaseFirestore } = {}
) => {
  const { uid, email, firstName, lastName } = params;

  assert(uid);
  assert(email);

  debug(`Creating a new user record: ${uid} ${email}`);

  try {
    await firebaseFirestoreInjection.doc(`/users/${uid}`).create({
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
  } catch (err) {
    return {
      errors: [
        {
          status: '500',
          code: 'etlFirebaseCreateNewUserRecord',
        },
      ],
    };
  }
};
