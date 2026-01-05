import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  {
    // Global ignores MUST be in their own object at the top level
    ignores: ['coverage/**', 'scripts/**', 'dist/**', 'prism.js'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Apply core discipline to all source files
    files: ['src/**/*.ts', 'src/**/*.js'],
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      // --- AUTO-FIXABLE DISCIPLINE (ENFORCED AS ERRORS) ---
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],

      // --- AGENT-OPTIMIZED UNUSED CODE REMOVAL ---
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // --- STRICT TYPE SAFETY ---
      '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],

      // --- IMPORT DISCIPLINE ---
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-commonjs': 'error',

      // --- COMPLEXITY THRESHOLDS (WARNINGS FOR AGENTS TO REFACTOR) ---
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true }],
      complexity: ['warn', 10],
    },
  },
  {
    // Test specific overrides
    files: ['src/test/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines-per-function': 'off',
      'unused-imports/no-unused-vars': 'warn',
      'import/no-commonjs': 'off', // Allow commonjs in tests if necessary
    },
  },
);
