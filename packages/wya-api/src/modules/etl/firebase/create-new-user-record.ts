import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

import {
  UserAvailabilityHeatMapDocument,
  UserRecordDocument,
  User,
} from '../../../interfaces';
import { TimeFormat } from '../../../lib/time-format';

const debug = Debug('wya-api:etl/firebase/create-new-user-record');

type EtlFirebaseCreateNewUserRecordParams = User & {
  firstName?: string;
  lastName?: string;
};

type EtlFirebaseCreateNewUserRecordContext = {
  firebase: firebaseAdmin.app.App;
};

export const etlFirebaseCreateNewUserRecord = async (
  params: EtlFirebaseCreateNewUserRecordParams,
  context: EtlFirebaseCreateNewUserRecordContext
) => {
  const { uid, email, firstName, lastName } = params;

  assert(uid);
  assert(email);

  debug(`Creating a new user record: ${uid} ${email}`);

  try {
    const { firebase } = context;
    const firebaseFirestore = firebase.firestore();

    await firebaseFirestore.runTransaction(async (transaction) => {
      // Create user record
      const userRecordRef = firebaseFirestore.doc(
        `/${process.env.USERS}/${uid}`
      );
      await transaction.create(userRecordRef, {
        uid,
        email,
        firstName: firstName ?? 'Guest',
        lastName: lastName ?? 'Guest',
        timeFormat: TimeFormat.TWELVE_HOURS,
      } as UserRecordDocument);

      // Create user availabilities sub collection
      const userHeatMapAvailabilityDocRef = firebaseFirestore.doc(
        `/${process.env.USERS}/${uid}/${process.env.USER_HEAT_MAP_AVAILABILITY}`
      );
      await transaction.create(userHeatMapAvailabilityDocRef, {
        // New availability
        data: [],
      } as UserAvailabilityHeatMapDocument);

      // Create user event plans sub collection -- can't actually have an empty collection
      // Create user events sub collection -- can't actually have an empty collection
    });

    return {
      data: [uid],
    };
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseCreateNewUserRecord:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
