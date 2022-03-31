import { functions } from './modules/firebase';
import app from './modules/express';

export const api = functions.https.onRequest(app);
