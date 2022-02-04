import { RequestHandler } from 'express';

const createUserRecord: RequestHandler = async (req, res, next) => {
    const functions = req.app.locals.functions;
    const firestore: FirebaseFirestore.Firestore = req.app.locals.firestore;
    const { firstName, lastName, email } = req.body;
    const uid = res.locals.uid;
    functions.logger.info('Creating user record');
    try {
        await firestore.doc(`/users/${uid}`).create({
            uid,
            email,
            firstName,
            lastName,
            events: [],
            availability: [],
            timeFormat24Hr: false,
        });
        functions.logger.info(`User ${uid} successfully created.`);
        next();
    } catch (e) {
        functions.logger.error(e);
        res.status(500).json({
            name: 'ERROR/FIRESTORE',
            message: 'Error creating user record',
        });
    }
};

export default createUserRecord;
