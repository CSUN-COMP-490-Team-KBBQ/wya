import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import {
  FirestorePath,
  TimeFormat,
  User,
  UserAvailabilityHeatMapDocument,
  UserRecordDocument,
} from '../../../interfaces';

const debug = Debug('wya-api:etl/firebase/create-new-user-record');

type EtlFirebaseCreateNewUserRecordParams = User & {
  firstName?: string;
  lastName?: string;
};

type EtlFirebaseCreateNewUserRecordContext = {
  firebaseClientInjection: App;
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
    const { firebaseClientInjection } = context;
    const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);

    await firebaseFirestore.runTransaction(async (transaction) => {
      // Create user record
      const userRecordRef = firebaseFirestore.doc(
        `/${FirestorePath.USERS}/${uid}`
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
        `/${FirestorePath.USERS}/${uid}/${FirestorePath.USER_HEAT_MAP_AVAILABILITY}`
      );
      await transaction.create(userHeatMapAvailabilityDocRef, {
        //TODO: Create empty user availability heat map here
        // This is the default heatmap that represents a user's weekly availability
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
          raw_error: err,
        },
      ],
    };
  }
};
