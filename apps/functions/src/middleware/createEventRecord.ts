import { RequestHandler } from 'express';

const createEventRecord: RequestHandler = async (req, res, next) => {
    const functions = req.app.locals.functions;
    const firestore: FirebaseFirestore.Firestore = req.app.locals.firestore;
    const { eventId } = req.body;

    /**
     * Adding the field for finalizing an event here as a temp solution because
     * of time contraints to MVP.
     *
     * A proper solution will be planned and implemented at a later date.
     *
     */
    req.body.isFinalized = false;
    req.body.rsvp = [];

    try {
        functions.logger.info('Creating event document');
        const eventDocRef = firestore.doc(`/events/${eventId}`);
        await eventDocRef.create(req.body);
        next();
    } catch (e) {
        functions.logger.error(e);
        res.status(500).json({
            name: 'ERROR/FIRESTORE',
            message: 'Error creating event record',
        });
    }
};

export default createEventRecord;
