import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';

import authenticateMiddleware from '../middlewares/authenticateMiddleware';
import { canAccess } from '../middlewares/canAccessMiddleware';
import { Roles } from '../constants';
import { UserController } from '../controller/UserController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import createUserValidator from '../validators/createUserValidator';
import updateUserValidator from '../validators/updateUserValidator';
const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router
    .route('/')
    .post(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.ADMIN]),
        createUserValidator,
        (req: Request, res: Response, next: NextFunction) =>
            userController.create(req, res, next) as unknown as RequestHandler,
    );

router
    .route('/')
    .get(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            userController.getAll(req, res, next) as unknown as RequestHandler,
    );

router
    .route('/:id')
    .get(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            userController.getById(req, res, next) as unknown as RequestHandler,
    );

router
    .route('/:id')
    .delete(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            userController.deleteUser(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route('/:id')
    .patch(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.ADMIN]),
        updateUserValidator,
        (req: Request, res: Response, next: NextFunction) =>
            userController.updateUser(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

export default router;
