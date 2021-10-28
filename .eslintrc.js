module.exports = {
    extends: ['universe/native', 'plugin:react-hooks/recommended'],
    rules: {
        'prettier/prettier': 'error',
        'sort-imports': [
            'error',
            {
                ignoreDeclarationSort: true,
            },
        ],
        // TODO: Fix these and then treat as error
        'react-hooks/rules-of-hooks': 'warn',
    },
};
