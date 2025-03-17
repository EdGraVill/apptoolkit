module.exports = {
  extends: [
    'plugin:react/recommended',
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
    ecmaFeatures: {
      jsx: true,
    },
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
        plugins: [require.resolve('prettier-plugin-tailwindcss'), require.resolve('@trivago/prettier-plugin-sort-imports')],
        printWidth: 120,
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
    'import/no-duplicates': ['error', {'considerQueryString': true}],
    'react/jsx-sort-props': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'sort-keys': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
