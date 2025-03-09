module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:typescript-sort-keys/recommended',
  ],
  plugins: [
    'import',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: true,
        prefer: 'type-imports',
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'prettier/prettier': [
      'error',
      {
        importOrder: ['<THIRD_PARTY_MODULES>', '^[./]'],
        importOrderSeparation: true,
        importOrderSortSpecifiers: true,
        printWidth: 120,
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
    'import/no-duplicates': ['error', {'considerQueryString': true}],
    'sort-keys': 'warn',
  },
};
