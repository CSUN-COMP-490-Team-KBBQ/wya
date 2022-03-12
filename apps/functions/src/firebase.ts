export * as functions from 'firebase-functions';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import { makeFirebaseClient } from 'wya-api/src/modules/etl/firebase/make-firebase-client';

export const firebaseClient = makeFirebaseClient();
export const auth = getFirebaseAuth(firebaseClient);
export const firestore = getFirebaseFirestore(firebaseClient);
