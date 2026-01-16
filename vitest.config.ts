import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/test/**/*.ts'],
    exclude: [
      'src/test/lib/**',
      'src/test/input/**',
      '**/node_modules/**',
      'src/test/output/**',
    ],
    globals: true,
    testTimeout: 1000,
    // Added coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './test/coverage',
    },
    setupFiles: ['./src/vitestSetup.ts'],
  },
});
