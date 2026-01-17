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
import { resolveDeflection, setBallMovementMatchDetails } from './ballMovement.js';
import * as common from './common.js';
import * as setPositions from './setPositions.js';
import type {
  PlayerProximityDetails,
  MatchDetails,
  MatchEventWeights,
  Player,
  ProximityContext,
  Skill,
  Team,
  ActionContext,
  ResolveBoxContext,
  BallPosition,
} from './types.js';

/**
 * Calculates match event weights based on attacking intent, considering
 * player position, skill, and proximity to teammates and opposition.
 * * Logic preserved: Validates positions, checks for penalty box proximity,
 * and delegates to specific handlers for penalty box vs open play.
 */
function getAttackingIntentWeights(ctx: ActionContext): MatchEventWeights {
  const { matchDetails, player, team, opp: opposition } = ctx;

  const playerPos = ensureValidPosition(player.currentPOS, 'Active player');

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Surroundings Analysis (Extracted to prevent "Canyon" growth)
  const { oppInfo, tmateProximity, oppPos } = analyzePlayerSurroundings(
    player,
    playerPos,
    team,
    opposition,
  );

  // 2. Shooting Range Calculation
  const { halfRange, fullRange } = calculateShootingThresholds(player.skill.shooting, pitchHeight);

  // 3. Delegation based on Pitch Context
  if (
    checkPositionInBottomPenaltyBoxClose({
      position: playerPos,
      pitchWidth: pitchWidth,
      pitchHeight: pitchHeight,
    })
  ) {
    const [curX, curY] = player.currentPOS;

    if (curX === 'NP') {
      throw new Error('Not playing');
    }

    return handleInPenaltyBox({
      playerInformation: oppInfo,
      tmateProximity: tmateProximity,
      currentPOS: [curX, curY],
      pos: playerPos,
      oppCurPos: oppPos,
      halfRange: halfRange,
      shotRange: fullRange,
      pitchHeight: pitchHeight,
    });
  }

  return handleOutsidePenaltyBox(oppInfo, player.currentPOS, fullRange, pitchHeight);
}

/**
 * Helper to analyze proximity of teammates and opponents.
 */
function analyzePlayerSurroundings(
  player: Player,
  playerPos: [number, number],
  team: Team,
  opposition: Team,
): {
  oppInfo: { thePlayer: Player; proxPOS: [number, number]; proxToBall: number };
  tmateProximity: [number, number];
  oppPos: [number, number];
} {
  const oppInfo = setPositions.closestPlayerToPosition(player, opposition, playerPos);

  const tmateInfo = setPositions.closestPlayerToPosition(player, team, playerPos);

  const tmateProximity: [number, number] = [
    Math.abs(tmateInfo.proxPOS[0]),
    Math.abs(tmateInfo.proxPOS[1]),
  ];

  const oppPos = ensureValidPosition(oppInfo.thePlayer.currentPOS, 'Closest opponent');

  return { oppInfo, tmateProximity, oppPos };
}

/**
 * Helper to determine shooting range thresholds based on player skill.
 */
function calculateShootingThresholds(
  shootingSkill: number,
  pitchHeight: number,
): { halfRange: number; fullRange: number } {
  return {
    halfRange: pitchHeight - shootingSkill / 2,
    fullRange: pitchHeight - shootingSkill,
  };
}

/**
 * Utility to guard against 'NP' (No Position) states during simulation logic.
 */
function ensureValidPosition(
  pos: readonly [number | 'NP', number],
  entityName: string,
): [number, number] {
  if (pos[0] === 'NP') {
    throw new Error(`${entityName} position is invalid ('NP')!`);
  }

  return pos as [number, number];
}

/**
 * Resolves weight based on vertical pitch position (Half, Shot, or Default range).
 */
