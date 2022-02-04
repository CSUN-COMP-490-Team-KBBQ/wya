import { RequestHandler } from 'express';

// Convert the array of guest emails into an array of guest uids
const fetchEventGuestsUID: RequestHandler = async (req, res, next) => {
    const functions = req.app.locals.functions;
    const firestore: FirebaseFirestore.Firestore = req.app.locals.firestore;
    const { guests } = req.body;

    try {
        const querySnapshot = await firestore
            .collection('users')
            .where('email', 'in', guests.length > 0 ? guests : [''])
            .get();
        /**
         * When using an array for .where('prop', 'in', array) the array must be non empty.
         *
         * INVALID_ARGUMENT: 'IN' requires an non-empty ArrayValue.
         */
        res.locals.guestUIDs = [''];
        if (!querySnapshot.empty) {
            res.locals.guestUIDs = querySnapshot.docs.map((doc) => doc.id);
        }
        next();
    } catch (e) {
        functions.logger.error(e);
        res.status(500).json({
            name: 'ERROR/FIRESTORE',
            message: 'Error querying users collection',
        });
    }
};

export default fetchEventGuestsUID;
