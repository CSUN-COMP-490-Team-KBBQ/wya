export * as functions from 'firebase-functions';
import { makeFirebaseClient } from 'wya-api/src/modules/etl/firebase/make-firebase-client';

export const firebaseClient = makeFirebaseClient();
export const auth = firebaseClient.auth();
export const firestore = firebaseClient.firestore();
