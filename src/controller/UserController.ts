import { NextFunction, Response } from 'express';
import { UserService } from '../services/UserService';
import { matchedData, validationResult } from 'express-validator';
import { CreateUserReq, QueryParams, UpdateUserRequest } from '../types';
import createHttpError from 'http-errors';

export class UserController {
    constructor(private userService: UserService) {}

    async create(req: CreateUserReq, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
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
        const validatedQuery = matchedData(req, {
            onlyValidData: true,
        }) as QueryParams;
        try {
            const [users, count] =
                await this.userService.getAll(validatedQuery);
            res.status(200).json({
                currentPage: validatedQuery.currentPage,
                perPage: validatedQuery.perPage,
                total: count,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: CreateUserReq, res: Response, next: NextFunction) {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }
        try {
            const user = await this.userService.findById(Number(id));
            if (!user) {
                next(createHttpError(400, 'User does not exist.'));
                return;
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
            next(createHttpError(400, result.array()));
            return;
        }

        const { firstName, lastName, role, email, tenantId } = req.body;
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
                email,
                tenantId,
            });

            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }
}
