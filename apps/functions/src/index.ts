import { functions } from './firebase';
import app from './app';

// Using express and exposing functions as express widget
// https://firebase.google.com/docs/functions/http-events#using_existing_express_apps
export const api = functions.https.onRequest(app);
