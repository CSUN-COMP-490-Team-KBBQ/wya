import { firestore, functions } from './firebase';
import app from './app';

// Using express and exposing functions as express widget
// https://firebase.google.com/docs/functions/http-events#using_existing_express_apps
export const api = functions.https.onRequest(app);

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const deleteUserRecord = functions.auth.user().onDelete(({ uid }) => {
  return firestore
    .doc(`/users/${uid}`)
    .delete()
    .then(() => {
      functions.logger.info(`User ${uid} successfully deleted.`);
    });
});
