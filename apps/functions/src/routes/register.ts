import assert from 'assert';
import { Router } from 'express';

import {
  etlFirebaseCreateNewUser,
  etlFirebaseCreateNewUserRecord,
} from 'wya-api';
import { firebase } from '../firebase';

const router = Router();

router.post('/', async (req, res) => {
  const logger = req.app.locals.functions.logger;
  const { email, password, firstName, lastName } = req.body;
  try {
    // Create the user

    const {
      data: [uid],
    } = await etlFirebaseCreateNewUser({ email, password }, { firebase });
    assert(uid);

    // Create the user record

    await etlFirebaseCreateNewUserRecord(
      {
        uid,
        email,
        firstName,
        lastName,
      },
      { firebase }
    );

    res.status(200).send({
      data: { uid },
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }
});

export default router;
