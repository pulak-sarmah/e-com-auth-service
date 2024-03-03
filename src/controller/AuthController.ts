import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { firstName, lastName, email, password } = req.body;

        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '****',
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info('User has been registered ', { id: user.id });

            res.status(201).json({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            });
        } catch (error) {
            next(error);
            return;
        }
    }
}
