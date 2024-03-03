import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Config } from '.';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: Config.DB_HOST,
    port: parseInt(Config.DB_PORT!),
    username: Config.DB_USERNAME,
    password: Config.DB_USERNAME,
    database: Config.DB_NAME,
    synchronize: Config.NODE_ENV === 'test' || Config.NODE_ENV === 'dev', // false in production
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});
