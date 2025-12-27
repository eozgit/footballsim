import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.vitest, // Explicitly add vitest globals
      },
    },
    rules: {
      // --- AGENT OPTIMIZATION & TS READINESS ---
      'prefer-const': 'error', // Agents shouldn't guess if a var changes
      'no-var': 'error', // TS migration is much cleaner without var hoisting
      'object-shorthand': 'warn', // Cleaner object structures
      'quote-props': ['error', 'as-needed'], // Consistency for parsers
      eqeqeq: ['error', 'always'], // Prevent type-coercion bugs
      'no-console': 'off', // Engine logging is necessary for now

      // --- READABILITY ---
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true }],
      complexity: ['warn', 10], // Flags "spaghetti" logic for refactoring

      // --- WARNINGS TO PREPARE FOR TS ---
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
    },
  },
];
