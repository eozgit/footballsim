import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.ts'],
    exclude: [
      'test/lib/**',
      'test/input/**',
      '**/node_modules/**',
      'test/output/**',
    ],
    globals: true,
    testTimeout: 1000,
  },
});
