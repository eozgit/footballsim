import * as common from '../common.js';
import type { Player } from '../types.js';

export function calculateShotTarget(shotConfig: {
  player: Player;
  onTarget: boolean;
  width: number;
  height: number;
  power: number;
}): [number, number] {
  const { player, onTarget, width, height, power } = shotConfig;

  const isTopTeam = player.originPOS[1] < height / 2;

  const playerY = player.currentPOS[1];

  let targetX: number;

  let targetY: number;

  if (onTarget) {
    targetX = common.getRandomNumber(width / 2 - 50, width / 2 + 50);
    targetY = isTopTeam ? height + 1 : -1;
  } else {
    const isLeft = common.getRandomNumber(0, 10) > 5;

    targetX = isLeft
      ? common.getRandomNumber(0, width / 2 - 55)
      : common.getRandomNumber(width / 2 + 55, width);
    targetY = isTopTeam ? playerY + power : playerY - power;
  }

  return [targetX, targetY];
}

export function getTopKickedPosition(
  direction: string,
  position: BallPosition,
  power: number,
): [number, number] {
  const pos: [number, number] = [position[0], position[1]];

  if (direction === `wait`) {
    return newKickedPosition({ pos: pos, lowX: 0, highX: power / 2, lowY: 0, highY: power / 2 });
  } else if (direction === `north`) {
    return newKickedPosition({ pos: pos, lowX: -20, highX: 20, lowY: -power, highY: -(power / 2) });
  } else if (direction === `east`) {
    return newKickedPosition({ pos: pos, lowX: power / 2, highX: power, lowY: -20, highY: 20 });
  } else if (direction === `west`) {
    return newKickedPosition({ pos: pos, lowX: -power, highX: -(power / 2), lowY: -20, highY: 20 });
  } else if (direction === `northeast`) {
    return newKickedPosition({
      pos: pos,
      lowX: 0,
      highX: power / 2,
      lowY: -power,
      highY: -(power / 2),
    });
  } else if (direction === `northwest`) {
    return newKickedPosition({
      pos: pos,
      lowX: -(power / 2),
      highX: 0,
      lowY: -power,
      highY: -(power / 2),
    });
  }

  throw new Error('Unexpected direction');
}

export function getBottomKickedPosition(
  direction: string,
  position: BallPosition,
  power: number,
): [number, number] {
  const pos: [number, number] = [position[0], position[1]];

  if (direction === `wait`) {
    return newKickedPosition({ pos: pos, lowX: 0, highX: power / 2, lowY: 0, highY: power / 2 });
  } else if (direction === `south`) {
    return newKickedPosition({ pos: pos, lowX: -20, highX: 20, lowY: power / 2, highY: power });
  } else if (direction === `east`) {
    return newKickedPosition({ pos: pos, lowX: power / 2, highX: power, lowY: -20, highY: 20 });
  } else if (direction === `west`) {
    return newKickedPosition({ pos: pos, lowX: -power, highX: -(power / 2), lowY: -20, highY: 20 });
  } else if (direction === `southeast`) {
    return newKickedPosition({
      pos: pos,
      lowX: 0,
      highX: power / 2,
      lowY: power / 2,
      highY: power,
    });
  } else if (direction === `southwest`) {
    return newKickedPosition({
      pos: pos,
      lowX: -(power / 2),
      highX: 0,
      lowY: power / 2,
      highY: power,
    });
  }

  throw new Error('Unexpected direction');
}

function newKickedPosition(kickConfig: {
  pos: [number, number];
  lowX: number;
  highX: number;
  lowY: number;
  highY: number;
}): [number, number] {
  const { pos, lowX, highX, lowY, highY } = kickConfig;

  const newPosition: [number, number] = [0, 0];

  newPosition[0] = pos[0] + common.getRandomNumber(lowX, highX);
  newPosition[1] = pos[1] + common.getRandomNumber(lowY, highY);

  return newPosition;
}
