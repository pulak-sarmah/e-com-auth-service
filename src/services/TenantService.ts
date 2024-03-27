import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import { Itenant } from '../types';

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async createTenant(tenantData: Itenant) {
        return await this.tenantRepository.save(tenantData);
    }
}
