import { CredentialService } from './../services/CredentialService';
import express, { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { AuthController } from '../controller/AuthController';
import { User } from '../entity/User';
import { UserService } from '../services/UserService';

import { RefreshToken } from '../entity/RefreshToken';
import { TokenService } from '../services/TokenService';
import registerVatlidator from '../validators/registerVatlidator';
import loginValidator from '../validators/loginValidator';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);

const refreshToken = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshToken);
const credentialService = new CredentialService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

router
    .route('/register')
    .post(
        registerVatlidator,
        (req: Request, res: Response, next: NextFunction) =>
            authController.register(req, res, next),
    );

router
    .route('/login')
    .post(loginValidator, (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next),
    );

export default router;
