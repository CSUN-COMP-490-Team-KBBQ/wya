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

export const etlFirebaseCreateNewUserRecord = (
  params: CreateNewUserRecordParams,
  { firebaseFirestoreInjection = firebaseFirestore } = {}
) => {
  const { uid, email, firstName, lastName } = params;

  assert(uid);
  assert(email);

  debug(`Creating a new user record: ${uid} ${email}`);

  return firebaseFirestoreInjection.doc(`/users/${uid}`).create({
    uid,
    email,
    firstName: firstName ?? 'Guest',
    lastName: lastName ?? 'Guest',
    timeFormat24Hr: false,
    events: [],
    availability: [],
  });
};
