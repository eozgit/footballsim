import * as common from '../common.js';
import type { Player } from '../types.js';
export function calculatePenaltyTarget(
  pitchSize: [number, number, number],
  player: Player,
  isOnTarget: boolean,
): [number, number] {
  const [pitchWidth, pitchHeight] = pitchSize;

  const shotPower = common.calculatePower(player.skill.strength);

  const target: [number, number] = [0, 0];

  if (isOnTarget) {
    target[0] = common.getRandomNumber(pitchWidth / 2 - 50, pitchWidth / 2 + 50);
  } else {
    const isLeft = common.getRandomNumber(0, 10) > 5;

    target[0] = isLeft
      ? common.getRandomNumber(0, pitchWidth / 2 - 55)
      : common.getRandomNumber(pitchWidth / 2 + 55, pitchWidth);
  }

  // Determine Y direction based on which half the player started in
  const isAttackingDown = player.originPOS[1] > pitchHeight / 2;

  target[1] = isAttackingDown ? player.currentPOS[1] - shotPower : player.currentPOS[1] + shotPower;

  return target;
}
