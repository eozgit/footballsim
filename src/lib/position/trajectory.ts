import * as common from '../common.js';
import { closestPlayerToPosition } from '../setPositions.js';
import { initStats } from '../setVariables.js';
import type { Team, BallPosition, Player } from '../types.js';

const mockPlayer: Player = {
  name: 'George Johnson',
  shirtNumber: 45,
  position: 'ST', // or "ST"
  rating: '85',
  skill: {
    passing: 80,
    shooting: 90,
    tackling: 50,
    saving: 10,
    agility: 85,
    strength: 75,
    penalty_taking: 80,
    jumping: 70,
  },
  currentPOS: [400, 200],
  fitness: 95,
  injured: false,
  playerID: 10,
  originPOS: [400, 200],
  intentPOS: [410, 210],
  action: 'none',
  offside: false,
  hasBall: false,
  stats: initStats(),
};

export function getInterceptTrajectory(
  opposition: Team,
  ballPosition: BallPosition,
  pitchSize: [number, number, number],
): BallPosition[] {
  const [pitchWidth, pitchHeight] = pitchSize;

  const playerInformation = closestPlayerToPosition(mockPlayer, opposition, ballPosition);

  const interceptPlayer = playerInformation.thePlayer;

  const targetX = pitchWidth / 2;

  const targetY = interceptPlayer.originPOS[1] < pitchHeight / 2 ? pitchHeight : 0;

  if (interceptPlayer.currentPOS[0] === 'NP') {
    throw new Error('Player no position!');
  }

  const moveX = targetX - interceptPlayer.currentPOS[0];

  const moveY = targetY - interceptPlayer.currentPOS[1];

  const highNum = Math.abs(moveX) <= Math.abs(moveY) ? Math.abs(moveY) : Math.abs(moveX);

  const xDiff = moveX / highNum;

  const yDiff = moveY / highNum;

  const POI: BallPosition[] = [[...interceptPlayer.currentPOS] as [number, number, number?]];

  for (let i = 0; i < Math.round(highNum); i++) {
    const lastArrayPOS = POI.length - 1;

    const lastXPOS = POI[lastArrayPOS][0];

    const lastYPOS = POI[lastArrayPOS][1];

    POI.push([common.round(lastXPOS + xDiff, 0), common.round(lastYPOS + yDiff, 0)]);
  }

  return POI;
}
