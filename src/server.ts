import { app } from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';

async function startServer() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connected successfully');
        const PORT = Config.PORT;
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
