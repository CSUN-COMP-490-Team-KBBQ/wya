import { Router } from 'express';

import { functions, firebaseClient } from '../../firebase';
import { etlCreateNewUser } from '../../etl/create-new-user';
import { etlDeleteUser } from '../../etl/delete-user';

const router = Router();

router.post('/create', async (req, res, next) => {
  const logger = functions.logger;

  const { email, password, firstName, lastName } = req.body;

  try {
    const { data } = await etlCreateNewUser(
      { email, password, firstName, lastName },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );

    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req, res, next) => {
  const logger = functions.logger;

  const { uid } = req.body;

  try {
    await etlDeleteUser(
      { uid },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );
  } catch (err) {
    next(err);
  }

  res.sendStatus(200);
});

export default router;
