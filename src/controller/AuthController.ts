import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'winston';
import { UserService } from '../services/UserService';
import { RegisterUserRequest } from '../types';
import { CredentialService } from './../services/CredentialService';
import { TokenService } from './../services/TokenService';

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                newRefreshToken.id,
            );

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60,
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 24 * 365,
                httpOnly: true,
            });

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

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { email, password } = req.body;

        this.logger.debug('Request to login a user', {
            email,
            password: '****',
        });

        try {
            const user = await this.userService.findByEmail(email);

            if (!user) {
                const err = createHttpError(
                    400,
                    'User or password doesnt match',
                );
                next(err);
                return;
            }

            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const err = createHttpError(
                    400,
                    'User or password doesnt match',
                );
                next(err);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                newRefreshToken.id,
            );

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60,
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 24 * 365,
                httpOnly: true,
            });

            this.logger.info('user has been loggedIn', { id: user.id });

            res.status(200).json({
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
