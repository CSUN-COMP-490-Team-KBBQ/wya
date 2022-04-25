import { Router } from 'express';

import { functions, firebaseClient } from '../../firebase';
import { etlUsersCreate } from '../../etl/users/create';
import { etlUsersDelete } from '../../etl/users/delete';
import { authenticate } from '../../../auth';
import { etlUsersUpdateTimeFormat } from '../../etl/users/update-time-format';

const router = Router();

router.post('/create', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data } = await etlUsersCreate(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    res.status(200).json({ data });
  } catch (err) {
    return next(err);
  }
});

router.post('/delete', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    await etlUsersDelete(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });
  } catch (err) {
    return next(err);
  }

  res.sendStatus(200);
});

router.post('/update-time-format', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlUsersUpdateTimeFormat(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

export default router;
