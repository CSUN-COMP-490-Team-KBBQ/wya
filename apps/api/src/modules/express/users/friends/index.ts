import { Router } from 'express';

import { firebaseClient, functions } from '../../../firebase';
import { authenticate } from '../../../../auth';
import { etlUsersFriendsDelete } from '../../../etl/users/friends/delete';

const router = Router();

router.post('/delete', async (req, res, next) => {
  try {
    const params = req.body;
    const context = await authenticate(req);

    const { data, errors } = await etlUsersFriendsDelete(params, context, {
      debug: functions.logger.info,
      firebaseClientInjection: firebaseClient,
    });

    return res.status(200).json({ data, errors });
  } catch (err) {
    return next(err);
  }
});

export default router;
