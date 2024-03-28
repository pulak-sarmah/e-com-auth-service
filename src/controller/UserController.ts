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
}
