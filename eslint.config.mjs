import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    plugins: { import: importPlugin },
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
      // --- INCREMENTAL ADDITIONS FOR AGENT/TS ---
      'prefer-template': 'error',
      'arrow-body-style': ['warn', 'as-needed'],
      'no-array-constructor': 'error',
      'import/order': ['warn', { 'newlines-between': 'always' }],

      // --- YOUR EXISTING RULES ---
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'quote-props': ['error', 'as-needed'],
      eqeqeq: ['error', 'always'],
      'no-console': 'off',
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true }],
      complexity: ['warn', 10],
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-undef': 'error',
      'import/no-commonjs': 'warn',
    },
  },
];
