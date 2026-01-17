import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import n from 'eslint-plugin-n';

export default tseslint.config(
  {
    ignores: ['coverage/**', 'scripts/**', 'dist/**', '.dependency-cruiser.cjs'],
  },
  js.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['src/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
      n,
      unicorn,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      // --- THE GOOD PARTS: LOGIC SAFETY ---
      'sonarjs/cognitive-complexity': ['error', 15], // Hard limit on "unreadable" logic
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'error',

      // --- THE GOOD PARTS: CLEAN ENGINE ---
      complexity: ['error', 10], // Stricter than demo
      'max-depth': ['error', 3], // Prevent deep nesting (if/else/loop hell)
      'max-params': ['error', 4], // Use objects/interfaces for > 4 params

      // --- MODERN SAFETY (Unicorn) ---
      'unicorn/no-array-reduce': 'warn', // Prefer for-of for engine performance
      'unicorn/prefer-module': 'error',
      'unicorn/no-null': 'warn', // Discourages null, encourages undefined/optional
      'unicorn/filename-case': ['error', { case: 'camelCase' }],

      // --- WINTERCG / TC55 COMPLIANCE ---
      'n/no-deprecated-api': 'error',
      'n/no-extraneous-import': 'error',
      'n/prefer-global/buffer': ['error', 'never'], // Forces TextEncoder/Uint8Array
      'n/prefer-global/process': ['error', 'never'], // Forces feature detection

      // Force Web Standards
      'no-restricted-globals': [
        'error',
        { name: 'Buffer', message: 'Use Uint8Array instead for WinterCG compliance.' },
        { name: 'process', message: 'Use environment detection or globalThis instead.' },
        { name: '__dirname', message: 'Use import.meta.url instead.' },
        { name: '__filename', message: 'Use import.meta.url instead.' },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      'import/no-cycle': 'error',
      'import/order': ['error', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
      // Add this to your rules block
      'no-restricted-syntax': [
        'error',
        // 1. Ban for..in (Iterates over prototypes, slow, often causes bugs)
        {
          selector: 'ForInStatement',
          message:
            'for..in iterates over the prototype chain. Use for..of or Object.keys/entries().',
        },
        // 2. Ban Labels/GOTO (Makes execution flow unpredictable)
        {
          selector: 'LabeledStatement',
          message: 'Labels are GOTO in disguise. Refactor logic into smaller, pure functions.',
        },
        // 3. Ban Sequence Expressions (The comma operator: a, b, c)
        // This prevents: return x++, y++, z; (which is a nightmare to debug)
        {
          selector: 'SequenceExpression',
          message:
            'The comma operator is confusing and obscures return values. Use multiple statements.',
        },
        // 4. Ban TypeScript Enums (Optional but Recommended for WinterCG)
        // Enums have weird runtime behavior. Const objects + Union types are safer.
        {
          selector: 'TSEnumDeclaration',
          message: 'Use const objects with "as const" or union types instead of Enums.',
        },
        // 5. Ban Class Private Fields (Optional)
        // Unless you really need #private, standard private/protected is better for sim-engines.
        {
          selector: 'PropertyDefinition[accessible="private"]',
          message:
            'Use TypeScript "private" keyword instead of "#" for better readability and sim performance.',
        },
      ],
    },
  },
  {
    // Test-specific overrides: Relaxing strictness for test readability
    files: ['src/test/**/*.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off', // Tests often use async wrappers for Vitest
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines-per-function': 'off',
    },
  },
  // Ensure the config file itself doesn't try to use type-checked rules
  {
    files: ['*.mjs', '*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
