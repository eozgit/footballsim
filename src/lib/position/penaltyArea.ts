import * as common from '../common.js';
import type { BallPosition } from '../types.js';

export function checkPositionInBottomPenaltyBox(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
): boolean {
  const yPos = common.isBetween(position[0], pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 5);

  const xPos = common.isBetween(position[1], pitchHeight - pitchHeight / 6 + 5, pitchHeight);

  return yPos && xPos;
}

export function checkPositionInBottomPenaltyBoxClose(penaltyBoxConfig: {
  position: [number, number];
  pitchWidth: number;
  pitchHeight: number;
}): boolean {
  const { position, pitchWidth, pitchHeight } = penaltyBoxConfig;

  const yPos = common.isBetween(position[0], pitchWidth / 3 - 5, pitchWidth - pitchWidth / 3 + 5);

  const xPos = common.isBetween(position[1], pitchHeight - pitchHeight / 12 + 5, pitchHeight);

  return yPos && xPos;
}

export function checkPositionInTopPenaltyBox(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
): boolean {
  const xPos = common.isBetween(position[0], pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 5);

  const yPos = common.isBetween(position[1], 0, pitchHeight / 6 - 5);

  return yPos && xPos;
}

export function checkPositionInTopPenaltyBoxClose(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
): boolean {
  const xPos = common.isBetween(position[0], pitchWidth / 3 - 5, pitchWidth - pitchWidth / 3 + 5);

  const yPos = common.isBetween(position[1], 0, pitchHeight / 12 - 5);

  return yPos && xPos;
}
