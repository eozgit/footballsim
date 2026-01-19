import {
  checkPositionInTopPenaltyBoxClose,
  checkOppositionAhead,
  oppositionNearContext,
  checkTeamMateSpaceClose,
} from '../actions.js';
import { closestPlayerToPosition } from '../position/proximity.js';
import type { MatchDetails, Player, Team, MatchEventWeights, Skill, AreaBounds } from '../types.js';

import * as common from '@/lib/common.js';
export function getAttackingThreatWeights(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  const curPOS = validatePlayerPosition(player.currentPOS);

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Analyze surroundings
  const oppInfo = closestPlayerToPosition(player, opposition, curPOS);

  const tmateInfo = closestPlayerToPosition(player, team, curPOS);

  const tmateProximity: [number, number] = [
    Math.abs(tmateInfo.proxPOS[0]),
    Math.abs(tmateInfo.proxPOS[1]),
  ];

  const closeOppPOS = oppInfo.thePlayer.currentPOS;

  // 2. Branch 1: Deep inside the penalty box
  if (checkPositionInTopPenaltyBoxClose(curPOS, pitchWidth, pitchHeight)) {
    return handleDeepBoxThreat({
      oppInfo: oppInfo,
      tmateProx: tmateProximity,
      currentPOS: common.destructPos(player.currentPOS),
      closeOppPOS: common.destructPos(closeOppPOS),
      skill: player.skill,
    });
  }

  // 3. Branch 2: Edge of the box / Long range (shooting skill based)
  if (common.isBetween(curPOS[1], 0, player.skill.shooting)) {
    return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
  }

  // 4. Branch 3: Opposition blocking the path ahead
  if (checkOppositionAhead(closeOppPOS, player.currentPOS)) {
    return [20, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0];
  }

  // Default outside danger zone
  return [50, 0, 20, 20, 0, 0, 0, 10, 0, 0, 0];
}

function validatePlayerPosition(pos: readonly [number | 'NP', number]): [number, number] {
  if (pos[0] === 'NP') {
    throw new Error('No player position!');
  }

  return pos as [number, number];
}

function handleDeepBoxThreat(deepThreatConfig: {
  oppInfo: unknown;
  tmateProx: [number, number];
  currentPOS: [number, number];
  closeOppPOS: [number, number];
  skill: Skill;
}): MatchEventWeights {
  const { oppInfo, tmateProx, currentPOS, closeOppPOS, skill } = deepThreatConfig;

  // Scenario: Defender is closing in
  if (oppositionNearContext(oppInfo, 20, 20)) {
    return handlePressuredBoxDecision(tmateProx, currentPOS, closeOppPOS, skill);
  }

  // Scenario: Space available
  if (
    checkTeamMateSpaceClose({
      tmateProximity: tmateProx,
      lowX: -10,
      highX: 10,
      lowY: -4,
      highY: 10,
    })
  ) {
    if (common.isBetween(currentPOS[1], 0, skill.shooting / 2)) {
      return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
      return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
    }

    return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
  }

  // Default Box Logic (No pressure, no immediate teammate)
  if (common.isBetween(currentPOS[1], 0, skill.shooting / 2)) {
    return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
    return [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0];
  }

  return [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0];
}

function handlePressuredBoxDecision(
  tmateProx: [number, number],
  currentPOS: readonly [number | 'NP', number],
  closeOppPOS: readonly [number | 'NP', number],
  skill: Skill,
): MatchEventWeights {
  if (checkOppositionAhead(closeOppPOS, currentPOS)) {
    if (checkTeamMateSpaceClose(getSpaceConfig(tmateProx, true))) {
      return [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0];
    }

    if (common.isBetween(currentPOS[1], 0, skill.shooting / 2)) {
      return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
      return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
    }

    return [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0];
  }

  if (checkTeamMateSpaceClose(getSpaceConfig(tmateProx, false))) {
    if (common.isBetween(currentPOS[1], 0, skill.shooting / 2)) {
      return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
      return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
    }

    return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
  }

  // Fallback pressured logic
  if (common.isBetween(currentPOS[1], 0, skill.shooting / 2)) {
    return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
    return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
  }

  return [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0];
}

function getSpaceConfig(
  tmateProx: [number, number],
  isOppositionAhead: boolean,
): AreaBounds & { tmateProximity: number[] } {
  if (isOppositionAhead) {
    return {
      tmateProximity: tmateProx,
      lowX: -10,
      highX: 10,
      lowY: -10,
      highY: 10,
    };
  }

  return {
    tmateProximity: tmateProx,
    lowX: -10,
    highX: 10,
    lowY: -4,
    highY: 10,
  };
}
