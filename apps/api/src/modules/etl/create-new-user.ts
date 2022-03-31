import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import {
  Email,
  UserDocument,
  UserAvailabilityHeatMapDocument,
  TIME_FORMAT,
  UserId,
} from '../../interfaces';
import { makeApiError } from '../../../lib/errors';

type Params = {
  email: Email;
  password: string;

  firstName?: string;
  lastName?: string;
};

type Context = {
  firebaseClientInjection: App;
};

export const etlCreateNewUser = async (
  params: Params,
  context: Context,
  { debug = Debug('api:etl/create-new-user') as any } = {}
) => {
  assert(params.email, makeApiError(409, 'Email is required'));
  assert(params.password, makeApiError(409, 'Password is required'));

  const firebaseAuth = getFirebaseAuth(context.firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(
    context.firebaseClientInjection
  );
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Invalid context')
  );

  debug(`Creating a new user: ${JSON.stringify(params, null, 4)}`);

  let uid: UserId;
  try {
    ({ uid } = await firebaseAuth.createUser({
      email: params.email,
      password: params.password,
    }));
  } catch (err: any) {
    debug(err);
    throw makeApiError(500, 'Unable to create user', err);
  }

  const userDocumentPatch: UserDocument = {
    uid,
    email: params.email,
    firstName: params.firstName ?? 'Guest',
    lastName: params.lastName ?? 'User',
    timeFormat: TIME_FORMAT.TWELVE_HOURS,
  };

  const userAvailabilityHeatMapDocumentPatch: UserAvailabilityHeatMapDocument =
    {
      data: [],
    };

  try {
    assert(userDocumentPatch.uid, makeApiError(422, 'User is required'));

    await firebaseFirestore.runTransaction(async (transaction) => {
      // Create the user document
      const userDocumentRef = firebaseFirestore.doc(`/users/${uid}`);
      await transaction.create(userDocumentRef, userDocumentPatch);

      // Create the user availabilites heat-map
      const userAvailabilityHeatMapDocRef = firebaseFirestore.doc(
        `/users/${uid}/availabilities/heat-map`
      );
      await transaction.create(
        userAvailabilityHeatMapDocRef,
        userAvailabilityHeatMapDocumentPatch
      );
      // NOTE: There are two other subcollections that pertain to the user
      // document (event-plans and events), however there is no way to
      // create an emtpy subcollection.
    });
  } catch (err: any) {
    debug(err);
    throw makeApiError(500, 'Unable to create user document', err);
  }

  debug('Done');
  return {
    data: {
      uid,
      userDocument: userDocumentPatch,
      userAvailabilityHeatMapDocument: userAvailabilityHeatMapDocumentPatch,
    },
  };
};
