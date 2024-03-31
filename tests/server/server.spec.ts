import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';
import { UserService } from '../../src/services/UserService';
import { app } from '../../src/app';
import request from 'supertest';

describe('Server Initialization', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();

        const userService = new UserService(connection.getRepository(User));
        await userService.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: 'securepassword',
            role: Roles.ADMIN,
        });
    });

    afterAll(async () => {
        await connection.destroy();
    });

    it('should start the server and respond to requests', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });

    it('should create an admin user if one does not exist', async () => {
        const userRepository = connection.getRepository(User);
        const adminUser = await userRepository.findOne({
            where: { role: 'admin' },
        });

        expect(adminUser).not.toBeNull();
        expect(adminUser?.role).toBe(Roles.ADMIN);
    });
});
