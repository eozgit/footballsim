// vitest-setup.js
import { afterAll } from 'vitest';

afterAll(async () => {
  // This runs at the end of every test file
  // It gives our __typeSpy HTTP requests time to leave the building
  await new Promise((resolve) => setTimeout(resolve, 500));
});
