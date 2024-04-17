import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS!.split(',');
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.send('AUTH SERVICE IS RUNNING');
});

import authRouter from './routes/authRoutes';
import tenantRouter from './routes/tenantRoutes';
import userRouter from './routes/userRoutes';

app.use('/auth', authRouter);
app.use('/tenants', tenantRouter);
app.use('/users', userRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);

    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                statusCode: err.statusCode,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    });
});
export { app };
