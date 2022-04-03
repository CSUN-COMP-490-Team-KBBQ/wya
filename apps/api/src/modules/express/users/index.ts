import { Router } from 'express';

import { functions, firebaseClient } from '../../firebase';
import { etlUsersCreate } from '../../etl/users/create';
import { etlUsersDelete } from '../../etl/users/delete';

const router = Router();

router.post('/create', async (req, res, next) => {
  const logger = functions.logger;

  const { email, password, firstName, lastName } = req.body;

  try {
    const { data } = await etlUsersCreate(
      { email, password, firstName, lastName },
      { firebaseClientInjection: firebaseClient },
      { debug: logger.info }
    );

    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/delete', async (req, res, next) => {
  const logger = functions.logger;

  const { uid } = req.body;

  try {
    await etlUsersDelete(
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
