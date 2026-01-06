import * as common from './common.js';

type DeflectionHandler = (
  pos: [number, number],
  power: number,
) => [number, number];

/**
 * Strategy map to handle coordinate offsets based on direction.
 * Preserves the exact logic of the original function.
 */
const deflectionStrategies: Record<string, DeflectionHandler> = {
  east: (pos, p) => [
    pos[0] - p / 2,
    common.getRandomNumber(pos[1] - 3, pos[1] + 3),
  ],
  west: (pos, p) => [
    pos[0] + p / 2,
    common.getRandomNumber(pos[1] - 3, pos[1] + 3),
  ],
  north: (pos, p) => [
    common.getRandomNumber(pos[0] - 3, pos[0] + 3),
    pos[1] + p / 2,
  ],
  south: (pos, p) => [
    common.getRandomNumber(pos[0] - 3, pos[0] + 3),
    pos[1] - p / 2,
  ],
  northeast: (pos, p) => [pos[0] - p / 2, pos[1] + p / 2],
  northwest: (pos, p) => [pos[0] + p / 2, pos[1] + p / 2],
  southeast: (pos, p) => [pos[0] - p / 2, pos[1] - p / 2],
  southwest: (pos, p) => [pos[0] + p / 2, pos[1] - p / 2],
  wait: (_, p) => [
    common.getRandomNumber(-p / 2, p / 2),
    common.getRandomNumber(-p / 2, p / 2),
  ],
};

/**
 * Calculates the new position of the ball after a deflection.
 * Extracted to src/lib/physics.ts to improve maintainability.
 */
function calculateDeflectionVector(
  direction: string,
  defPosition: [number, number],
  newPower: number,
): [number, number] {
  const handler = deflectionStrategies[direction];

  // Return the calculated position if direction is found, otherwise default to [0, 0]
  return handler ? handler(defPosition, newPower) : [0, 0];
}

export { calculateDeflectionVector };
