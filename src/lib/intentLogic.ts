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
function getPlayerActionWeights(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  if (player.currentPOS[0] === 'NP') throw new Error('No player position!');

  const playerInformation = setPositions.closestPlayerToPosition(
    player,
    opposition,
    player.currentPOS as [number, number],
  );

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const { position, currentPOS, skill } = player;
  const [playerX, playerY] = currentPOS;

  if (playerX === 'NP') throw new Error('No player position!');
  const pos: [number, number] = [playerX, playerY];

  // 1. Specialized Position / Boundary Logic
  if (position === 'GK') {
    return handleGKIntent(playerInformation);
  }

  if (onBottomCornerBoundary(pos, pitchWidth, pitchHeight)) {
    return [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0];
  }

  if (checkPositionInBottomPenaltyBox(pos, pitchWidth, pitchHeight)) {
    return getAttackingIntentWeights(matchDetails, player, team, opposition);
  }

  // 2. Zone-based Delegation
  if (
    common.isBetween(
      currentPOS[1],
      pitchHeight - pitchHeight / 3,
      pitchHeight - pitchHeight / 6 + 5,
    )
  ) {
    return handleAttackingThirdIntent(playerInformation, currentPOS);
  }

  if (
    common.isBetween(
      currentPOS[1],
      pitchHeight / 3,
      pitchHeight - pitchHeight / 3,
    )
  ) {
    return handleMiddleThirdIntent(playerInformation, position, skill);
  }

  // 3. Defensive Third (Fallback)
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
  currentPOS: [number | 'NP', number],
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
  if (player.currentPOS[0] === 'NP') throw new Error('No player position!');
  const curPOS = player.currentPOS as [number, number];

  const playerInformation = setPositions.closestPlayerToPosition(
    player,
    opposition,
    curPOS,
  );
  const ownPlayerInfo = setPositions.closestPlayerToPosition(
    player,
    team,
    curPOS,
  );

  const tmateProximity: [number, number] = [
    Math.abs(ownPlayerInfo.proxPOS[0]),
    Math.abs(ownPlayerInfo.proxPOS[1]),
  ];

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const { currentPOS, skill } = player;

  if (currentPOS[0] === 'NP') throw new Error('No player position!');
  const pos = currentPOS as [number, number];
  const closeOppPOS = playerInformation.thePlayer.currentPOS;

  // Branch 1: Deep inside the penalty box
  if (checkPositionInTopPenaltyBoxClose(pos, pitchWidth, pitchHeight)) {
    return handleDeepBoxThreat(
      playerInformation,
      tmateProximity,
      currentPOS,
      closeOppPOS,
      skill,
    );
  }

  // Branch 2: Edge of the box / Long range
  if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
    return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
  }

  // Branch 3: Position based logic outside the danger zone
  if (checkOppositionAhead(closeOppPOS, currentPOS)) {
    return [20, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0];
  }

  return [50, 0, 20, 20, 0, 0, 0, 10, 0, 0, 0];
}
function handleDeepBoxThreat(
  oppInfo: any,
  tmateProx: [number, number],
  currentPOS: any,
  closeOppPOS: any,
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
    if (common.isBetween(currentPOS[1], 0, skill.shooting / 2))
      return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
    if (common.isBetween(currentPOS[1], 0, skill.shooting))
      return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
    return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
  }

  // Default Box Logic (No pressure, no immediate teammate)
  if (common.isBetween(currentPOS[1], 0, skill.shooting / 2))
    return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  if (common.isBetween(currentPOS[1], 0, skill.shooting))
    return [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0];
  return [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0];
}

function handlePressuredBoxDecision(
  tmateProx: [number, number],
  currentPOS: any,
  closeOppPOS: any,
  skill: Skill,
): MatchEventWeights {
  if (checkOppositionAhead(closeOppPOS, currentPOS)) {
    if (checkTeamMateSpaceClose(tmateProx, -10, 10, -10, 10))
      return [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0];
    if (common.isBetween(currentPOS[1], 0, skill.shooting / 2))
      return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (common.isBetween(currentPOS[1], 0, skill.shooting))
      return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
    return [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0];
  }

  if (checkTeamMateSpaceClose(tmateProx, -10, 10, -4, 10)) {
    if (common.isBetween(currentPOS[1], 0, skill.shooting / 2))
      return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
    if (common.isBetween(currentPOS[1], 0, skill.shooting))
      return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
    return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
  }

  // Fallback pressured logic
  if (common.isBetween(currentPOS[1], 0, skill.shooting / 2))
    return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
  if (common.isBetween(currentPOS[1], 0, skill.shooting))
    return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
  return [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0];
}

// src/lib/intentLogic.ts

function handleBottomGKIntent(playerInformation: any): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 25)) {
    return [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40];
  }
  return [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20];
}

function handleBottomAttackingThirdIntent(
  playerInformation: any,
): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 10)) {
    return [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0];
  }
  return [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0];
}

function handleBottomDefensiveThirdIntent(
  playerInformation: any,
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

export {
  getAttackingIntentWeights,
  getPlayerActionWeights,
  getAttackingThreatWeights,
  handleBottomGKIntent,
  handleBottomAttackingThirdIntent,
  handleBottomDefensiveThirdIntent,
};
