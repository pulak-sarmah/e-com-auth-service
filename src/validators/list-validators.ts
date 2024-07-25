import { checkSchema } from 'express-validator';

export default checkSchema(
    {
        q: {
            trim: true,
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : '';
                },
            },
        },
        role: {
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : '';
                },
            },
        },
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
                    return Number.isNaN(paesedValue) ? 3 : paesedValue;
                },
            },
        },
    },
    ['query'],
);
