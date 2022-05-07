import {
  getAuth as getFirebaseAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  updatePassword,
} from 'firebase/auth';

import app from './index';

const firebaseAuth = getFirebaseAuth(app);

export const logIn = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    signInWithEmailAndPassword(firebaseAuth, email, password)
      .then((userCreds) => {
        resolve(userCreds.user);
      })
      .catch(reject);
  });
};

export const logOut = (): Promise<void> => {
  return signOut(firebaseAuth);
};

export const passwordReset = (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    sendPasswordResetEmail(firebaseAuth, email).then(resolve).catch(reject);
  });
};

export const changePassword = (newPassword: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!firebaseAuth.currentUser) {
      reject('User is required');
    } else {
      updatePassword(firebaseAuth.currentUser, newPassword)
        .then(resolve)
        .catch(reject);
    }
  });
};

export default firebaseAuth;
