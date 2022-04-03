import { functions } from './modules/firebase';
import app from './modules/express/app';

export const api = functions.https.onRequest(app);
