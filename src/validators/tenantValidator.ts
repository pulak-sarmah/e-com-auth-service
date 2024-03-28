import { checkSchema } from 'express-validator';

export default checkSchema({
    name: {
        in: ['body'],
        isString: true,
        notEmpty: true,
        escape: true,
    },
    address: {
        in: ['body'],
        isString: true,
        notEmpty: true,
        escape: true,
    },
});
