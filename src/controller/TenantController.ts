import { NextFunction, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { CreateTenantReq } from '../types';
import { Logger } from 'winston';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: CreateTenantReq, res: Response, next: NextFunction) {
        const { name, address } = req.body;

        this.logger.debug('Request for creating a tanent', { name, address });

        try {
            const tenant = await this.tenantService.createTenant({
                name,
                address,
            });

            this.logger.info('Tenant has been created', { id: tenant.id });

            res.status(201).json({ id: tenant.id });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: CreateTenantReq, res: Response, next: NextFunction) {
        this.logger.debug('Request for getting all tenants');

        try {
            const tenants = await this.tenantService.getAllTenants();

            this.logger.info('Tenants has been fetched', {
                count: tenants.length,
            });

            res.status(200).json(tenants);
        } catch (error) {
            next(error);
        }
    }
}
