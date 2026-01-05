import {
  checkPositionInBottomPenaltyBoxClose,
  checkOppositionBelow,
  checkTeamMateSpaceClose,
  oppositionNearContext,
} from './actions.js';
import * as common from './common.js';
import * as setPositions from './setPositions.js';
import type {
  BallPosition,
  MatchDetails,
  MatchEventWeights,
  Player,
  Team,
} from './types.js';

function getAttackingIntentWeights(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  const [theX] = player.currentPOS;
  if (theX === 'NP') throw new Error('No player position!');
  const curPOS = player.currentPOS as [number, number];

  const playerInformation = setPositions.closestPlayerToPosition(
    player,
    opposition,
    curPOS,
  );
  const ownPlayerInformation = setPositions.closestPlayerToPosition(
    player,
    team,
    curPOS,
  );

  const tmateProximity: [number, number] = [
    Math.abs(ownPlayerInformation.proxPOS[0]),
    Math.abs(ownPlayerInformation.proxPOS[1]),
  ];

  const [curX, curY] = playerInformation.thePlayer.currentPOS;
  if (curX === 'NP') throw new Error('No player position!');

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const { currentPOS, skill } = player;
  const [playerX, playerY] = currentPOS;
  if (playerX === 'NP') throw new Error('No player position!');

  const pos: [number, number] = [playerX, playerY];
  const halfRange = pitchHeight - skill.shooting / 2;
  const shotRange = pitchHeight - skill.shooting;

  if (checkPositionInBottomPenaltyBoxClose(pos, pitchWidth, pitchHeight)) {
    return handleInPenaltyBox(
      playerInformation,
      tmateProximity,
      currentPOS,
      pos,
      [curX, curY],
      halfRange,
      shotRange,
      pitchHeight,
    );
  }

  return handleOutsidePenaltyBox(
    playerInformation,
    currentPOS,
    shotRange,
    pitchHeight,
  );
}

function handleInPenaltyBox(
  playerInformation: {
    thePlayer?: Player;
    proxPOS: [number, number] | number[];
    proxToBall?: number;
  },
  tmateProximity: [number, number],
  currentPOS: [number | 'NP', number] | number[],
  pos: [number, number],
  oppCurPos: BallPosition,
  halfRange: number,
  shotRange: number,
  pitchHeight: number,
): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 6, 6)) {
    return handleUnderPressureInBox(
      tmateProximity,
      currentPOS,
      pos,
      oppCurPos,
      halfRange,
      shotRange,
      pitchHeight,
    );
  }

  if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
    if (common.isBetween(currentPOS[1], halfRange, pitchHeight))
      return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
    if (common.isBetween(currentPOS[1], shotRange, pitchHeight))
      return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
    return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
  }

  if (common.isBetween(currentPOS[1], halfRange, pitchHeight))
    return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  if (common.isBetween(currentPOS[1], shotRange, pitchHeight))
    return [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0];
  return [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0];
}

function handleUnderPressureInBox(
  tmateProximity: [number, number],
  currentPOS: [number | 'NP', number] | number[],
  pos: BallPosition,
  oppCurPos: BallPosition,
  halfRange: number,
  shotRange: number,
  pitchHeight: number,
): MatchEventWeights {
  if (checkOppositionBelow(oppCurPos, pos)) {
    if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -10, 10))
      return [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0];
    if (common.isBetween(currentPOS[1], halfRange, pitchHeight))
      return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (common.isBetween(currentPOS[1], shotRange, pitchHeight))
      return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
    return [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0];
  }

  if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
    if (common.isBetween(currentPOS[1], halfRange, pitchHeight))
      return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
    if (common.isBetween(currentPOS[1], shotRange, pitchHeight))
      return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
    return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
  }

  if (common.isBetween(currentPOS[1], halfRange, pitchHeight))
    return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
  if (common.isBetween(currentPOS[1], shotRange, pitchHeight))
    return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
  return [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0];
}

function handleOutsidePenaltyBox(
  playerInformation: {
    thePlayer?: Player;
    proxPOS: [number, number] | number[];
    proxToBall?: number;
  },
  currentPOS: [number | 'NP', number] | number[],
  shotRange: number,
  pitchHeight: number,
): MatchEventWeights {
  if (common.isBetween(currentPOS[1], shotRange, pitchHeight))
    return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
  if (oppositionNearContext(playerInformation, 6, 6))
    return [10, 0, 70, 0, 0, 0, 0, 20, 0, 0, 0];
  return [70, 0, 20, 0, 0, 0, 0, 10, 0, 0, 0];
}

export { getAttackingIntentWeights };
