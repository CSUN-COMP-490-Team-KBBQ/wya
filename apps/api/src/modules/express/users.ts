import assert from 'assert';
import { Router } from 'express';

import { makeApiError } from '../../../lib/errors';
import { functions, firebaseClient } from '../firebase';
import { etlCreateNewUser } from '../etl/create-new-user';
import { etlCreateNewUserDocument } from '../etl/create-new-user-document';

const router = Router();

router.post('/create', async (req, res, next) => {
  const logger = functions.logger;

  const { email, password, firstName, lastName } = req.body;

  // Rough validation of request body
  try {
    assert(email, makeApiError(409, 'Email is required'));
    assert(password, makeApiError(409, 'Password is required'));
  } catch (err) {
    logger.error(err);
    next(err);
  }

  let uid;

  try {
    ({
      data: [uid],
    } = await etlCreateNewUser(
      { email, password },
      { firebaseClientInjection: firebaseClient }
    ));
    assert(uid, makeApiError(422, 'Failed to create a new user'));
  } catch (err) {
    logger.error(err);
    next(err);
  }

  try {
    if (!uid) {
      throw makeApiError(422, 'User is required');
    }
    await etlCreateNewUserDocument(
      {
        uid,
        email,
        firstName,
        lastName,
      },
      { firebaseClientInjection: firebaseClient }
    );
  } catch (err) {
    logger.error(err);
    next(err);
  }

  res.status(200).json({ data: [uid] });
});

router.delete('/', async (req, res) => {
  res.sendStatus(200);
});

export default router;
