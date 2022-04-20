import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { json as jsonBodyParser } from 'body-parser';

import indexRouter from './';
import usersRouter from './users';
import eventPlansRouter from './event-plans';
import eventsRouter from './events';
import { functions } from '../firebase';

const app = express();

app.use(cors());
app.use(jsonBodyParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/event-plans', eventPlansRouter);
app.use('/events', eventsRouter);

// Error handling needs to be handled last
// https://expressjs.com/en/guide/error-handling.html
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  functions.logger.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || err.status || 500).send(err.message);
};
app.use(errorHandler);

export default app;
