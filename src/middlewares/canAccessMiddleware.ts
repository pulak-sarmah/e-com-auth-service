import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../types';
import creareHttpError from 'http-errors';

export const canAccess = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const _req = req as AuthRequest;
        const roleFromToken = _req.auth.role;

        if (!roles.includes(roleFromToken)) {
            const error = creareHttpError(403, 'Forbidden');
            next(error);
            return;
        }
        next();
    };
};
