import { checkSchema } from 'express-validator';

export default checkSchema(
    {
        currentPage: {
            customSanitizer: {
                options: (value) => {
                    const paesedValue = Number(value);
                    return Number.isNaN(paesedValue) ? 1 : paesedValue;
                },
            },
        },

        perPage: {
            customSanitizer: {
                options: (value) => {
                    const paesedValue = Number(value);
                    return Number.isNaN(paesedValue) ? 6 : paesedValue;
                },
            },
        },
    },
    ['query'],
);
