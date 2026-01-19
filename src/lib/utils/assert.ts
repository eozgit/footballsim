// src/lib/utils/assert.ts
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[Assertion Failed]: ${message}`);
  }
}
