import { NextFunction, Response } from 'express';
import { UserService } from '../services/UserService';
import { validationResult } from 'express-validator';
import { CreateUserReq, UpdateUserRequest } from '../types';
import createHttpError from 'http-errors';

export class UserController {
    constructor(private userService: UserService) {}

    async create(req: CreateUserReq, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email, password, tenantId, role } =
            req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: role,
                tenantId,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: CreateUserReq, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAll();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: CreateUserReq, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            const user = await this.userService.getById(Number(id));
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: CreateUserReq, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            await this.userService.deleteById(Number(id));
            res.status(204).end();
        } catch (error) {
            next(error);
        }
    }

    async updateUser(
        req: UpdateUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, role } = req.body;
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            await this.userService.updateUser(Number(userId), {
                firstName,
                lastName,
                role,
            });

            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }
}
