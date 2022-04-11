import { Router } from 'express';

import { functions, firebaseClient } from '../../firebase';
import { etlEventPlansCreate } from '../../etl/event-plans/create';
import { etlEventPlansDelete } from '../../etl/event-plans/delete';

const router = Router();

router.post('/create', async (req, res, next) => {
  const logger = functions.logger;

  const {
    name,
    description,
    dailyStartTime,
    dailyEndTime,
    startDate,
    endDate,
    hostId,
    invitees,
  } = req.body;

  try {
    const { data } = await etlEventPlansCreate(
      {
        name,
        description,
        dailyStartTime,
        dailyEndTime,
        startDate,
        endDate,
        hostId,
        invitees,
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

  const { eventPlanId, hostId } = req.body;

  try {
    await etlEventPlansDelete(
      { eventPlanId, hostId },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default router;
