import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports'; // 1. Import the plugin

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports, // 2. Register the plugin
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

      // 3. Disable standard unused-vars to let the plugin handle it
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error', // Auto-fixable: removes unused imports
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
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
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines-per-function': 'off',
      // Optional: keep unused vars as warnings in tests
      'unused-imports/no-unused-vars': 'warn',
    },
  },
);
