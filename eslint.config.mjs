import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import n from 'eslint-plugin-n';
import stylistic from '@stylistic/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['coverage/**', 'scripts/**', 'dist/**', '.dependency-cruiser.cjs'],
  },
  js.configs.recommended,
  sonarjs.configs.recommended,
  stylistic.configs['disable-legacy'], // Pre-emptively turn off old rules
  stylistic.configs.recommended,
  {
    files: ['src/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
      n,
      unicorn,
      '@stylistic': stylistic,
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
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'error',
      // --- THE GOOD PARTS: CLEAN ENGINE ---
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'no-console': 'error',
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],

      // --- UNUSED CODE ---
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // --- IMPORT DISCIPLINE ---
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'import/no-cycle': 'error',
      'import/no-default-export': 'error', // 2. DISCIPLINED: AI-ready named exports
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],

      // --- STYLISTIC (Synced with Prettier) ---
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: { delimiter: 'semi', requireLast: true },
          singleline: { delimiter: 'semi', requireLast: false },
        },
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],

      // --- HARDENED TYPE SAFETY ---
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
        },
      ],

      // --- AI-READY NAMING ---
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
      ],

      // --- ENGINE PITFALL PREVENTION ---
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message:
            'for..in iterates over the prototype chain. Use for..of or Object.keys/entries().',
        },
        {
          selector: 'LabeledStatement',
          message: 'Labels are GOTO in disguise. Refactor logic into smaller, pure functions.',
        },
        {
          selector: 'SequenceExpression',
          message:
            'The comma operator is confusing and obscures return values. Use multiple statements.',
        },
        {
          selector: 'TSEnumDeclaration',
          message: 'Use const objects with "as const" or union types instead of Enums.',
        },
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
      // TO DO: turn on once lib code is error free
      'max-lines-per-function': 'off',
      'sonarjs/cognitive-complexity': 'warn',
      'no-console': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'import/no-default-export': 'warn',
      // TO DO: delete once lib code is error free
      '@typescript-eslint/naming-convention': ['off'],
      'sonarjs/no-duplicate-string': 'off',
      'max-lines': ['off'],
    },
  },
  // Ensure the config file itself doesn't try to use type-checked rules
  {
    files: ['*.mjs', '*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  eslintConfigPrettier,
);
