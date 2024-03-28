import { Roles } from './../constants/index';
import { NextFunction, Response } from 'express';
import { UserService } from '../services/UserService';
import { validationResult } from 'express-validator';
import { CreateUserReq } from '../types';

export class UserController {
    constructor(private userService: UserService) {}

    async create(req: CreateUserReq, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email, password } = req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.MANAGER,
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
}
