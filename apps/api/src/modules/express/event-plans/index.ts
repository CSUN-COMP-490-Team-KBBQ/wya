import { Router } from 'express';

import { functions, firebaseClient } from '../../firebase';
import { etlEventPlansCreate } from '../../etl/event-plans/create';

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

export default router;
