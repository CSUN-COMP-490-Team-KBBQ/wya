import {
  getAuth,
  signOut,
  signInWithEmailAndPassword,
  User,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';
import axios, { AxiosResponse } from 'axios';
import { UserId } from '../../../../packages/wya-api/src/interfaces';

import app from './firebase';

const auth = getAuth(app);

export const logIn = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCreds) => {
        resolve(userCreds.user);
      })
      .catch(reject);
  });
};

export const logOut = (): Promise<void> => {
  return signOut(auth);
};

export const registerUser = (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AxiosResponse<{ data: UserId[] }>> => {
  return axios.post(
    `${process.env.REACT_APP_FIREBASE_CLOUD_FUNCTIONS_URL}/api/users/create`,
    JSON.stringify(data),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

export const passwordReset = (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    sendPasswordResetEmail(auth, email)
      .then(() => resolve())
      .catch(reject);
  });
};

export const changePassword = (newPassword: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line
    updatePassword(auth.currentUser!, newPassword)
      .then(() => resolve())
      .catch(reject);
  });
};

export default auth;
