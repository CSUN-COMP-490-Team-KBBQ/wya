import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { AuthContext, authorize } from '../../../auth';
import { validate } from '../../../../lib/validate';
import {
  makeApiError,
  parseApiError,
  JSON_API_ERROR,
} from '../../../../lib/errors';
import { EventId } from '../../../interfaces';

type Params = {
  eventId: EventId;
  name: string;
  description: string;
};

export const etlEventsUpdate = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/events/update') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['eventId'],
      properties: {
        eventId: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
    params,
    makeApiError(400, 'Bad request')
  );

  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(firebaseFirestore, makeApiError(422, 'Bad firebase client'));

  const data: Partial<Params> = {};
  const errors: JSON_API_ERROR[] = [];

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      const eventDocRef = firebaseFirestore.doc(`/events/${params.eventId}`);
      const event = (await transaction.get(eventDocRef)).data();

      authorize('etl/events/update', context, event);

      // Only updating the name and description so we don't accidentally alter
      // the eventId
      ({ name: data.name, description: data.description } = params);

      debug(`Updating event ${JSON.stringify(data, null, 4)}`);

      transaction.update(eventDocRef, data);
    });
  } catch (err: any) {
    errors.push(parseApiError(err));
  }

  debug('Done');
  return {
    data,
    errors,
  };
};
