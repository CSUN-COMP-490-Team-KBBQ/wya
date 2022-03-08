import { Router } from 'express';
import {
  etlFirebaseDeleteEventPlan,
  etlFirebaseCreateNewEventPlan,
} from 'wya-api/src/modules/etl/firebase';

import { firebaseClient } from '../firebase';

const router = Router();

router.post('/create', async (req, res) => {
  const logger = req.app.locals.functions.logger;
  const { 'g-recaptcha-response': token, ...restOfReqBody } = req.body;

  try {
    res.status(200).json(
      await etlFirebaseCreateNewEventPlan(restOfReqBody, {
        firebaseClientInjection: firebaseClient,
      })
    );
  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }
});

router.delete('/', async (req, res) => {
  const logger = req.app.locals.functions.logger;
  const { eventPlanId } = req.body;

  try {
    await etlFirebaseDeleteEventPlan(
      { eventPlanId },
      { firebaseClientInjection: firebaseClient }
    );
    res.sendStatus(200);
  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }
});

export default router;
