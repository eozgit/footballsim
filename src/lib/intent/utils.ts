import { checkTeamMateSpaceClose, oppositionNearContext } from '../actions.js';
import * as common from '../common.js';
import { closestPlayerToPosition } from '../position/proximity.js';
import type {
  Weights,
  MatchEventWeights,
  ResolveBoxContext,
  Player,
  Team,
  PlayerProximityDetails,
} from '../types.js';
export function calculateShootingThresholds(
  shootingSkill: number,
  pitchHeight: number,
): { halfRange: number; fullRange: number } {
  return {
    halfRange: pitchHeight - shootingSkill / 2,
    fullRange: pitchHeight - shootingSkill,
  };
}

export function getRangeBasedWeights(rangeConfig: {
  yPos: number;
  halfRange: number;
  shotRange: number;
  pitchHeight: number;
  weightMap: Weights;
}): MatchEventWeights {
  const { yPos, halfRange, shotRange, pitchHeight, weightMap } = rangeConfig;

  if (common.isBetween(yPos, halfRange, pitchHeight)) {
    return weightMap.half;
  }

  if (common.isBetween(yPos, shotRange, pitchHeight)) {
    return weightMap.shot;
  }

  return weightMap.fallback;
}

export function resolveBoxWeights(ctx: ResolveBoxContext): MatchEventWeights {
  const {
    tmateProximity,
    yPos,
    halfRange,
    shotRange,
    pitchHeight,
    spaceConfig,
    spaceWeights,
    defaultWeights,
  } = ctx;

  // ... rest of the function remains exactly the same
  const useSpaceWeights = checkTeamMateSpaceClose({
    tmateProximity: tmateProximity,
    lowX: spaceConfig[0],
    highX: spaceConfig[1],
    lowY: spaceConfig[2],
    highY: spaceConfig[3],
  });

  return getRangeBasedWeights({
    yPos: yPos,
    halfRange: halfRange,
    shotRange: shotRange,
    pitchHeight: pitchHeight,
    weightMap: useSpaceWeights ? spaceWeights : defaultWeights,
  });
}

export function resolveZonePressure(zonePressureConfig: {
  playerInfo: unknown;
  pressureWeights: MatchEventWeights;
  openWeights: MatchEventWeights;
  distX: number;
  distY: number;
}): MatchEventWeights {
  const { playerInfo, pressureWeights, openWeights, distX = 10, distY = 10 } = zonePressureConfig;

  return oppositionNearContext(playerInfo, distX, distY) ? pressureWeights : openWeights;
}

export function analyzePlayerSurroundings(
  player: Player,
  playerPos: [number, number],
  team: Team,
  opposition: Team,
): {
  oppInfo: { thePlayer: Player; proxPOS: [number, number]; proxToBall: number };
  tmateProximity: [number, number];
  oppPos: [number, number];
} {
  const oppInfo = closestPlayerToPosition(player, opposition, playerPos);

  const tmateInfo = closestPlayerToPosition(player, team, playerPos);

  const tmateProximity: [number, number] = [
    Math.abs(tmateInfo.proxPOS[0]),
    Math.abs(tmateInfo.proxPOS[1]),
  ];

  const oppPos = common.destructPos(oppInfo.thePlayer.currentPOS);

  return { oppInfo, tmateProximity, oppPos };
}
