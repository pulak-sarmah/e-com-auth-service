import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import { Itenant } from '../types';

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async createTenant(tenantData: Itenant) {
        return await this.tenantRepository.save(tenantData);
    }

    async getAllTenants() {
        return await this.tenantRepository.find();
    }

    async getTenantById(id: string) {
        return await this.tenantRepository.findOneBy({ id: Number(id) });
    }

    async updateTenant(id: string, tenantData: Itenant) {
        const tenant = await this.tenantRepository.findOneBy({
            id: Number(id),
        });

        if (!tenant) {
            return null;
        }

        tenant.name = tenantData.name || tenant.name;
        tenant.address = tenantData.address || tenant.address;

        return await this.tenantRepository.save(tenant);
    }

    async deleteTenant(id: string) {
        const tenant = await this.tenantRepository.findOneBy({
            id: Number(id),
        });

        if (!tenant) {
            return null;
        }

        return await this.tenantRepository.remove(tenant);
    }
}
