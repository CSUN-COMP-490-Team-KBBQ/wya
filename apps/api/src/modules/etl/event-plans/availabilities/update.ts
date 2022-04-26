import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';

import { AuthContext, authorize } from '../../../../auth';
import { validate } from '../../../../../lib/validate';
import { EventPlanId } from '../../../../interfaces';
import {
  JSON_API_ERROR,
  makeApiError,
  parseApiError,
} from '../../../../../lib/errors';

type Params = {
  eventPlanId: EventPlanId;
  data: {
    [time: string]: {
      [date: string]: string[];
    };
  };
};

export const etlEventPlansAvailabilitiesUpdate = async (
  params: Params,
  context: AuthContext,
  {
    debug = Debug('api:etl/event-plans/availabilities/update') as any,
    firebaseClientInjection = undefined as App | undefined,
  } = {}
) => {
  validate(
    {
      type: 'object',
      required: ['eventPlanId'],
      properties: {
        eventPlanId: {
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

  const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);
  assert(firebaseFirestore, makeApiError(422, 'Bad firebase client'));

  const data: Partial<Params> = {};
  const errors: JSON_API_ERROR[] = [];

  try {
    await firebaseFirestore.runTransaction(async (transaction) => {
      assert(context.user?.uid, makeApiError(401, 'Invalid user'));

      const eventPlanAvailabilityDocRef = firebaseFirestore.doc(
        `/event-plans/${params.eventPlanId}/availabilities/${context.user?.uid}`
      );

      const eventPlanAvailability = (
        await transaction.get(eventPlanAvailabilityDocRef)
      ).data();

      authorize(
        'etl/event-plans/availabilities/update',
        context,
        eventPlanAvailability
      );

      debug(`Updating event-plan availability for ${context.user.uid}`);

      // Only updating the data portion, so we do not accidentally alter
      // the uid
      ({ data: data.data } = params);

      transaction.update(eventPlanAvailabilityDocRef, data);
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
