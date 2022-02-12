export * as functions from 'firebase-functions';

import { makeFirebaseClient } from 'wya-api';

export const firebase = makeFirebaseClient();
export const auth = firebase.auth();
export const firestore = firebase.firestore();
