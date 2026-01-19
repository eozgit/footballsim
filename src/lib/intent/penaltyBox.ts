import {
  oppositionNearContext,
  checkOppositionBelow,
  checkTeamMateSpaceClose,
} from '../actions.js';
import * as common from '../common.js';
import type {
  Player,
  MatchEventWeights,
  PlayerProximityDetails,
  ProximityContext,
} from '../types.js';
import { assert } from '../utils/assert.js';

import {
  STANDARD_SPACE_WEIGHTS,
  boxWeightsToRestore,
  rangeBasedWeights,
  boxWeights,
} from './config.js';
import { resolveBoxWeights, getRangeBasedWeights, resolveZonePressure } from './utils.js';

export function handleInPenaltyBox(penaltyBoxContext: {
  playerInformation: Player;
  tmateProximity: [number, number];
  currentPOS: [number, number];
  pos: [number, number];
  oppCurPos: [number, number];
  halfRange: number;
  shotRange: number;
  pitchHeight: number;
}): MatchEventWeights {
  const {
    playerInformation,
    tmateProximity,
    currentPOS,
    pos,
    oppCurPos,
    halfRange,
    shotRange,
    pitchHeight,
  } = penaltyBoxContext;

  // 1. Delegation to Pressure logic if opposition is close
  if (oppositionNearContext(playerInformation, 6, 6)) {
    return handleUnderPressureInBox({
      tmateProximity: tmateProximity,
      currentPOS: currentPOS,
      pos: pos,
      oppCurPos: oppCurPos,
      halfRange: halfRange,
      shotRange: shotRange,
      pitchHeight: pitchHeight,
    });
  }

  // 2. Default box resolution
  return resolveBoxWeights({
    tmateProximity,
    yPos: currentPOS[1], // Mapping original currentPOS[1] to yPos
    halfRange,
    shotRange,
    pitchHeight,
    spaceConfig: [-10, 10, -4, 10],
    spaceWeights: STANDARD_SPACE_WEIGHTS,
    defaultWeights: boxWeightsToRestore,
  });
}

export function handleUnderPressureInBox(boxPressureContext: {
  tmateProximity: [number, number];
  currentPOS: [number, number];
  pos: [number, number];
  oppCurPos: [number, number];
  halfRange: number;
  shotRange: number;
  pitchHeight: number;
}): MatchEventWeights {
  const { tmateProximity, currentPOS, pos, oppCurPos, halfRange, shotRange, pitchHeight } =
    boxPressureContext;

  const yPos = currentPOS[1];

  // 1. Check for specific "Opposition Below" logic
  if (checkOppositionBelow(oppCurPos, pos)) {
    if (
      checkTeamMateSpaceClose({
        tmateProximity: tmateProximity,
        lowX: -10,
        highX: 10,
        lowY: -10,
        highY: 10,
      })
    ) {
      return [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0];
    }

    return getRangeBasedWeights({
      yPos: yPos,
      halfRange: halfRange,
      shotRange: shotRange,
      pitchHeight: pitchHeight,
      weightMap: rangeBasedWeights,
    });
  }

  // 2. Standard pressure resolution
  return resolveBoxWeights({
    tmateProximity,
    yPos,
    halfRange,
    shotRange,
    pitchHeight,
    spaceConfig: [-10, 10, -4, 10],
    spaceWeights: STANDARD_SPACE_WEIGHTS,
    defaultWeights: boxWeights,
  });
}

export function handleOutsidePenaltyBox(
  playerInformation: PlayerProximityDetails,
  currentPOS: readonly [number | 'NP', number],
  shotRange: number,
  pitchHeight: number,
): MatchEventWeights {
  const playerY = currentPOS[1];

  // 1. If in shot range, shooting is the priority regardless of pressure
  if (common.isBetween(playerY, shotRange, pitchHeight)) {
    return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
  }

  // 2. Resolve based on opposition pressure vs. open space
  return resolveZonePressure({
    playerInfo: playerInformation,
    pressureWeights: [10, 0, 70, 0, 0, 0, 0, 20, 0, 0, 0],
    openWeights: [70, 0, 20, 0, 0, 0, 0, 10, 0, 0, 0],
  });
}
