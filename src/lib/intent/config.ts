import type { Weights } from '../types.js';

export const STANDARD_SPACE_WEIGHTS: Weights = {
  half: [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0],
  shot: [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0],
  fallback: [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0],
};

export const rangeBasedWeights: Weights = {
  half: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  shot: [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0],
  fallback: [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0],
};

export const boxWeights: Weights = {
  half: [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0],
  shot: [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0],
  fallback: [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0],
};

export const boxWeightsToRestore: Weights = {
  half: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  shot: [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0],
  fallback: [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0],
};
