import { app } from './app';
import { Config } from './config';

function startServer() {
    try {
        const PORT = Config.PORT;
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`server is running on port ${PORT}`);
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
