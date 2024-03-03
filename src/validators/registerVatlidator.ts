import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is required!',
        notEmpty: true,
    },
});
