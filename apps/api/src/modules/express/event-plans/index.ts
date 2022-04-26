import { Router } from 'express';

import { functions, firebaseClient } from '../../firebase';
import { authenticate } from '../../../auth';
import { etlEventPlansCreate } from '../../etl/event-plans/create';
import { etlEventPlansDelete } from '../../etl/event-plans/delete';
import { etlEventPlansUpdate } from '../../etl/event-plans/update';
import { etlEventPlansUpdateInvitees } from '../../etl/event-plans/update-invitees';

const router = Router();

router.post('/create', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data } = await etlEventPlansCreate(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data });
  } catch (err) {
    return next(err);
  }
});

router.post('/delete', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data } = await etlEventPlansDelete(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data });
  } catch (err) {
    return next(err);
  }
});

router.post('/update', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlEventPlansUpdate(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

router.post('/update-invitees', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlEventPlansUpdateInvitees(
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
