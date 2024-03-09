import express, { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { AuthController } from '../controller/AuthController';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import authenticateMiddleware from '../middlewares/authenticateMiddleware';
import { TokenService } from '../services/TokenService';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../types';
import loginValidator from '../validators/loginValidator';
import registerVatlidator from '../validators/registerVatlidator';
import { CredentialService } from './../services/CredentialService';
import validateRefreshToken from '../middlewares/validateRefreshToken';

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

router
    .route('/self')
    .get(authenticateMiddleware, (req: Request, res: Response) =>
        authController.self(req as AuthRequest, res),
    );

router
    .route('/refresh')
    .post(
        validateRefreshToken,
        (req: Request, res: Response, next: NextFunction) =>
            authController.refresh(req as AuthRequest, res, next),
    );

export default router;
