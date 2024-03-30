import request from 'supertest';
import { DataSource } from 'typeorm';
import { app } from '../../src/app';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';
import { AppDataSource } from './../../src/config/data-source';
import { RefreshToken } from './../../src/entity/RefreshToken';

import { isJwt } from '../utils';

describe('POST /auth/register', () => {
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
        it('should return the 201 statusCode code', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json data', async () => {
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });

        it('should persist the user data in the database', async () => {
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = connection.getRepository(User);

            const user = await userRepository.find();

            expect(user).toHaveLength(1);
            expect(user[0].firstName).toBe(userData.firstName);
            expect(user[0].lastName).toBe(userData.lastName);
            expect(user[0].email).toBe(userData.email);
        });

        it('must contain the id of the user', async () => {
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.body).toHaveProperty('id');
        });

        it('should assign a customer role', async () => {
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();

            expect(user[0]).toHaveProperty('role');

            expect(user[0].role).toBe(Roles.CUSTOMER);
        });

        it('should store the hashed password in the database', async () => {
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const user = await userRepository.find({ select: ['password'] });

            expect(user[0].password).not.toBe(userData.password);
            expect(user[0].password).toHaveLength(60);
            expect(user[0].password).toMatch(/^\$2a\$\d+\$/);
        });

        it('should return statusCode code 400 , if email already exists', async () => {
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const user = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(user).toHaveLength(1);
        });

        it('should return the access and resfresh token inside a cookie', async () => {
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

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
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // assert
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.find();

            expect(refreshToken).toHaveLength(1);

            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: response.body.id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });

    describe('fields are missing', () => {
        it('should return empty list if email field is missing', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: '',
                password: 'secret12',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();

            // Assert
            expect(user).toHaveLength(0);
        });

        it('should return empty list if firstName is  missing', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: '',
                password: 'secret12',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();

            // Assert
            expect(user).toHaveLength(0);
        });

        it('should return empty list if lastName is  missing', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: '',
                email: 'johndoe@gmail.com',
                password: 'secret12',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();

            // Assert
            expect(user).toHaveLength(0);
        });

        it('should return empty list if password is  missing', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'doe',
                email: 'johndoe@gmail.com',
                password: '',
            };
            // Act
            await request(app).post('/auth/register').send(userData);
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();

            // Assert
            expect(user).toHaveLength(0);
        });
    });

    describe('fields are not in proper format', () => {
        it('should trim the email field', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: ' johndoe@gmail.com ',
                password: 'secret12',
            };
            // Act
            await request(app).post('/auth/register').send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();
            expect(user[0].email).toBe('johndoe@gmail.com');
        });

        it('should return 400 error if password is not 8 charecter long', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: ' johndoe@gmail.com ',
                password: 'secret',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return 400 error if email is not a valid email', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@.com',
                password: 'secret12',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
        });
    });
});
