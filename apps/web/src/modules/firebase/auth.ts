import {
  getAuth as getFirebaseAuth,
  sendPasswordResetEmail as firebaseAuthSendPasswordResetEmail,
  signInWithEmailAndPassword as firebaseAuthSignInWithEmailAndPassword,
  signOut,
  updatePassword as firebaseAuthUpdatePassword,
} from 'firebase/auth';

import app from './index';

const firebaseAuth = getFirebaseAuth(app);

export const logIn = async (email: string, password: string) => {
  try {
    const { user } = await firebaseAuthSignInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    return user;
  } catch (err: any) {
    console.error(err);
    // TODO: Handle all error cases here
    if (err.code === 'auth/wrong-password') {
      const e = new Error('Incorrect password') as Error & {
        statusCode: number;
      };
      e.statusCode = 422;

      throw e;
    }
    throw err;
  }
};

export const logOut = (): Promise<void> => {
  return signOut(firebaseAuth);
};

export const sendPasswordResetEmail = async (email: string) => {
  try {
    await firebaseAuthSendPasswordResetEmail(firebaseAuth, email);
  } catch (err: any) {
    console.error(err);

    if (err.code === 'auth/user-not-found') {
      // TODO: Should make api error similar to how its done on api
      const e = new Error('User not found.') as Error & { statusCode: number };
      e.statusCode = 422;

      throw e;
    }

    throw err;
  }
};

export const changePassword = async (newPassword: string) => {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) {
      const e = new Error('User is required') as Error & { statusCode: number };
      e.statusCode = 422;

      throw e;
    }

    await firebaseAuthUpdatePassword(user, newPassword);
  } catch (err: any) {
    console.error(err);

    if (err.statusCode === 422) {
      throw err;
    }

    throw err;
  }
};

export default firebaseAuth;
