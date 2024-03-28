import express, { NextFunction, Request, Response } from 'express';
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
        authenticateMiddleware,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            tenantController.create(req, res, next),
    );

router
    .route('/')
    .get(
        tenantValidator,
        authenticateMiddleware,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            tenantController.getAll(req, res, next),
    );

export default router;
