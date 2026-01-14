import {
  checkOppositionAhead,
  checkOppositionBelow,
  checkPositionInBottomPenaltyBox,
  checkPositionInBottomPenaltyBoxClose,
  checkPositionInTopPenaltyBoxClose,
  checkTeamMateSpaceClose,
  onBottomCornerBoundary,
  oppositionNearContext,
} from './actions.js';
import {
  resolveDeflection,
  setBallMovementMatchDetails,
} from './ballMovement.js';
import * as common from './common.js';
import * as setPositions from './setPositions.js';
import type {
  BallPosition,
  MatchDetails,
  MatchEventWeights,
  Player,
  Skill,
  Team,
} from './types.js';

/**
 * Calculates match event weights based on attacking intent, considering
 * player position, skill, and proximity to teammates and opposition.
 * * Logic preserved: Validates positions, checks for penalty box proximity,
 * and delegates to specific handlers for penalty box vs open play.
 */
function getAttackingIntentWeights(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  const playerPos = ensureValidPosition(player.currentPOS, 'Active player');
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Surroundings Analysis
  const oppInfo = setPositions.closestPlayerToPosition(
    player,
    opposition,
    playerPos,
  );
  const tmateInfo = setPositions.closestPlayerToPosition(
    player,
    team,
    playerPos,
  );

  const tmateProximity: [number, number] = [
    Math.abs(tmateInfo.proxPOS[0]),
    Math.abs(tmateInfo.proxPOS[1]),
  ];

  const oppPos = ensureValidPosition(
    oppInfo.thePlayer.currentPOS,
    'Closest opponent',
  );

  // 2. Shooting Range Calculation
  const { halfRange, fullRange } = calculateShootingThresholds(
    player.skill.shooting,
    pitchHeight,
  );

  // 3. Delegation based on Pitch Context
  if (
    checkPositionInBottomPenaltyBoxClose(playerPos, pitchWidth, pitchHeight)
  ) {
    return handleInPenaltyBox(
      oppInfo,
      tmateProximity,
      player.currentPOS,
      playerPos,
      oppPos,
      halfRange,
      fullRange,
      pitchHeight,
    );
  }

  return handleOutsidePenaltyBox(
    oppInfo,
    player.currentPOS,
    fullRange,
    pitchHeight,
  );
}

/**
 * Helper to determine shooting range thresholds based on player skill.
 */
function calculateShootingThresholds(
  shootingSkill: number,
  pitchHeight: number,
) {
  return {
    halfRange: pitchHeight - shootingSkill / 2,
    fullRange: pitchHeight - shootingSkill,
  };
}

/**
 * Utility to guard against 'NP' (No Position) states during simulation logic.
 */
function ensureValidPosition(
  pos: [number | 'NP', number],
  entityName: string,
): [number, number] {
  if (pos[0] === 'NP') {
    throw new Error(`${entityName} position is invalid ('NP')!`);
  }
  return pos as [number, number];
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
    if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) {
      return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
      return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
    }
    return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
  }

  if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) {
    return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
    return [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0];
  }
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
    if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -10, 10)) {
      return [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0];
    }
    if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) {
      return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
      return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
    }
    return [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0];
  }

  if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
    if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) {
      return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
      return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
    }
    return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
  }

  if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) {
    return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
    return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
  }
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
  if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
    return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
  }
  if (oppositionNearContext(playerInformation, 6, 6)) {
    return [10, 0, 70, 0, 0, 0, 0, 20, 0, 0, 0];
  }
  return [70, 0, 20, 0, 0, 0, 0, 10, 0, 0, 0];
}
function getPlayerActionWeights(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  const { position, currentPOS, skill } = player;

  // 1. Validation and Setup
  if (currentPOS[0] === 'NP') {
    throw new Error('No player position!');
  }
  const pos = currentPOS as [number, number];
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const playerInformation = setPositions.closestPlayerToPosition(
    player,
    opposition,
    pos,
  );

  // 2. High-Priority Specialized Logic
  if (position === 'GK') {
    return handleGKIntent(playerInformation);
  }

  if (onBottomCornerBoundary(pos, pitchWidth, pitchHeight)) {
    return [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0];
  }

  if (checkPositionInBottomPenaltyBox(pos, pitchWidth, pitchHeight)) {
    return getAttackingIntentWeights(matchDetails, player, team, opposition);
  }

  // 3. Zone-based Delegation (Thirds of the pitch)
  const playerY = pos[1];

  // Attacking Third
  if (
    common.isBetween(playerY, pitchHeight * (2 / 3), pitchHeight * (5 / 6) + 5)
  ) {
    return handleAttackingThirdIntent(playerInformation, currentPOS);
  }

  // Middle Third
  if (common.isBetween(playerY, pitchHeight / 3, pitchHeight * (2 / 3))) {
    return handleMiddleThirdIntent(playerInformation, position, skill);
  }

  // Defensive Third (Fallback)
  return handleDefensiveThirdIntent(playerInformation, position);
}

