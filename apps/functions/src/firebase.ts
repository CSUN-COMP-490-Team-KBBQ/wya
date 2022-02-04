import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const firebase = admin.initializeApp();
const firestore = admin.firestore(firebase);
const auth = admin.auth(firebase);

export { firebase, firestore, auth, functions };
