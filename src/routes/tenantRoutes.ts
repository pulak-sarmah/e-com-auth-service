import express, { NextFunction, Request, Response } from 'express';
import { TenantController } from '../controller/TenantController';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import authenticateMiddleware from '../middlewares/authenticateMiddleware';

const router = express.Router();

const tenantRepo = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepo);
const tenantController = new TenantController(tenantService, logger);

router
    .route('/')
    .post(
        authenticateMiddleware,
        (req: Request, res: Response, next: NextFunction) =>
            tenantController.create(req, res, next),
    );

export default router;
