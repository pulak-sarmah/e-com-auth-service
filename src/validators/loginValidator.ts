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
        notEmpty: true,
        escape: true,
        trim: true,
    },
});
