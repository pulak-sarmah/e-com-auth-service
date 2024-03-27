import { AppDataSource } from './../../src/config/data-source';
import request from 'supertest';
import { app } from '../../src/app';
import { DataSource } from 'typeorm';

describe('POST /tenants', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return a 201 status code', async () => {
            // Arrange
            const tenantData = {
                name: 'John',
                address: 'xxx xxx xxx',
            };
            // Act
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);
            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should create a tenant in the db', async () => {
            // Arrange
            const tenantData = {
                name: 'John',
                address: 'xxx xxx xxx',
            };
            // Act
            await request(app).post('/tenants').send(tenantData);

            const tenantRepository = connection.getRepository('Tenant');
            const tenants = await tenantRepository.find();
            // Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
    });

    describe('fields are missing', () => {});

    describe('fields are not in proper format', () => {});
});
