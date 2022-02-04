import { Router } from 'express';
import createUser from '../middleware/createUser';
import createUserRecord from '../middleware/createUserRecord';

const router = Router();

router.post('/', createUser, createUserRecord, (_req, res) => {
    const uid = res.locals.uid;
    res.status(200).send({ uid });
});

export default router;
