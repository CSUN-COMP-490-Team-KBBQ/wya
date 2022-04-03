import { Router } from 'express';

import { functions } from '../firebase';

const router = Router();

router.post('/', async (req, res) => {
  const logger = functions.logger;

  logger.info(req.body);
  res.status(200).json({ ...req.body });
});

export default router;
