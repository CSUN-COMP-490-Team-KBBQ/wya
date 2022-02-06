// firebase exports

import firebaseAdmin from 'firebase-admin';

const firebase = firebaseAdmin.initializeApp();
const firebaseFirestore = firebaseAdmin.firestore(firebase);
const firebaseAuth = firebaseAdmin.auth(firebase);

export { firebase, firebaseFirestore, firebaseAuth };

export * from './create-new-user';
export * from './create-new-user-record';
