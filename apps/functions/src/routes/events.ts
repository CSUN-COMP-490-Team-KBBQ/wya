import { Router } from 'express';
import { etlFirebaseCreateNewEventFinalized } from 'wya-api';

import { firebase } from '../firebase';

const router = Router();

router.post('/create', async (req, res) => {
  const logger = req.app.locals.functions.logger;
  const { 'g-recaptcha-response': token, ...restOfReqBody } = req.body;

  try {
    res
      .status(200)
      .json(
        await etlFirebaseCreateNewEventFinalized(restOfReqBody, { firebase })
      );
  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }
});

// router.delete('/', async (req, res) => {
//   const logger = req.app.locals.functions.logger;
//   const { eventPlanId } = req.body;

//   try {
//     await etlFirebaseDeleteEventFinalized({ eventId }, { firebase });
//     res.sendStatus(200);
//   } catch (err) {
//     logger.error(err);
//     res.status(500).json(err);
//   }
// });

export default router;
