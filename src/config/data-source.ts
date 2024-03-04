import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Config } from '.';
import { RefreshToken } from '../entity/RefreshToken';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: Config.DB_HOST,
    port: parseInt(Config.DB_PORT!),
    username: Config.DB_USERNAME,
    password: Config.DB_PASS,
    database: Config.DB_NAME,
    synchronize: false, // false in production
    logging: false,
    entities: [User, RefreshToken],
    migrations: [],
    subscribers: [],
});
