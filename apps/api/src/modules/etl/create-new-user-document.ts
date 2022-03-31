import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { makeApiError } from '../../../lib/errors';
import {
  UserId,
  Email,
  TIME_FORMAT,
  UserDocument,
  UserAvailabilityHeatMapDocument,
} from '../../interfaces';

const debug = Debug('api:etl/create-new-user-document');

type Params = {
  uid: UserId;
  email: Email;

  firstName?: string;
  lastName?: string;
};

type Context = {
  firebaseClientInjection: App;
};

export const etlCreateNewUserDocument = async (
  params: Params,
  context: Context
) => {
  assert(params.uid, makeApiError(409, 'User is required'));
  assert(params.email, makeApiError(409, 'Email is required'));

  debug(`Creating a new user document: ${JSON.stringify(params, null, 4)}`);

  const firebaseFirestore = getFirebaseFirestore(
    context.firebaseClientInjection
  );
  assert(firebaseFirestore, makeApiError(422, 'Invalid context'));

  const userDocumentPatch: UserDocument = {
    uid: params.uid,
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
    await firebaseFirestore.runTransaction(async (transaction) => {
      // Create the user document
      const userDocumentRef = firebaseFirestore.doc(`/users/${params.uid}`);
      await transaction.create(userDocumentRef, userDocumentPatch);

      // Create the user availabilites heat-map
      const userAvailabilityHeatMapDocRef = firebaseFirestore.doc(
        `/users/${params.uid}/availabilities/heat-map`
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
      userDocumentPatch,
      userAvailabilityHeatMapDocumentPatch,
    },
  };
};
