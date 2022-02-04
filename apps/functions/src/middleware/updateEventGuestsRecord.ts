import { RequestHandler } from 'express';
import { firestore as Firestore } from 'firebase-admin';

const updateEventGuestsRecord: RequestHandler = async (req, res, next) => {
    const functions = req.app.locals.functions;
    const firestore: FirebaseFirestore.Firestore = req.app.locals.firestore;
    const { eventId, name, description, startDate, startTime } = req.body;
    const guestUIDs = res.locals.guestUIDs;
    try {
        functions.logger.info('Updating event guests user records');
        await firestore.runTransaction(async (tx) => {
            const query = await firestore
                .collection('users')
                .where('uid', 'in', guestUIDs);
            const querySnapshot = await tx.get(query);
            if (!querySnapshot.empty) {
                querySnapshot.forEach(async (doc) => {
                    await tx.update(doc.ref, {
                        events: Firestore.FieldValue.arrayUnion({
                            eventId,
                            name,
                            description,
                            startDate,
                            startTime,
                            role: 'GUEST',
                        }),
                    });
                });
            }
        });
        next();
    } catch (e) {
        functions.logger.error(e);
        res.status(500).json({
            name: 'ERROR/FIRESTORE',
            message: 'Error updating event guests user records',
        });
    }
};

export default updateEventGuestsRecord;
