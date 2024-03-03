import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../controller/AuthController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';

import registerVatlidator from '../validators/registerVatlidator';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

router
    .route('/register')
    .post(
        registerVatlidator,
        (req: Request, res: Response, next: NextFunction) =>
            authController.register(req, res, next),
    );

export default router;
