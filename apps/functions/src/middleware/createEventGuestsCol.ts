import { RequestHandler } from 'express';

const createEventGuestsCol: RequestHandler = async (req, res, next) => {
    const functions = req.app.locals.functions;
    const firestore: FirebaseFirestore.Firestore = req.app.locals.firestore;
    const guestUIDs: string[] = res.locals.guestUIDs;
    const { eventId } = req.body;

    try {
        functions.logger.info('Creating event guest subcollection');
        const batch = firestore.batch();
        // we check if uid is truthy because one of the possible values is ''
        guestUIDs.forEach((uid) => {
            if (uid) {
                batch.create(
                    firestore.doc(`/events/${eventId}/guests/${uid}`),
                    {
                        uid,
                        status: 'PENDING',
                    }
                );
            }
        });
        await batch.commit();
        next();
    } catch (e) {
        functions.logger.error(e);
        res.status(500).json({
            name: 'ERROR/FIRESTORE',
            message: 'Error creating event guest subcollection',
        });
    }
};

export default createEventGuestsCol;
