import assert from 'assert';
import { Router } from 'express';
import {
  etlFirebaseDeleteUser,
  etlFirebaseCreateNewUser,
  etlFirebaseCreateNewUserRecord,
} from 'wya-api';

import { firebase } from '../firebase';

const router = Router();

router.post('/create', async (req, res) => {
  const logger = req.app.locals.functions.logger;
  const { email, password, firstName, lastName } = req.body;

  try {
    const {
      data: [uid],
    } = await etlFirebaseCreateNewUser({ email, password }, { firebase });
    assert(uid);

    res.status(200).json(
      await etlFirebaseCreateNewUserRecord(
        {
          uid,
          email,
          firstName,
          lastName,
        },
        { firebase }
      )
    );
  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }
});

router.delete('/', async (req, res) => {
  const logger = req.app.locals.functions.logger;
  const { userId: uid } = req.body;

  try {
    await etlFirebaseDeleteUser({ uid }, { firebase });
    res.sendStatus(200);
  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }
});

export default router;
