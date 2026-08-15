const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const importPlugin = require('eslint-plugin-import');
const perfectionistPlugin = require('eslint-plugin-perfectionist');
const eslintConfigPrettier = require('eslint-config-prettier');

function getReactVersion() {
  try {
    return require(require.resolve('react/package.json', { paths: [process.cwd()] })).version;
  } catch {
    return 'detect';
  }
}

module.exports = [
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      perfectionist: perfectionistPlugin,
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 2018,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: 'module',
    },
    settings: {
      react: {
        version: getReactVersion(),
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
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
      'react/jsx-sort-props': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'sort-keys': 'warn',
    },
  },
];
