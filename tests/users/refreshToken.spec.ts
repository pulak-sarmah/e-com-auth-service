import { DataSource } from 'typeorm';
import { AppDataSource } from './../../src/config/data-source';
import { app } from '../../src/app';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import Jwt from 'jsonwebtoken';

describe('POST /auth/refresh', () => {
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
        it('should refresh the access token', async () => {
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

            const refreshToken = jwks.token({
                sub: String(data.id),
            });
            await request(app)
                .post('/auth/refresh')
                .set('Cookie', [`refreshToken= ${refreshToken};`])
                .send();

            const decodedToken = Jwt.decode(refreshToken) as { sub: string };

            expect(decodedToken.sub).toBe(String(data.id));
        });
    });

    describe('fields are missing', () => {});

    describe('fields are not in proper format', () => {});
});
