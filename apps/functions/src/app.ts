import express from 'express';
import cors from 'cors';
import { json as bodyParserJSON } from 'body-parser';

import { functions } from './firebase';
import usersRouter from './routes/users';
import eventPlansRouter from './routes/event-plans';

const app = express();

/**
 * Set local app variables
 */
app.locals.functions = functions;

app.use(cors());
app.use(bodyParserJSON());

app.use('/users', usersRouter);
app.use('/event-plans', eventPlansRouter);

export default app;
