/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const importPlugin = require('eslint-plugin-import');
const perfectionistPlugin = require('eslint-plugin-perfectionist');
const eslintConfigPrettier = require('eslint-config-prettier');

function getDeclaredReactVersion() {
  try {
    const packageJson = require(path.join(process.cwd(), 'package.json'));
    const declaredVersion =
      packageJson.dependencies?.react ||
      packageJson.devDependencies?.react ||
      packageJson.peerDependencies?.react;

    const [, major, minor = '0', patch = '0'] =
      declaredVersion?.match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/) || [];

    return major ? `${major}.${minor}.${patch}` : undefined;
  } catch {
    return undefined;
  }
}

function getReactVersion() {
  try {
    return require(require.resolve('react/package.json', { paths: [process.cwd()] })).version;
  } catch {
    return getDeclaredReactVersion();
  }
}

const reactVersion = getReactVersion();

module.exports = [
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2018,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: 'module',
    },
    plugins: {
      import: importPlugin,
      perfectionist: perfectionistPlugin,
      react: reactPlugin,
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
    settings: reactVersion
      ? {
          react: {
            version: reactVersion,
          },
        }
      : {},
  },
];
