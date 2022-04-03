import express from 'express';
import cors from 'cors';
import { json as jsonBodyParser } from 'body-parser';

import indexRouter from './';
import usersRouter from './users';
import eventPlansRouter from './event-plans';

const app = express();

app.use(cors());
app.use(jsonBodyParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/event-plans', eventPlansRouter);

export default app;