function handleGKIntent(playerInformation: {
  thePlayer?: Player;
  proxPOS: [number, number] | number[];
  proxToBall?: number;
}): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 25)) {
    return [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40];
  }
  return [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20];
}

function handleAttackingThirdIntent(
  playerInformation: {
    thePlayer?: Player;
    proxPOS: [number, number] | number[];
    proxToBall?: number;
  },
  _: [number | 'NP', number],
): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 10)) {
    return [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0];
  }
  return [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0];
}

function handleMiddleThirdIntent(
  playerInformation: {
    thePlayer?: Player;
    proxPOS: [number, number] | number[];
    proxToBall?: number;
  },
  position: string,
  skill: Skill,
): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 10)) {
    return [0, 20, 30, 20, 0, 0, 20, 0, 0, 0, 10];
  }
  if (skill.shooting > 85) {
    return [10, 10, 30, 0, 0, 0, 50, 0, 0, 0, 0];
  }
  if (position === 'LM' || position === 'CM' || position === 'RM') {
    return [0, 10, 10, 10, 0, 0, 0, 30, 40, 0, 0];
  }
  if (position === 'ST') {
    return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
  }
  return [0, 0, 10, 0, 0, 0, 0, 60, 20, 0, 10];
}

function handleDefensiveThirdIntent(
  playerInformation: {
    thePlayer?: Player;
    proxPOS: [number, number] | number[];
    proxToBall?: number;
  },
  position: string,
): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 10)) {
    return [0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20];
  }
  if (position === 'LM' || position === 'CM' || position === 'RM') {
    return [0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0];
  }
  if (position === 'ST') {
    return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
  }
  return [0, 0, 40, 0, 0, 0, 0, 30, 0, 20, 10];
}

