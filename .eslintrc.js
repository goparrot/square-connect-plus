module.exports = {
    extends: ['@goparrot/eslint-config/recommended', '@goparrot/eslint-config/less-strict'],
    ignorePatterns: ['node_modules', '!.*.js', '!.*.json'],
    parserOptions: {
        project: './tsconfig.eslint.json',
    },
};
