require('dotenv').config();
import express, { NextFunction, Request, Response } from 'express';
export const app = express();

import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ErrorMiddleware } from './middleware/error';

import userRouter from './routes/user.route';
import courseRouter from './routes/course.route';
import orderRouter from './routes/order.route';
import notificationRouter from './routes/notification.route';
import analyticsRouter from './routes/analytics.route';
import layoutRouter from './routes/layout.route';
import authRouter from './routes/auth.route';

// body parser
app.use(express.json({ limit: '50mb' }));

// cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

// routes
app.use('/api/v1/auth', authRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1', courseRouter);

app.use('/api/v1/users', orderRouter);

app.use('/api/v1/users/admin', notificationRouter);

app.use('/api/v1/users/admin', analyticsRouter);

app.use('/api/v1', layoutRouter);

// testing api
app.get('/test', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: 'API is working',
  });
});

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;

  err.statusCode = 404;
  next(err);
});

// Middleware calls
app.use(ErrorMiddleware);
