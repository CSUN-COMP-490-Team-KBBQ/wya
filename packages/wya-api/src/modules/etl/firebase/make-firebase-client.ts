import { initializeApp, ServiceAccount, cert, App } from 'firebase-admin/app';

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
