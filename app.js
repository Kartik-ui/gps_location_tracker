import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware.js';
dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

//route imports
import { locationRouter } from './routes/location.routes.js';
import { userRouter } from './routes/user.routes.js';

//routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/location', locationRouter);

app.use(errorMiddleware);

export { app };
