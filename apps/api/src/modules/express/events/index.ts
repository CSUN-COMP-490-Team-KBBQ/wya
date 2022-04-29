import { Router } from 'express';

import guestsRouter from './guests';
import { authenticate } from '../../../auth';
import { functions, firebaseClient } from '../../firebase';
import { etlEventsCreate } from '../../etl/events/create';
import { etlEventsDelete } from '../../etl/events/delete';
import { etlEventsUpdate } from '../../etl/events/update';
import { etlEventsDeleteGuests } from '../../etl/events/delete-guests';
import { etlEventsUpdateGuests } from '../../etl/events/update-guests';

const router = Router();

router.post('/create', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data } = await etlEventsCreate(params, context, {
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

    const { data, errors } = await etlEventsDelete(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

router.post('/update', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlEventsUpdate(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

router.post('/delete-guests', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlEventsDeleteGuests(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

router.post('/update-guests', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlEventsUpdateGuests(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

router.use('/guests', guestsRouter);

export default router;
