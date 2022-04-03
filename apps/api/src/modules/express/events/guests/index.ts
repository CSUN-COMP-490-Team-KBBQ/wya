import { Router } from 'express';

import { firebaseClient, functions } from '../../../firebase';
import { etlEventsGuestsUpdate } from '../../../etl/events/guests/update';

const router = Router();

router.post('/update', async (req, res, next) => {
  const logger = functions.logger;

  const { status, uid, eventId } = req.body;

  try {
    await etlEventsGuestsUpdate(
      { status, uid, eventId },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default router;
