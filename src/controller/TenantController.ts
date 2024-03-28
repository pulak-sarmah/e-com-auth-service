import { NextFunction, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { CreateTenantReq } from '../types';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: CreateTenantReq, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
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

    async getById(req: CreateTenantReq, res: Response, next: NextFunction) {
        const { id } = req.params;

        this.logger.debug('Request for getting a tenant by id', { id });

        try {
            const tenant = await this.tenantService.getTenantById(id);

            if (!tenant) {
                res.status(404).json({ message: 'Tenant not found' });
                return;
            }

            this.logger.info('Tenant has been fetched', { id: tenant.id });

            res.status(200).json(tenant);
        } catch (error) {
            next(error);
        }
    }

    async update(req: CreateTenantReq, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { name, address } = req.body;

        this.logger.debug('Request for updating a tenant', {
            id,
            name,
            address,
        });

        try {
            const tenant = await this.tenantService.updateTenant(id, {
                name,
                address,
            });

            if (!tenant) {
                res.status(404).json({ message: 'Tenant not found' });
                return;
            }

            res.status(200).json(tenant);
        } catch (error) {
            next(error);
        }
    }
}
