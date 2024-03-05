import { DataSource } from 'typeorm';
import { AppDataSource } from './../../src/config/data-source';
import { app } from '../../src/app';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

describe('GET /auth/self', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:6001');
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
        it('should return the 200 statusCode', async () => {
            const accessToken = jwks.token({
                sub: '1',
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken= ${accessToken};`])
                .send();

            expect(response.statusCode).toBe(200);
        });

        it('should return user data', async () => {
            const userRepository = connection.getRepository(User);
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken= ${accessToken};`])
                .send();

            expect(response.body.id).toBe(data.id);
        });

        it('should not return the password field', async () => {
            const userRepository = connection.getRepository(User);
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken= ${accessToken};`])
                .send();

            expect(response.body).not.toHaveProperty('password');
        });

        it('should  return 401 status code if token does not exists', async () => {
            const userRepository = connection.getRepository(User);

            const response = await request(app).get('/auth/self').send();

            expect(response.statusCode).toBe(401);
        });
    });

    describe('fields are missing', () => {});

    describe('fields are not in proper format', () => {});
});
