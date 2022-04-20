import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import {
  makeApiError,
  parseApiError,
  JSON_API_ERROR,
} from '../../../../lib/errors';
import { validate } from '../../../../lib/validate';
import { AuthContext, authorize } from '../../../auth';
import { TIME_FORMAT } from '../../../interfaces';

type Params = {
  intendedTimeFormat: string;
};

export const etlUsersUpdateTimeFormat = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/users/update-time-format') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['intendedTimeFormat'],
      properties: {
        intendedTimeFormat: {
          enum: [TIME_FORMAT.TWELVE_HOURS, TIME_FORMAT.TWENTY_FOUR_HOURS],
        },
      },
    },
    params,
    makeApiError(400, 'Bad request')
  );

  assert(context.user?.uid, makeApiError(422, 'Invalid user'));

  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);

  const data: { timeFormat?: string } = {};
  const errors: JSON_API_ERROR[] = [];

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const userDocRef = firebaseFirestore.doc(`/users/${context.user?.uid}`);
      const userDoc = (await transaction.get(userDocRef)).data();

      authorize('etl/users/update-time-format', context, userDoc);

      debug(
        `Updating timeFormat from ${userDoc?.timeFormat} to ${params.intendedTimeFormat} for ${context.user?.uid}`
      );

      transaction.update(userDocRef, { timeFormat: params.intendedTimeFormat });

      data.timeFormat = params.intendedTimeFormat;
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
    throw err;
  }

  debug('Done');

  return {
    data,
    errors,
  };
};
