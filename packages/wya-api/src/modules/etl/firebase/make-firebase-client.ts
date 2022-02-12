import firebaseAdmin from 'firebase-admin';

export const makeFirebaseClient = (
  serviceAccountPathOrObject?: string | firebaseAdmin.ServiceAccount
) => {
  if (serviceAccountPathOrObject) {
    return firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccountPathOrObject),
    });
  }
  return firebaseAdmin.initializeApp();
};
