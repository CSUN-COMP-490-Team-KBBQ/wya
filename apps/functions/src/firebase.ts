export * as functions from 'firebase-functions';

import { ServiceAccount } from 'firebase-admin';
import { makeFirebaseClient } from 'wya-api';

export const firebase = makeFirebaseClient(
  JSON.parse(`${process.env.FIREBASE_SERVICE_ACCOUNT}`) as ServiceAccount
);
export const auth = firebase.auth();
export const firestore = firebase.firestore();
