import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Look for any .js files inside the test/ folder
    include: ['test/**/*.js'],
    // But ignore the helper files in test/lib/ and test/input/
    exclude: [
      'test/lib/**',
      'test/input/**',
      '**/node_modules/**',
      'test/output/**',
    ],
    // This allows you to use 'describe' and 'it' without importing them
    globals: true,
    // Increase timeout because physics simulations can be slow
    testTimeout: 10000,
  },
});
