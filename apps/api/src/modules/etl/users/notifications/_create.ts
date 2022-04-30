import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import {
  getFirestore as getFirebaseFirestore,
  Timestamp,
} from 'firebase-admin/firestore';
import { v4 as uuid } from 'uuid';

import { UserId, NOTIFICATION_STATUS } from '../../../../interfaces';
import { makeApiError } from '../../../../../lib/errors';
import { validate } from '../../../../../lib/validate';
import { AuthContext } from '../../../../auth';

type Params = {
  uid: UserId;

  title: string;
  data?: any;
};

// NOTE: Prefixing with underscore (hungarian notation) to signify that this
// function will not be exposed by the express app and mainly used internally.
export const _etlUsersNotificationsCreate = async (
  params: Params,
  _context: AuthContext,
  {
    debug = Debug('api:etl/users/notifications/create') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['uid', 'title'],
      properties: {
        uid: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        data: {
          type: 'object',
        },
      },
    },
    params,
    makeApiError(400, 'Bad request')
  );

  const firebaseAuth = getFirebaseAuth(firebaseClientInjection);
  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(
    firebaseAuth && firebaseFirestore,
    makeApiError(422, 'Bad firebase client')
  );

  const user = await firebaseAuth.getUser(params.uid);

  assert(user, makeApiError(422, 'Invalid user'));

  debug(`Sending notification: ${JSON.stringify(params, null, 4)}`);
  await firebaseFirestore
    .doc(`/users/${params.uid}/notifications/${uuid()}`)
    .create({
      ...params,

      status: NOTIFICATION_STATUS.UNSEEN,
      createdAt: Timestamp.now(),
    });
};
