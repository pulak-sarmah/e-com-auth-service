import { DataSource } from 'typeorm';
import { AppDataSource } from './../../src/config/data-source';
import { app } from '../../src/app';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { Tenant } from '../../src/entity/Tenant';
import { CreateTenant } from '../utils';

describe('POST /users', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should  persist the user in the database', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });
            const tenant = await CreateTenant(connection.getRepository(Tenant));
            // Register user
            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'john@doe.com',
                password: 'password',
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            // Add token to cookie
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it('should create a manager user', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });
            const tenant = await CreateTenant(connection.getRepository(Tenant));
            // Register user
            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'john@doe.com',
                password: 'password',
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            // Add token to cookie
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });

        it('should return 403 if non admin user tries to create a user', async () => {
            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            });

            // Register user
            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'john@doe.com',
                password: 'password',
                tenantId: 1,
            };

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send(userData);

            expect(response.statusCode).toBe(403);
        });

        it('Should get the user list', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            // Register user
            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'john@doe.com',
                password: 'password',
                role: Roles.MANAGER,
            };

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const response = await request(app)
                .get('/users')
                .set('Cookie', [`accessToken=${adminToken}`]);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(1);
        });

        it('Should get the user by id', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'john@doe.com',
                password: 'password',
                role: Roles.MANAGER,
            };

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            const response = await request(app)
                .get(`/users/${users[0]?.id}`)
                .set('Cookie', [`accessToken=${adminToken}`]);

            expect(response.statusCode).toBe(200);
            expect(response.body.email).toBe(userData.email);
        });

        it('Should be able to update a user', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'john@doe.com',
                password: 'password',
                role: Roles.MANAGER,
            };

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            const response = await request(app)
                .patch(`/users/${users[0]?.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({
                    ...userData,
                    firstName: 'Jane',
                    role: Roles.CUSTOMER,
                });
        });
    });

    it('should be able to delete a user', async () => {
        const adminToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        });

        const userData = {
            firstName: 'john',
            lastName: 'doe',
            email: 'john@doe.com',
            password: 'password',
            role: Roles.MANAGER,
        };

        await request(app)
            .post('/users')
            .set('Cookie', [`accessToken=${adminToken}`])
            .send(userData);

        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();

        const response = await request(app)
            .delete(`/users/${users[0]?.id}`)
            .set('Cookie', [`accessToken=${adminToken}`]);

        expect(response.statusCode).toBe(204);
        const user = await userRepository.findOne({
            where: { id: users[0]?.id },
        });
        expect(user).toBeNull();
    });

    describe('fields are missing', () => {});

    describe('fields are not in proper format', () => {});
});
