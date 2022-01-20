module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
        mocha: true,
    },
    ignorePatterns: ['node_modules', '!.*.js', '!.*.json'],
    extends: ['@goparrot/eslint-config/recommended', '@goparrot/eslint-config/less-strict'],
};
