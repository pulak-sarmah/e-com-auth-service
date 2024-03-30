import { Tenant } from '../../src/entity/Tenant';
import { CreateTenantReq } from './../../src/types/index';
import { DataSource, Repository } from 'typeorm';

export const truncateTable = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJwt = (token: string | null): boolean => {
    if (token === null) {
        return false;
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
        return false;
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8');
        });

        return true;
    } catch (err) {
        return false;
    }
};

export const CreateTenant = async (repository: Repository<Tenant>) => {
    const tenant = await repository.save({
        name: 'tenant',
        address: 'address',
    });
    return tenant;
};
