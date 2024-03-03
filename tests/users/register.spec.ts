import request from 'supertest';
import { app } from '../../src/app';

describe('POST /auth/register', () => {
    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            //Arrange
            const userData = {
                firstName: 'john',
                lastName: 'Doe',
                email: 'johndoe@gmail.com',
                password: 'secret',
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
                password: 'secret',
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
                password: 'secret',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect();
        });
    });

    describe('fields are missing', () => {});
});