function getRangeBasedWeights(rangeConfig: {
  yPos: number;
  halfRange: number;
  shotRange: number;
  pitchHeight: number;
  weightMap: unknown;
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

/**
 * Shared logic for choosing between "Pass to Teammate" or "Positional" weights.
 */

function resolveBoxWeights(ctx: ResolveBoxContext): MatchEventWeights {
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

// Shared configuration for standard box intentions
const STANDARD_SPACE_WEIGHTS = {
  half: [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0] as MatchEventWeights,
  shot: [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0] as MatchEventWeights,
  fallback: [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0] as MatchEventWeights,
};

function handleInPenaltyBox(penaltyBoxContext: {
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
    defaultWeights: {
      half: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      shot: [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0],
      fallback: [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0],
    },
  });
}

function handleUnderPressureInBox(boxPressureContext: {
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
      weightMap: {
        half: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        shot: [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0],
        fallback: [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0],
      },
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
    defaultWeights: {
      half: [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0],
      shot: [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0],
      fallback: [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0],
    },
  });
}

function getPlayerActionWeights(ctx: ActionContext): MatchEventWeights {
  const { matchDetails, player, team, opp: opposition } = ctx;

  const { position, currentPOS, skill } = player;

  const pos = common.destructPos(currentPOS);

  const [, playerY] = pos;

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const playerInformation = setPositions.closestPlayerToPosition(player, opposition, pos);

  // 1. Special Cases
  if (position === 'GK') {
    return handleGKIntent({ playerInfo: playerInformation });
  }

  if (onBottomCornerBoundary(pos, pitchWidth, pitchHeight)) {
    return [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0];
  }

  if (checkPositionInBottomPenaltyBox(pos, pitchWidth, pitchHeight)) {
    return getAttackingIntentWeights({ matchDetails, player, team, opp: opposition });
  }

  // 2. Vertical Zone Delegation
  // Attacking Third
  if (common.isBetween(playerY, pitchHeight * (2 / 3), pitchHeight * (5 / 6) + 5)) {
    return handleAttackingThirdIntent(playerInformation, currentPOS);
  }

  // Middle Third
  if (common.isBetween(playerY, pitchHeight / 3, pitchHeight * (2 / 3))) {
    return handleMiddleThirdIntent(playerInformation, position, skill);
  }

  // Defensive Third (Fallback)
  return handleDefensiveThirdIntent(playerInformation, position);
}

// Utility to handle the "Opposition Close vs Open Space" pattern seen in all zones
function resolveZonePressure(zonePressureConfig: {
  playerInfo: unknown;
  pressureWeights: MatchEventWeights;
  openWeights: MatchEventWeights;
  distX: number;
  distY: number;
}): MatchEventWeights {
  const { playerInfo, pressureWeights, openWeights, distX = 10, distY = 10 } = zonePressureConfig;

  return oppositionNearContext(playerInfo, distX, distY) ? pressureWeights : openWeights;
}

function handleGKIntent(zonePressureConfig: {
  playerInfo: unknown;
  pressureWeights: MatchEventWeights;
  openWeights: MatchEventWeights;
  distX: number;
  distY: number;
}): MatchEventWeights {
  const { playerInfo, pressureWeights, openWeights, distX, distY } = zonePressureConfig;

  return resolveZonePressure({
    playerInfo: playerInfo,
    pressureWeights: [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40],
    openWeights: [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20],
    distX: 10,
    distY: 25,
  });
}

function handleAttackingThirdIntent(playerInfo: ProximityContext, _: unknown): MatchEventWeights {
  return resolveZonePressure({
    playerInfo: playerInfo,
    pressureWeights: [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0],
    openWeights: [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0],
  });
}

function handleMiddleThirdIntent(
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

function getAttackingThreatWeights(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  const curPOS = validatePlayerPosition(player.currentPOS);

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Analyze surroundings
  const oppInfo = setPositions.closestPlayerToPosition(player, opposition, curPOS);

  const tmateInfo = setPositions.closestPlayerToPosition(player, team, curPOS);

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
      currentPOS: player.currentPOS,
      closeOppPOS: closeOppPOS,
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

/**
 * Resolves intent weights when a player is outside the penalty box.
 * Prioritizes shooting range, then defensive pressure, then open play.
 */
function handleOutsidePenaltyBox(
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

function handleDeepBoxThreat(deepThreatConfig: {
  oppInfo: unknown;
  tmateProx: [number, number];
  currentPOS: [number, number];
  closeOppPOS: [number, number];
  skill: number;
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
    if (
      checkTeamMateSpaceClose({
        tmateProximity: tmateProx,
        lowX: -10,
        highX: 10,
        lowY: -10,
        highY: 10,
      })
    ) {
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

/**
 * Shared logic for defensive third intentions.
 * Returns weight arrays based on pressure and player position.
 */
function resolveDefensiveIntent(
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

function handleBottomDefensiveThirdIntent(
  playerInfo: PlayerProximityDetails,
  position: string,
): MatchEventWeights {
  return resolveDefensiveIntent(playerInfo, position, [0, 0, 30, 0, 0, 0, 0, 50, 0, 10, 10]);
}

function handleDefensiveThirdIntent(
  playerInfo: PlayerProximityDetails,
  position: string,
): MatchEventWeights {
  return resolveDefensiveIntent(playerInfo, position, [0, 0, 40, 0, 0, 0, 0, 30, 0, 20, 10]);
}

function attemptGoalieSave(matchDetails: MatchDetails, goalie: Player, teamName: string): boolean {
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
      matchDetails.iterationLog.push(`ball saved by ${goalie.name} possession to ${teamName}`);
      goalie.stats.saves = (goalie.stats.saves || 0) + 1;
    }

    return true;
  }

  return false;
}

function handleGoalieSave(saveConfig: {
  matchDetails: MatchDetails;
  player: Player;
  ballPos: BallPosition;
  power: number;
  team: Team;
}): [number, number, number] | undefined {
  const { matchDetails, player, ballPos, power, team } = saveConfig;

  const [posX, posY] = player.currentPOS;

  if (posX === 'NP') {
    throw new Error('No position');
  }

  const inGoalieProx =
    common.isBetween(posX, ballPos[0] - 11, ballPos[0] + 11) &&
    common.isBetween(posY, ballPos[1] - 2, ballPos[1] + 2);

  if (inGoalieProx && common.isBetween(ballPos[2], -1, player.skill.jumping + 1)) {
    const savingSkill = player.skill.saving || 0;

    if (savingSkill > common.getRandomNumber(0, power)) {
      setBallMovementMatchDetails({
        matchDetails: matchDetails,
        player: player,
        startPos: ballPos,
        team: team,
      });
      matchDetails.iterationLog.push(`Ball saved`);
      player.stats.saves = (player.stats.saves || 0) + 1;

      return ballPos;
    }
  }

  return undefined;
}

function handlePlayerDeflection(
  deflectionConfig: ActionContext & {
    thisPOS: [number, number];
    ballPos: BallPosition;
    power: number;
  },
): [number, number] | undefined {
  const { matchDetails, player, thisPOS, ballPos, power, team } = deflectionConfig;

  const [posX, posY] = player.currentPOS;

  if (posX === 'NP') {
    throw new Error('No position');
  }

  const inProx =
    common.isBetween(posX, ballPos[0] - 3, ballPos[0] + 3) &&
    common.isBetween(posY, ballPos[1] - 3, ballPos[1] + 3);

  if (inProx && common.isBetween(ballPos[2], -1, player.skill.jumping + 1)) {
    const newPOS = resolveDeflection({
      power: power,
      startPos: thisPOS,
      defPosition: [posX, posY],
      player: player,
      team: team,
      matchDetails: matchDetails,
    });

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
