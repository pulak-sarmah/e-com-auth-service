/* eslint-env node */
module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    root: true,
    rules: {
        'no-console': 'error',
        'dot-notation': 'error',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-misused-promises': 0,
    },
    // overrides: [
    //     {
    //         files: ['.eslintrc.cjs', 'tests/**/*.spec.ts', 'tests/**/*.ts'],
    //         rules: {
    //             '@typescript-eslint/await-thenable': 'off',
    //         },
    //     },
    // ],
};
