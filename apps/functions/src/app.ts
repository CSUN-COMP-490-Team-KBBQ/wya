import express from 'express';
import cors from 'cors';
import { json as bodyParserJSON } from 'body-parser';
import * as nodemailer from 'nodemailer';
import { firestore, auth, functions } from './firebase';
import registerRouter from './routes/register';
import createEventRouter from './routes/createEvent';

const app = express();

/**
 * Set local app variables
 */
app.locals.auth = auth;
app.locals.firestore = firestore;
app.locals.functions = functions;
app.locals.nodemailer = nodemailer;

app.use(cors());
app.use(bodyParserJSON());
app.use('/register', registerRouter);
app.use('/create-event', createEventRouter);

export default app;
