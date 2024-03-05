import request from 'supertest';
import { DataSource } from 'typeorm';
import { app } from '../../src/app';
import { AppDataSource } from './../../src/config/data-source';

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
            const res = await request(app)
                .post('/auth/register')
                .send(userData);

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
    });

    describe('fields are missing', () => {});

    describe('fields are not in proper format', () => {});
});
