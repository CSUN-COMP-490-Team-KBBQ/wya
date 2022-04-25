import { Router } from 'express';
import { authenticate } from '../../../../auth';
import { etlEventPlansAvailabilitiesUpdate } from '../../../etl/event-plans/availabilities/update';

import { firebaseClient, functions } from '../../../firebase';

const router = Router();

router.post('/update', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlEventPlansAvailabilitiesUpdate(
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

export default router;
