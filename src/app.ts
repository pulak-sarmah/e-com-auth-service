import 'reflect-metadata';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
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

app.use(globalErrorHandler);

export { app };
