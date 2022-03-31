import express from 'express';
import cors from 'cors';
import { json as jsonBodyParser } from 'body-parser';

import userRouter from './users';

const app = express();

app.use(cors());
app.use(jsonBodyParser());

app.use('/users', userRouter);

export default app;
