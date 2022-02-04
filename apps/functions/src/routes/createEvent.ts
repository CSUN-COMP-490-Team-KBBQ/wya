import { Router } from 'express';
import createEventGuestsCol from '../middleware/createEventGuestsCol';
import createEventRecord from '../middleware/createEventRecord';
import emailEventGuests from '../middleware/emailEventGuests';
import updateEventGuestsRecord from '../middleware/updateEventGuestsRecord';
import updateEventHostsRecord from '../middleware/updateEventHostsRecord';
import fetchEventGuestsUID from '../middleware/fetchEventGuestsUID';

const router = Router();

router.post(
    '/',
    createEventRecord,
    fetchEventGuestsUID,
    createEventGuestsCol,
    updateEventGuestsRecord,
    updateEventHostsRecord,
    emailEventGuests,
    (req, res) => {
        res.status(200).json(req.body);
    }
);

export default router;
