import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';

const app = express();

app.get('/', (req, res) => {
    res.send('AUTH SERVICE IS RUNNING');
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);

    const statusCode = err.statusCode || 500;

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
