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

        it('should return 403 if user is not an admin', async () => {
            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            });

            // Arrange
            const tenantData = {
                name: 'John',
                address: 'xxx xxx xxx',
            };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository('Tenant');
            const tenants = await tenantRepository.find();

            // Assert
            expect(response.statusCode).toBe(403);
            expect(tenants).toHaveLength(0);
        });
    });

    describe('fields are missing', () => {
        it('should return 400 if name is missing', async () => {
            // Arrange
            const tenantData = {
                address: 'xxx xxx xxx',
            };
            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository('Tenant');
            const tenants = await tenantRepository.find();
            // Assert
            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });

        it('should return 400 if address is missing', async () => {
            // Arrange
            const tenantData = {
                name: 'John',
            };
            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository('Tenant');
            const tenants = await tenantRepository.find();
            // Assert
            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });
    });

    describe('fields are not in proper format', () => {});
});

describe('GET /tenants', () => {
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
        it('should return tenant list', async () => {
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

            const response = await request(app)
                .get('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`]);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(1);
        });

        it('Should return the correct tenants given the id', async () => {
            // Arrange
            const tenantData = {
                name: 'John',
                address: 'xxx xxx xxx',
            };
            // Act
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantId = createResponse.body.id;

            const response = await request(app)
                .get(`/tenants/${tenantId}`)
                .set('Cookie', [`accessToken=${adminToken}`]);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body.name).toBe(tenantData.name);
            expect(response.body.address).toBe(tenantData.address);
        });
    });

    describe('fields are missing', () => {});

    describe('fields are not in proper format', () => {});
});

describe('PATCH /tenants', () => {
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
        it('should be able to update a tenant', async () => {
            // Arrange
            const tenantData = {
                name: 'John',
                address: 'xxx xxx xxx',
            };
            // Act
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantId = createResponse.body.id;

            const updateData = {
                name: 'Jane',
                address: 'yyy yyy yyy',
            };

            const response = await request(app)
                .patch(`/tenants/${tenantId}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(updateData);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body.name).toBe(updateData.name);
            expect(response.body.address).toBe(updateData.address);
        });
    });

    describe('fields are missing', () => {});

    describe('fields are not in proper format', () => {});
});
