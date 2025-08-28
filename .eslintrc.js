module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
        mocha: true,
    },
    ignorePatterns: ['node_modules', '!.*.js', '!.*.json'],
    overrides: [
        {
            files: ['*.js'],
            rules: {
                '@typescript-eslint/no-misused-promises': 'off',
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
        {
            files: ['*.ts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
                ecmaVersion: 2020,
                sourceType: 'module',
            },
        },
    ],
    extends: ['@goparrot/eslint-config/recommended', '@goparrot/eslint-config/less-strict'],
    settings: {
        // Use node resolver only - completely avoid typescript resolver native binding issues
        'import/resolver': {
            node: {
                extensions: ['.js', '.ts'],
            },
        },
    },
    rules: {
        // Disable ALL import rules that use typescript resolver (native binding issues on Node v20)
        'import/no-deprecated': 'off',
        'import/namespace': 'off',
        'import/named': 'off',
        'import/default': 'off',
        'import/export': 'off',
        'import/no-duplicates': 'off',
        'import/no-unresolved': 'off',
        'import/no-cycle': 'off',
    },
};
