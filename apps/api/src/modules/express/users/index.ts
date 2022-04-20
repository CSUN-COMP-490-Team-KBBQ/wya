import { Router } from 'express';

import { functions, firebaseClient } from '../../firebase';
import { etlUsersCreate } from '../../etl/users/create';
import { etlUsersDelete } from '../../etl/users/delete';
import { authenticate } from '../../../auth';

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
    next(err);
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
    next(err);
  }

  res.sendStatus(200);
});

export default router;
