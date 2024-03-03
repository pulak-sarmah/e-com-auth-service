import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is required!',
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: 'Invalid email format',
        },
        normalizeEmail: true,
        escape: true,
    },
    password: {
        isLength: {
            errorMessage:
                'Password must be at least 8 characters long and not more that 20 charecter',
            options: { min: 8, max: 20 },
        },
        notEmpty: true,
        escape: true,
    },
    firstName: {
        isAlpha: {
            errorMessage: 'First name must contain only alphabetic characters',
        },
        isLength: {
            errorMessage:
                'firstName must be at least 2 characters long and not more that 20 charecter',
            options: { min: 2, max: 20 },
        },
        notEmpty: true,
        escape: true,
    },
    lastName: {
        isAlpha: {
            errorMessage: 'Last name must contain only alphabetic characters',
        },
        isLength: {
            errorMessage:
                'lastName must be at least 2 characters long and not more that 20 charecter',
            options: { min: 2, max: 20 },
        },
        notEmpty: true,
        escape: true,
    },
});
