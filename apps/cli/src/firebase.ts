import assert from 'assert';
import path from 'path';
import { Command } from 'commander';

import {
  generatePassword,
  etlFirebaseCreateNewUser,
  etlFirebaseCreateNewUserRecord,
  etlFirebaseDeleteUser,
  makeFirebaseClient,
} from 'wya-api';

const firebaseClient = makeFirebaseClient(
  path.resolve(
    __dirname,
    '../../../',
    'kbbq-wya-35414-firebase-adminsdk-aznz0-ad159e5865.json'
  )
);

const firebase = new Command('firebase');

/** Create New User */
firebase
  .command('create-new-user <email> [password]')
  .alias('cnu')
  .description('Create a new user')
  .action(async (email, password) => {
    assert(email);

    if (!password) {
      password = generatePassword();
    }
    assert(password);

    try {
      // Create the user
      const {
        data: [uid],
      } = await etlFirebaseCreateNewUser(
        { email, password },
        { firebase: firebaseClient }
      );

      // Create the user record
      await etlFirebaseCreateNewUserRecord(
        {
          uid,
          email,
        },
        { firebase: firebaseClient }
      );

      console.log(
        `Generated new user ${uid} email: ${email} | password: ${password}`
      );
    } catch (err) {
      console.error(err);
    }
  });

/** Delete User */
firebase
  .command('delete-user <uid>')
  .alias('du')
  .description('Delete existing user')
  .action(async (uid) => {
    assert(uid);

    try {
      await etlFirebaseDeleteUser({ uid }, { firebase: firebaseClient });

      console.log(`Deleted user: ${uid}`);
    } catch (err) {
      console.error(err);
    }
  });

export default firebase;
