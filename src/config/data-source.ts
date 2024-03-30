import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Config } from '.';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: Config.DB_HOST,
    port: parseInt(Config.DB_PORT!),
    username: Config.DB_USERNAME,
    password: Config.DB_PASS,
    database: Config.DB_NAME,
    synchronize: false,
    logging: false,
    entities: ['src/entity/*.{ts,js}'],
    migrations: ['src/migration/*.{ts,js}'],
    subscribers: [],
});
