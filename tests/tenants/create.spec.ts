import { AppDataSource } from './../../src/config/data-source';
import request from 'supertest';
import { app } from '../../src/app';
import { DataSource } from 'typeorm';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';

describe('POST /tenants', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:6001');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
        jwks.start();

        adminToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        });
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(async () => {
        jwks.stop();
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
                .set('Cookie', [`accessToken=${adminToken}`])
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
            await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository('Tenant');
            const tenants = await tenantRepository.find();
            // Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });

        it('should return 401 if user is not authenticated', async () => {
            // Arrange
            const tenantData = {
                name: 'John',
                address: 'xxx xxx xxx',
            };
            // Act
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);

            const tenantRepository = connection.getRepository('Tenant');
            const tenants = await tenantRepository.find();
            // Assert
            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(401);
        });
    });

    describe('fields are missing', () => {});

    describe('fields are not in proper format', () => {});
});
