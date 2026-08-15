const tseslint = require('typescript-eslint');
const importPlugin = require('eslint-plugin-import');
const perfectionistPlugin = require('eslint-plugin-perfectionist');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      perfectionist: perfectionistPlugin,
    },
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    rules: {
      ...eslintConfigPrettier.rules,
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: true,
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import/no-duplicates': ['error', { considerQueryString: true }],
      'perfectionist/sort-enums': 'error',
      'perfectionist/sort-interfaces': 'error',
      'sort-keys': 'warn',
    },
  },
];
