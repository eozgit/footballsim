import type { Team } from '../types.js';

export function offsideYPOS(
  team: Team,
  side: unknown,
  pitchHeight: number,
): { pos1: number; pos2: number } {
  const offsideYPOS = {
    pos1: 0,
    pos2: pitchHeight / 2,
  };

  for (const thisPlayer of team.players) {
    if (thisPlayer.position === `GK`) {
      const [, position1] = thisPlayer.currentPOS;

      offsideYPOS.pos1 = position1;

      if (thisPlayer.hasBall) {
        offsideYPOS.pos2 = position1;

        return offsideYPOS;
      }
    } else if (side === `top`) {
      if (thisPlayer.currentPOS[1] < offsideYPOS.pos2) {
        const [, position2] = thisPlayer.currentPOS;

        offsideYPOS.pos2 = position2;
      }
    } else if (thisPlayer.currentPOS[1] > offsideYPOS.pos2) {
      const [, position2] = thisPlayer.currentPOS;

      offsideYPOS.pos2 = position2;
    }
  }

  return offsideYPOS;
}
