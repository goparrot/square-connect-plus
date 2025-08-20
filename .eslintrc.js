module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
        mocha: true,
    },
    ignorePatterns: ['node_modules', '!.*.js', '!.*.json'],
    extends: ['@goparrot/eslint-config/recommended', '@goparrot/eslint-config/less-strict'],
    settings: {
        // Use node resolver instead of typescript resolver to avoid native binding issues
        'import/resolver': {
            node: {
                extensions: ['.js', '.ts'],
            },
        },
    },
};
