import { app } from './app';
import { Config } from './config';
import logger from './config/logger';

function startServer() {
    try {
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

startServer();
