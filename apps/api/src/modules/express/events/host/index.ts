import { Router } from 'express';

import { firebaseClient, functions } from '../../../firebase';
import { etlEventsHostDeleteGuests } from '../../../etl/events/host/deleteGuests';

const router = Router();

router.post('/delete-guests', async (req, res, next) => {
  const logger = functions.logger;

  const { eventId, hostId, guestsByUserId } = req.body;

  try {
    await etlEventsHostDeleteGuests(
      { eventId, hostId, guestsByUserId },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default router;
