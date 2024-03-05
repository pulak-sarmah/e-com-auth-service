import request from 'supertest';
import { DataSource } from 'typeorm';
import { app } from '../../src/app';
import { AppDataSource } from './../../src/config/data-source';
import { isJwt } from '../utils';
import { RefreshToken } from '../../src/entity/RefreshToken';

describe('POST /auth/login', () => {
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
        it('should login the user', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            await request(app).post('/auth/register').send(userData);

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return a valid user id', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            const registerResponse = await request(app)
                .post('/auth/register')
                .send({ email: userData.email, password: userData.password });
            //Act
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });
            //Asert
            expect(loginResponse.body.id).toEqual(registerResponse.body.id);
        });

        it('should return status code of 400, if email does not exists in the database', async () => {
            // Arrange
            const userData = {
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            //Act
            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });
            //Asert
            expect(response.statusCode).toBe(400);
        });

        it('should return status code of 400, if password do not match', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            await request(app).post('/auth/register').send(userData);
            //Act
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: 'secret1234' });
            //Asert
            expect(loginResponse.statusCode).toBe(400);
        });

        it('should return the access and resfresh token inside a cookie', async () => {
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            await request(app).post('/auth/register').send(userData);

            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            let accessToken = null;
            let refreshToken = null;

            const cookies = Array.isArray(response.headers['set-cookie'])
                ? response.headers['set-cookie']
                : [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it('should store the refresh token to the database', async () => {
            //arrange
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            // act
            await request(app).post('/auth/register').send(userData);

            // act
            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });
            // assert
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.find();

            expect(refreshToken).toHaveLength(2);

            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: response.body.id,
                })
                .getMany();

            expect(tokens).toHaveLength(2);
        });
    });

    describe('fields are missing', () => {
        it('should not let the user login if password is missing', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            await request(app).post('/auth/register').send(userData);

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: '' });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should not let the user login  if email is missing', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            await request(app).post('/auth/register').send(userData);

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send({ email: '', password: userData.password });

            // Assert
            expect(response.statusCode).toBe(400);
        });
    });

    describe('fields are not in proper format', () => {
        it('should not let the user login  if email is not in proper format', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            await request(app).post('/auth/register').send(userData);

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send({ email: 'johndoe@.com', password: userData.password });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should trim the email field', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: ' johndoe@gmail.com ',
                password: 'secret12',
            };
            await request(app).post('/auth/register').send(userData);

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            // Assert
            expect(response.statusCode).toBe(200);
        });
    });
});
