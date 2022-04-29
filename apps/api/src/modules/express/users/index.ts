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

    const { data, errors } = await etlUsersCreate(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

router.post('/delete', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlUsersDelete(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

router.post('/update-time-format', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlUsersUpdateTimeFormat(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

export default router;
