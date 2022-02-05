import assert from 'assert';
import { Router } from 'express';

import {
  etlFirebaseCreateNewUser,
  etlFirebaseCreateNewUserRecord,
} from 'wya-api';

const router = Router();

router.post('/', async (req, res) => {
  const logger = req.app.locals.functions.logger;
  const { email, password, firstName, lastName } = req.body;
  try {
    // Create the user

    const { data } = await etlFirebaseCreateNewUser({ email, password });
    const uid = data?.uid;
    assert(uid);

    // Create the user record

    await etlFirebaseCreateNewUserRecord({
      uid,
      email,
      firstName,
      lastName,
    });

    res.status(200).send({
      data: { uid },
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }
});

export default router;
