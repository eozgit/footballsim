import * as common from '../common.js';
import type { MatchDetails, Player } from '../types.js';
export function completeMovement(
  matchDetails: MatchDetails,
  player: Player,
  move: number[],
): readonly [number, number] {
  const { currentPOS } = player;

  const [oldX, oldY] = common.destructPos(currentPOS);

  const [dx, dy] = move;

  let newX = oldX + dx;

  let newY = oldY + dy;

  // Validate bounds (Correcting the logic to use the new values)
  if (newX > matchDetails.pitchSize[0] || newX < 0) {
    newX = oldX;
  }

  if (newY > matchDetails.pitchSize[1] || newY < 0) {
    newY = oldY;
  }

  // Apply the update
  common.setPlayerXY(player, newX, newY);

  return [newX, newY];
}
