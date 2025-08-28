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
        // Completely disable import resolution to avoid native binding issues on Node v20
        'import/resolver': 'node',
        'import/ignore': ['.*'],
    },
    rules: {
        // Completely disable eslint-plugin-import to avoid native binding issues on Node v20
        'import/order': 'off',
        'import/no-deprecated': 'off',
        'import/namespace': 'off',
        'import/named': 'off',
        'import/default': 'off',
        'import/export': 'off',
        'import/no-duplicates': 'off',
        'import/no-unresolved': 'off',
        'import/no-cycle': 'off',
        'import/first': 'off',
        'import/no-mutable-exports': 'off',
        'import/prefer-default-export': 'off',
        'import/extensions': 'off',
    },
};
