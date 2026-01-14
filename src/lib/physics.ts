import * as common from './common.js';
import type { MatchDetails, BallPosition } from './types.js';

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

/**
 * Updates the ball's cardinal direction based on movement vector.
 * Refactored to use a lookup map to reduce complexity.
 */
function updateBallCardinalDirection(
  matchDetails: MatchDetails,
  nextPOS: BallPosition,
) {
  const [currX, currY] = matchDetails.ball.position;
  const [nextX, nextY] = nextPOS;

  // Calculate delta (preserving the original logic: thisPOS - nextPOS)
  const dx = currX - nextX;
  const dy = currY - nextY;

  // 1. Handle stationary state
  if (dx === 0 && dy === 0) {
    matchDetails.ball.direction = 'wait';

    return;
  }

  // 2. Normalize deltas to -1, 0, or 1 to use as a lookup key
  const sigX = Math.sign(dx); // -1 (East), 0, 1 (West)
  const sigY = Math.sign(dy); // -1 (South), 0, 1 (North)

  // 3. Map signs to cardinal strings
  // Format: [dx_sign][dy_sign]
  const directionMap: Record<string, string> = {
    '0-1': 'south',
    '01': 'north',
    '-10': 'east',
    '10': 'west',
    '-1-1': 'southeast',
    '11': 'northwest',
    '1-1': 'southwest',
    '-11': 'northeast',
  };

  const key = `${sigX}${sigY}`;

  matchDetails.ball.direction =
    directionMap[key] || matchDetails.ball.direction;
}

export { calculateDeflectionVector, updateBallCardinalDirection };
