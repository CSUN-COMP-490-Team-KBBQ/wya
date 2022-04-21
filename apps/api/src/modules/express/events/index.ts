import { Router } from 'express';

import { functions, firebaseClient } from '../../firebase';
import { etlEventsCreate } from '../../etl/events/create';
import { etlEventsDelete } from '../../etl/events/delete';
import guestsRouter from './guests';

const router = Router();

router.post('/create', async (req, res, next) => {
  const logger = functions.logger;

  const {
    eventPlanId,
    hostId,
    day,
    dailyStartTime,
    dailyEndTime,
    startDate,
    endDate,
  } = req.body;

  try {
    const { data } = await etlEventsCreate(
      {
        eventPlanId,
        hostId,
        day,
        dailyStartTime,
        dailyEndTime,
        startDate,
        endDate,
      },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );

    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/delete', async (req, res, next) => {
  const logger = functions.logger;

  const { eventId, userId, hostId } = req.body;

  try {
    await etlEventsDelete(
      { eventId, userId, hostId },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

router.use('/guests', guestsRouter);

export default router;
