import { app } from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';
import { UserService } from './services/UserService';
import { Roles } from './constants';
import { User } from './entity/User';

async function createAdminUser() {
    const userRepository = AppDataSource.getRepository(User);
    const userService = new UserService(userRepository);
    const adminUser =
        await userService.findByEmailWithPass('admin@example.com');

    if (!adminUser && Config.ADMIN_EMAIL && Config.ADMIN_PASS) {
        await userService.create({
            firstName: 'Admin',
            lastName: 'User',
            email: Config.ADMIN_EMAIL,
            password: Config.ADMIN_PASS,
            role: Roles.ADMIN,
        });
    }
}

async function startServer() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connected successfully');

        await createAdminUser()
            .then(() => {
                logger.info('Admin user created successfully');
            })
            .catch((error) => {
                logger.error(error);
            });
        const PORT = Config.PORT ?? 5001;
        app.listen(PORT, () => {
            logger.info(`server is running on port ${PORT}`);
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(error.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
}
void startServer();
