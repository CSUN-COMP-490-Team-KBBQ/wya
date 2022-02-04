import { RequestHandler } from 'express';
import { firestore as Firestore } from 'firebase-admin';

const updateEventHostsRecord: RequestHandler = async (req, res, next) => {
    const functions = req.app.locals.functions;
    const firestore: FirebaseFirestore.Firestore = req.app.locals.firestore;
    const { hostId, eventId, name, description, startDate, startTime } =
        req.body;
    try {
        functions.logger.info('Updating event hosts user record');
        await firestore.runTransaction(async (transaction) => {
            const docRef = firestore.doc(`/users/${hostId}`);
            const doc = await transaction.get(docRef);
            if (doc.exists) {
                await transaction.update(docRef, {
                    events: Firestore.FieldValue.arrayUnion({
                        eventId,
                        name,
                        description,
                        startDate,
                        startTime,
                        role: 'HOST',
                    }),
                });
            }
        });
        next();
    } catch (e) {
        functions.logger.error(e);
        res.status(500).json({
            name: 'ERROR/FIRESTORE',
            message: 'Error updating event hosts user record',
        });
    }
};

export default updateEventHostsRecord;
