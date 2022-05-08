import {
  getAuth as getFirebaseAuth,
  sendPasswordResetEmail as firebaseAuthSendPasswordResetEmail,
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

export const sendPasswordResetEmail = async (email: string) => {
  try {
    await firebaseAuthSendPasswordResetEmail(firebaseAuth, email);
  } catch (err: any) {
    console.log(err);

    if (err.code === 'auth/user-not-found') {
      // TODO: Should make api error similar to how its done on api
      const e = new Error('User not found.') as Error & { statusCode: number };
      e.statusCode = 422;

      throw e;
    }

    throw err;
  }
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
