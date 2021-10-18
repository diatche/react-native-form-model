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
    },
};
