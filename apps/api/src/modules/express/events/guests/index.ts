import { Router } from 'express';

import { firebaseClient, functions } from '../../../firebase';
import { etlEventsGuestsUpdateStatus } from '../../../etl/events/guests/update-status';
import { etlEventsGuestsUpdate } from '../../../etl/events/guests/update';

import { etlEventsGuestsDelete } from '../../../etl/events/guests/delete';

const router = Router();

router.post('/update-status', async (req, res, next) => {
  const logger = functions.logger;

  const { status, uid, eventId } = req.body;

  try {
    await etlEventsGuestsUpdateStatus(
      { status, uid, eventId },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

router.post('/update', async (req, res, next) => {
  const logger = functions.logger;

  const { eventId, hostId, eventGuests } = req.body;

  try {
    await etlEventsGuestsUpdate(
      { eventId, hostId, eventGuests },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

router.post('/delete', async (req, res, next) => {
  const logger = functions.logger;

  const { eventId, userId } = req.body;

  try {
    await etlEventsGuestsDelete(
      { eventId, userId },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default router;
