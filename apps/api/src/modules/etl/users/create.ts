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
} from '../../../interfaces';
import { ApiError, makeApiError } from '../../../../lib/errors';
import { validate } from '../../../../lib/validate';
import { authorize, AuthContext } from '../../../auth';

type Params = {
  email: Email;
  password: string;

  firstName?: string;
  lastName?: string;
};

export const etlUsersCreate = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/users/create') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
      },
      additionalProperties: false,
    },
    params,
    makeApiError(400, 'Bad request')
  );

  authorize('etl/users/create', context, {});

  const firebaseAuth = getFirebaseAuth(firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Bad firebase client')
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
    await firebaseFirestore.runTransaction(async (transaction) => {
      // Create the user document
      const userDocumentRef = firebaseFirestore.doc(`/users/${uid}`);
      await transaction.create(userDocumentRef, userDocumentPatch);

      // Create the user availabilites schedule-selector
      const userAvailabilityHeatMapDocRef = firebaseFirestore.doc(
        `/users/${uid}/availabilities/schedule-selector`
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
    if (err instanceof ApiError) {
      throw err;
    }
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
