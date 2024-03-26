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
    });

    describe('fields are missing', () => {});

    describe('fields are not in proper format', () => {});
});
