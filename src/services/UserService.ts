import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { LimitedUserData, UserData } from '../types';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password, role }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (user) {
            const err = createHttpError(400, 'Email is already exists');

            throw err;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
            });
            return user;
        } catch (error) {
            const err = createHttpError(
                500,
                'Failed to store data in the database',
            );
            throw err;
        }
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
        });
    }

    async findById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id,
            },
        });
    }

    async getAll() {
        return await this.userRepository.find();
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }

    async getById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id,
            },
        });
    }

    async updateUser(
        id: number,
        { firstName, lastName, role }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(id, {
                firstName,
                lastName,
                role,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to update the user in the database',
            );
            throw error;
        }
    }
}
