import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended, // This automatically sets up the parser
  {
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.vitest,
      },
    },
    rules: {
      // --- THE "GRIP" RULES ---
      '@typescript-eslint/no-explicit-any': ['warn', { fixToUnknown: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      'prefer-template': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],

      // --- IMPORT DISCIPLINE ---
      'import/order': ['warn', { 'newlines-between': 'always' }],
      'import/no-commonjs': 'warn',

      // --- CODE HYGIENE ---
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true }],
      complexity: ['warn', 10],
      curly: ['error', 'all'],
    },
  },
  {
    // Disable some rules for test files to keep them "human"
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines-per-function': 'off',
    },
  },
);
