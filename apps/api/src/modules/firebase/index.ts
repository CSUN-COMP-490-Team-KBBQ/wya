export * as functions from 'firebase-functions';
import { initializeApp, ServiceAccount, cert, App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

export const makeFirebaseClient = (
  serviceAccountPathOrObject?: string | ServiceAccount
): App => {
  if (serviceAccountPathOrObject) {
    return initializeApp({
      credential: cert(serviceAccountPathOrObject),
    });
  }
  return initializeApp();
};

export const firebaseClient = makeFirebaseClient();
export const auth = getFirebaseAuth(firebaseClient);
export const firestore = getFirebaseFirestore(firebaseClient);
