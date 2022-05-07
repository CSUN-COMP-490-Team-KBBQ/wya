// import {
//   getAuth,
//   signOut,
//   sendPasswordResetEmail,
//   updatePassword,
// } from 'firebase/auth';

// import app from './firebase';

// const auth = getAuth(app);

// export const logOut = (): Promise<void> => {
//   return signOut(auth);
// };

// export const passwordReset = (email: string): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     sendPasswordResetEmail(auth, email).then(resolve).catch(reject);
//   });
// };

// export const changePassword = (newPassword: string): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     // eslint-disable-next-line
//     updatePassword(auth.currentUser!, newPassword).then(resolve).catch(reject);
//   });
// };

// export default auth;

// TODO: Deprecate this file and delete

export {};