function getAttackingThreatWeights(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  const curPOS = validatePlayerPosition(player.currentPOS);
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Analyze surroundings
  const oppInfo = setPositions.closestPlayerToPosition(
    player,
    opposition,
    curPOS,
  );
  const tmateInfo = setPositions.closestPlayerToPosition(player, team, curPOS);

  const tmateProximity: [number, number] = [
    Math.abs(tmateInfo.proxPOS[0]),
    Math.abs(tmateInfo.proxPOS[1]),
  ];

  const closeOppPOS = oppInfo.thePlayer.currentPOS;

  // 2. Branch 1: Deep inside the penalty box
  if (checkPositionInTopPenaltyBoxClose(curPOS, pitchWidth, pitchHeight)) {
    return handleDeepBoxThreat(
      oppInfo,
      tmateProximity,
      player.currentPOS,
      closeOppPOS,
      player.skill,
    );
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

function validatePlayerPosition(
  pos: [number | 'NP', number],
): [number, number] {
  if (pos[0] === 'NP') {
    throw new Error('No player position!');
  }
  return pos as [number, number];
}

function handleDeepBoxThreat(
  oppInfo: {
    thePlayer?: Player;
    proxPOS: [number, number] | number[];
    proxToBall?: number;
  },
  tmateProx: [number, number],
  currentPOS: [number | 'NP', number],
  closeOppPOS: [number | 'NP', number],
  skill: Skill,
): MatchEventWeights {
  // Scenario: Defender is closing in
  if (oppositionNearContext(oppInfo, 20, 20)) {
    return handlePressuredBoxDecision(
      tmateProx,
      currentPOS,
      closeOppPOS,
      skill,
    );
  }

  // Scenario: Space available
  if (checkTeamMateSpaceClose(tmateProx, -10, 10, -4, 10)) {
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
  currentPOS: [number | 'NP', number],
  closeOppPOS: [number | 'NP', number],
  skill: Skill,
): MatchEventWeights {
  if (checkOppositionAhead(closeOppPOS, currentPOS)) {
    if (checkTeamMateSpaceClose(tmateProx, -10, 10, -10, 10)) {
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

  if (checkTeamMateSpaceClose(tmateProx, -10, 10, -4, 10)) {
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

// src/lib/intentLogic.ts

function handleBottomGKIntent(playerInformation: {
  thePlayer?: Player;
  proxPOS: [number, number];
  proxToBall?: number;
}): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 25)) {
    return [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40];
  }
  return [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20];
}

function handleBottomAttackingThirdIntent(playerInformation: {
  thePlayer?: Player;
  proxPOS: [number, number];
  proxToBall?: number;
}): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 10)) {
    return [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0];
  }
  return [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0];
}

function handleBottomDefensiveThirdIntent(
  playerInformation: {
    thePlayer?: Player;
    proxPOS: [number, number];
    proxToBall?: number;
  },
  position: string,
): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 10)) {
    return [0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20];
  }
  if (position === 'LM' || position === 'CM' || position === 'RM') {
    return [0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0];
  }
  if (position === 'ST') {
    return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
  }
  return [0, 0, 30, 0, 0, 0, 0, 50, 0, 10, 10];
}
function attemptGoalieSave(
  matchDetails: MatchDetails,
  goalie: Player,
  teamName: string,
): boolean {
  const [ballX, ballY] = matchDetails.ball.position;
  const ballProx = 8;
  const [goalieX, goalieY] = goalie.currentPOS;
  if (goalieX === 'NP') {
    throw new Error('No player position!');
  }
  const isNear =
    common.isBetween(ballX, goalieX - ballProx, goalieX + ballProx) &&
    common.isBetween(ballY, goalieY - ballProx, goalieY + ballProx);

  if (isNear && goalie.skill.saving > common.getRandomNumber(0, 100)) {
    setPositions.setGoalieHasBall(matchDetails, goalie);

    if (
      common.inTopPenalty(matchDetails, [ballX, ballY]) ||
      common.inBottomPenalty(matchDetails, [ballX, ballY])
    ) {
      matchDetails.iterationLog.push(
        `ball saved by ${goalie.name} possession to ${teamName}`,
      );
      goalie.stats.saves = (goalie.stats.saves || 0) + 1;
    }
    return true;
  }
  return false;
}
function handleGoalieSave(
  matchDetails: MatchDetails,
  player: Player,
  ballPos: [number, number, number],
  power: number,
  team: Team,
): [number, number, number] | undefined {
  const [posX, posY] = player.currentPOS;
  const inGoalieProx =
    common.isBetween(posX, ballPos[0] - 11, ballPos[0] + 11) &&
    common.isBetween(posY, ballPos[1] - 2, ballPos[1] + 2);

  if (
    inGoalieProx &&
    common.isBetween(ballPos[2], -1, player.skill.jumping + 1)
  ) {
    const savingSkill = player.skill.saving || 0;
    if (savingSkill > common.getRandomNumber(0, power)) {
      setBallMovementMatchDetails(matchDetails, player, ballPos, team);
      matchDetails.iterationLog.push(`Ball saved`);
      player.stats.saves = (player.stats.saves || 0) + 1;
      return ballPos;
    }
  }
  return undefined;
}
function handlePlayerDeflection(
  matchDetails: MatchDetails,
  player: Player,
  thisPOS: [number, number],
  ballPos: [number, number, number],
  power: number,
  team: Team,
): [number, number] | undefined {
  const [posX, posY] = player.currentPOS;
  const inProx =
    common.isBetween(posX, ballPos[0] - 3, ballPos[0] + 3) &&
    common.isBetween(posY, ballPos[1] - 3, ballPos[1] + 3);

  if (inProx && common.isBetween(ballPos[2], -1, player.skill.jumping + 1)) {
    const newPOS = resolveDeflection(
      power,
      thisPOS,
      player.currentPOS,
      player,
      team,
      matchDetails,
    );
    matchDetails.iterationLog.push(`Ball deflected`);
    return [common.round(newPOS[0], 2), common.round(newPOS[1], 2)];
  }
  return undefined;
}
export {
  getAttackingIntentWeights,
  getPlayerActionWeights,
  getAttackingThreatWeights,
  handleBottomGKIntent,
  handleBottomAttackingThirdIntent,
  handleBottomDefensiveThirdIntent,
  attemptGoalieSave,
  handleGoalieSave,
  handlePlayerDeflection,
};
