import { Router } from 'express';

import { firebaseClient, functions } from '../../../firebase';
import { authenticate } from '../../../../auth';
import { etlEventsGuestsDelete } from '../../../etl/events/guests/delete';
import { etlEventsGuestsUpdateStatus } from '../../../etl/events/guests/update-status';

const router = Router();

router.post('/update-status', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlEventsGuestsUpdateStatus(
      params,
      context,
      {
        debug: functions.logger.info,
        firebaseClientInjection: firebaseClient,
      }
    );

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

router.post('/delete', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlEventsGuestsDelete(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

export default router;
