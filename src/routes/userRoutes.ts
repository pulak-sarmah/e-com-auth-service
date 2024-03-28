import express, { NextFunction, Request, Response } from 'express';

import authenticateMiddleware from '../middlewares/authenticateMiddleware';
import { canAccess } from '../middlewares/canAccessMiddleware';
import { Roles } from '../constants';
import { UserController } from '../controller/UserController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import createUserValidator from '../validators/createUserValidator';
const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router
    .route('/')
    .post(
        authenticateMiddleware,
        canAccess([Roles.ADMIN]),
        createUserValidator,
        (req: Request, res: Response, next: NextFunction) =>
            userController.create(req, res, next),
    );

router
    .route('/')
    .get(
        authenticateMiddleware,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            userController.getAll(req, res, next),
    );

export default router;
