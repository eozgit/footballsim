import { oppositionNearContext } from '../actions.js';
import type {
  MatchEventWeights,
  PlayerProximityDetails,
  ProximityContext,
  Skill,
} from '../types.js';

import { resolveZonePressure } from './utils.js';

export function handleGKIntent(zonePressureConfig: {
  playerInfo: PlayerProximityDetails;
  pressureWeights?: MatchEventWeights;
  openWeights?: MatchEventWeights;
  distX?: number;
  distY?: number;
}): MatchEventWeights {
  const { playerInfo } = zonePressureConfig;

  return resolveZonePressure({
    playerInfo: playerInfo,
    pressureWeights: [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40],
    openWeights: [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20],
    distX: 10,
    distY: 25,
  });
}

export function handleAttackingThirdIntent(
  playerInfo: PlayerProximityDetails,
  _: unknown,
): MatchEventWeights {
  return resolveZonePressure({
    playerInfo: playerInfo,
    pressureWeights: [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0],
    openWeights: [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0],
  });
}

export function handleMiddleThirdIntent(
  playerInfo: ProximityContext,
  position: string,
  skill: Skill,
): MatchEventWeights {
  // Pressure check remains the highest priority in Middle Third
  if (oppositionNearContext(playerInfo, 10, 10)) {
    return [0, 20, 30, 20, 0, 0, 20, 0, 0, 0, 10];
  }

  // Skill and Position based branching for open space
  if (skill.shooting > 85) {
    return [10, 10, 30, 0, 0, 0, 50, 0, 0, 0, 0];
  }

  const isMidfielder = ['LM', 'CM', 'RM'].includes(position);

  if (isMidfielder) {
    return [0, 10, 10, 10, 0, 0, 0, 30, 40, 0, 0];
  }

  if (position === 'ST') {
    return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
  }

  return [0, 0, 10, 0, 0, 0, 0, 60, 20, 0, 10];
}

export function handleBottomDefensiveThirdIntent(
  playerInfo: PlayerProximityDetails,
  position: string,
): MatchEventWeights {
  return resolveDefensiveIntent(playerInfo, position, [0, 0, 30, 0, 0, 0, 0, 50, 0, 10, 10]);
}

export function handleDefensiveThirdIntent(
  playerInfo: PlayerProximityDetails,
  position: string,
): MatchEventWeights {
  return resolveDefensiveIntent(playerInfo, position, [0, 0, 40, 0, 0, 0, 0, 30, 0, 20, 10]);
}

export function resolveDefensiveIntent(
  playerInformation: PlayerProximityDetails,
  position: string,
  fallbackWeights: MatchEventWeights,
): MatchEventWeights {
  // 1. High Pressure / Opposition Near
  if (oppositionNearContext(playerInformation, 10, 10)) {
    return [0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20];
  }

  // 2. Midfielders
  if (['LM', 'CM', 'RM'].includes(position)) {
    return [0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0];
  }

  // 3. Strikers
  if (position === 'ST') {
    return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
  }

  // 4. Default for Defenders/Goalies
  return fallbackWeights;
}
