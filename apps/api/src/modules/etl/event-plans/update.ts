import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import { omitBy, isNil } from 'lodash/fp';

import { AuthContext, authorize } from '../../../auth';
import { validate } from '../../../../lib/validate';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../lib/errors';
import { EventPlanId } from '../../../interfaces';

type Params = {
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
  eventPlanId: EventPlanId;
};

export const etlEventPlansUpdate = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/event-plans/update') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['eventPlanId'],
      properties: {
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        dailyStartTime: {
          type: 'string',
        },
        dailyEndTime: {
          type: 'string',
        },
        startDate: {
          type: 'string',
        },
        endDate: { type: 'string' },
        eventPlanId: { type: 'string' },
      },
      additionalProperties: false,
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
      const eventPlanDocRef = firebaseFirestore.doc(
        `/event-plans/${params.eventPlanId}`
      );
      const eventPlanDoc = (await transaction.get(eventPlanDocRef)).data();

      authorize('etl/event-plans/update', context, eventPlanDoc);

      debug(`Updating event-plan: ${JSON.stringify(params, null, 4)}`);

      ({
        name: data.name,
        description: data.description,
        dailyStartTime: data.dailyStartTime,
        dailyEndTime: data.dailyEndTime,
        startDate: data.startDate,
        endDate: data.endDate,
        eventPlanId: data.eventPlanId,
      } = params);

      transaction.update(eventPlanDocRef, omitBy(isNil, data));

      // TODO: Notify invitees of any changes to the date / times
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
