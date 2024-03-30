import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import { TenantController } from '../controller/TenantController';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import authenticateMiddleware from '../middlewares/authenticateMiddleware';
import tenantValidator from '../validators/tenantValidator';
import { canAccess } from '../middlewares/canAccessMiddleware';
import { Roles } from '../constants';

const router = express.Router();

const tenantRepo = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepo);
const tenantController = new TenantController(tenantService, logger);

router
    .route('/')
    .post(
        tenantValidator,
        authenticateMiddleware as unknown as RequestHandler,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            tenantController.create(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route('/')
    .get(
        (req: Request, res: Response, next: NextFunction) =>
            tenantController.getAll(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route('/:id')
    .get(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            tenantController.getById(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route('/:id')
    .patch(
        tenantValidator,
        authenticateMiddleware as unknown as RequestHandler,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            tenantController.update(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route('/:id')
    .delete(
        authenticateMiddleware as unknown as RequestHandler,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            tenantController.delete(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

export default router;
