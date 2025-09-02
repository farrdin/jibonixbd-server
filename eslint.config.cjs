const tsParser = require('@typescript-eslint/parser');
const eslintPluginTs = require('@typescript-eslint/eslint-plugin');
const globals = require('globals');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': eslintPluginTs,
    },
    rules: {
      'no-console': 'warn',
      'no-var': 'error',
      'no-undef': 'error',
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      eqeqeq: 'off',
      ...prettierConfig.rules,
    },
  },
];
