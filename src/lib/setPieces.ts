import { calcBallMovementOverTime, checkGoalScored } from './ballMovement.js';
import * as common from './common.js';
import { setBallPossession } from './setFreekicks.js';
import { calculatePenaltyTarget } from './setPositions.js';
import { recordShotStats } from './stats.js';
import type { Ball, MatchDetails, Player, Team } from './types.js';

function executePenaltyShot(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
) {
  // 1. Initialize State
  player.action = `none`;
  matchDetails.iterationLog.push(`Penalty Taken by: ${player.name}`);

  Object.assign(matchDetails.ball.lastTouch, {
    playerName: player.name,
    playerID: player.playerID,
    teamID: team.teamID,
  });

  // 2. Determine Outcome and Record Stats
  const isOnTarget =
    player.skill.penalty_taking > common.getRandomNumber(0, 100);
  recordShotStats(matchDetails, team, player, isOnTarget);

  // 3. Calculate Target Position
  const shotPosition = calculatePenaltyTarget(
    matchDetails.pitchSize,
    player,
    isOnTarget,
  );
  matchDetails.iterationLog.push(
    `Shot ${isOnTarget ? 'On' : 'Off'} Target at X: ${shotPosition[0]}`,
  );

  // 4. Execution & Physics
  const endPos = calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    shotPosition,
    player,
  );

  checkGoalScored(matchDetails);
  return endPos;
}

/**
 * Sets player positions for both teams during a penalty set-piece.
 */
function setPenaltyPositions(
  isTop: boolean,
  attack: Team,
  pitchHeight: number,
  kickPlayer: Player,
  matchDetails: MatchDetails,
  defence: Team,
  ball: Ball,
  pitchWidth: number,
): MatchDetails {
  const getRandomPenaltyPosition = isTop
    ? common.getRandomBottomPenaltyPosition
    : common.getRandomTopPenaltyPosition;

  // 1. Position Attacking Team
  positionAttackingTeam({
    isTop,
    attack,
    pitchHeight,
    kickPlayer,
    matchDetails,
    getRandomPenaltyPosition,
  });

  // 2. Position Defending Team
  positionDefendingTeam({
    isTop,
    defence,
    ball,
    pitchHeight,
    pitchWidth,
    matchDetails,
    getRandomPenaltyPosition,
  });

  matchDetails.endIteration = true;
  return matchDetails;
}

/**
 * Internal helper to handle attacking team positioning logic.
 */
function positionAttackingTeam({
  isTop,
  attack,
  pitchHeight,
  kickPlayer,
  matchDetails,
  getRandomPenaltyPosition,
}: {
  isTop: boolean;
  attack: Team;
  pitchHeight: number;
  kickPlayer: Player;
  matchDetails: MatchDetails;
  getRandomPenaltyPosition: (matchDetails: MatchDetails) => [number, number];
}) {
  const factorGK = isTop ? 0.25 : 0.75;
  const factorWB = isTop ? 0.66 : 0.33;

  for (const player of attack.players) {
    const { position, name, originPOS } = player;

    if (position === 'GK') {
      player.currentPOS = [originPOS[0], Math.floor(pitchHeight * factorGK)];
    } else if (position === 'CB') {
      player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.5)];
    } else if (position === 'LB' || position === 'RB') {
      player.currentPOS = [originPOS[0], Math.floor(pitchHeight * factorWB)];
    } else if (name !== kickPlayer.name) {
      player.currentPOS = getRandomPenaltyPosition(matchDetails);
    }
  }
}

/**
 * Internal helper to handle defending team positioning logic.
 */
function positionDefendingTeam({
  isTop,
  defence,
  ball,
  pitchHeight,
  pitchWidth,
  matchDetails,
  getRandomPenaltyPosition,
}: {
  isTop: boolean;
  defence: Team;
  ball: Ball;
  pitchHeight: number;
  pitchWidth: number;
  matchDetails: MatchDetails;
  getRandomPenaltyPosition: (matchDetails: MatchDetails) => [number, number];
}) {
  let playerSpace = -3;

  const midWayX = Math.floor(
    (ball.position[0] - (ball.position[0] - pitchWidth / 2)) / 2,
  );

  for (const player of defence.players) {
    let midWayY: number;

    if (isTop) {
      const ballDistanceFromGoalY = pitchHeight - ball.position[1];
      midWayY = Math.floor((ball.position[1] - ballDistanceFromGoalY) / 2);
    } else {
      midWayY = Math.floor(ball.position[1] / 2);
    }

    playerSpace = setDefenderSetPiecePosition(
      player,
      midWayX,
      playerSpace,
      midWayY,
      matchDetails,
      getRandomPenaltyPosition,
    );
  }
}
function setDefenderSetPiecePosition(
  player: Player,
  midWayFromBalltoGoalX: number,
  playerSpace: number,
  midWayFromBalltoGoalY: number,
  matchDetails: MatchDetails,
  getRandomPenaltyPosition: (matchDetails: MatchDetails) => [number, number],
) {
  if (player.position === 'GK') {
    const [origX, origY] = player.originPOS;
    player.currentPOS = [origX, origY];
  } else if (['CB', 'LB', 'RB'].includes(player.position)) {
    player.currentPOS = [
      midWayFromBalltoGoalX + playerSpace,
      midWayFromBalltoGoalY,
    ];
    playerSpace += 2;
  } else {
    player.currentPOS = getRandomPenaltyPosition(matchDetails);
  }
  return playerSpace;
}
/**
 * Calculates the Y-coordinate for an attacking player during a deep set piece.
 */
export function calculateAttackingSetPieceY(
  player: Player,
  ballY: number,
  isTop: boolean,
  pitchHeight: number,
  isGKExecuting: boolean,
): number {
  const offset = isTop ? 300 : -300;
  const baseNewY = isGKExecuting
    ? player.originPOS[1] + offset
    : player.originPOS[1] + (ballY - player.originPOS[1]) + offset;

  const limit = getAttackingLimit(player.position, isTop, pitchHeight);

  return isTop
    ? common.upToMax(baseNewY, limit)
    : common.upToMin(baseNewY, limit);
}

/**
 * Calculates the Y-coordinate for a defensive player during a deep set piece.
 */
export function calculateDefensiveSetPieceY(
  player: Player,
  isTop: boolean,
  pitchHeight: number,
  isGKExecuting: boolean,
): number {
  if (isGKExecuting) {
    if (player.position === 'GK') {
      return player.originPOS[1];
    }

    return isTop
      ? common.upToMin(player.originPOS[1] - 100, 0)
      : common.upToMax(player.originPOS[1] + 100, pitchHeight);
  }

  if (['GK', 'CB', 'LB', 'RB'].includes(player.position)) {
    return player.originPOS[1];
  }

  return getDefensiveTargetY(player.position, isTop, pitchHeight);
}
function executeDeepSetPieceSetup(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
  side: 'top' | 'bottom',
): MatchDetails {
  const isTop = side === 'top';
  const { ball } = matchDetails;
  const [, pitchHeight] = matchDetails.pitchSize;

  // 1. Identify Kicker
  // Goalies take kicks if ball is deep in their own quarter
  const goalieAreaLimit = isTop
    ? pitchHeight * 0.25 + 1
    : pitchHeight * 0.75 - 1;
  const goalieToKick = isTop
    ? ball.position[1] <= goalieAreaLimit
    : ball.position[1] >= goalieAreaLimit;

  const kickPlayer = goalieToKick ? attack.players[0] : attack.players[3];
  const isGKExecuting = kickPlayer.position === 'GK';

  // 2. Set Possession & Ball State
  setBallPossession(kickPlayer, ball, attack);
  ball.direction = isTop ? 'south' : 'north';

  // 3. Position Attacking Team
  for (const player of attack.players) {
    if (player.name === kickPlayer.name) {
      player.currentPOS = [ball.position[0], ball.position[1]];
    } else {
      const finalY = calculateAttackingSetPieceY(
        player,
        ball.position[1],
        isTop,
        pitchHeight,
        isGKExecuting,
      );
      player.currentPOS[0] = player.originPOS[0];
      player.currentPOS[1] = Math.floor(finalY);
    }
  }

  // 4. Position Defensive Team
  for (const player of defence.players) {
    const targetY = calculateDefensiveSetPieceY(
      player,
      isTop,
      pitchHeight,
      isGKExecuting,
    );
    player.currentPOS[0] = player.originPOS[0];
    player.currentPOS[1] = Math.floor(targetY);
  }

  matchDetails.endIteration = true;
  return matchDetails;
}

/**
 * Helper: Defines the furthest forward a player can move during a set piece
 */
function getAttackingLimit(
  pos: string,
  isTop: boolean,
  pitchHeight: number,
): number {
  if (pos === 'GK') {
    return isTop ? pitchHeight * 0.25 : pitchHeight * 0.75;
  }
  if (['CB', 'LB', 'RB'].includes(pos)) {
    return pitchHeight * 0.5;
  }
  if (['CM', 'LM', 'RM'].includes(pos)) {
    return isTop ? pitchHeight * 0.75 : pitchHeight * 0.25;
  }
  return isTop ? pitchHeight * 0.9 : pitchHeight * 0.1;
}

/**
 * Helper: Defines target lines for the defending team
 */
function getDefensiveTargetY(
  pos: string,
  isTop: boolean,
  pitchHeight: number,
): number {
  const isMid = ['CM', 'LM', 'RM'].includes(pos);
  if (isMid) {
    return isTop ? pitchHeight * 0.75 + 5 : pitchHeight * 0.25 - 5;
  }
  return pitchHeight * 0.5;
}
/**
 * Calculates the target X for the defensive wall.
 */
function calculateDefensiveWallX(ballX: number, pitchWidth: number): number {
  const ballDistanceFromGoalX = ballX - pitchWidth / 2;
  return Math.floor((ballX - ballDistanceFromGoalX) / 2);
}

/**
 * Determines the Y coordinate for attackers based on their role.
 */
function getAttackerSetPieceY(
  position: string,
  pitchHeight: number,
  isTop: boolean,
): number | null {
  if (position === 'GK') {
    return Math.floor(pitchHeight * (isTop ? 0.25 : 0.75));
  }
  if (position === 'CB') {
    return Math.floor(pitchHeight * 0.5);
  }
  if (position === 'LB' || position === 'RB') {
    return Math.floor(pitchHeight * (isTop ? 0.66 : 0.33));
  }
  return null;
}
function repositionTeamsForSetPiece(
  attack: Team,
  pitchHeight: number,
  kickPlayer: Player,
  matchDetails: MatchDetails,
  ball: Ball,
  defence: Team,
  pitchWidth: number,
  isTop: boolean,
): MatchDetails {
  const getRandomPenaltyPosition = isTop
    ? common.getRandomBottomPenaltyPosition
    : common.getRandomTopPenaltyPosition;

  const isBackLine = (pos: string) => ['CB', 'LB', 'RB'].includes(pos);

  // 1. POSITION ATTACK
  for (const player of attack.players) {
    const { playerID, position, originPOS } = player;
    const targetY = getAttackerSetPieceY(position, pitchHeight, isTop);

    if (targetY !== null) {
      player.currentPOS = [originPOS[0], targetY];
    } else if (playerID !== kickPlayer.playerID) {
      player.currentPOS = getRandomPenaltyPosition(matchDetails);
    }
  }

  // 2. POSITION DEFENCE
  let playerSpace = isTop
    ? common.upToMax(ball.position[1] + 3, pitchHeight)
    : common.upToMin(ball.position[1] - 3, 0);

  const wallX = calculateDefensiveWallX(ball.position[0], pitchWidth);

  for (const player of defence.players) {
    const { position, originPOS } = player;

    if (position === 'GK') {
      // Must use spread to match original's new array reference
      player.currentPOS = [...originPOS];
    } else if (isBackLine(position)) {
      player.currentPOS = [wallX, playerSpace];
      playerSpace = isTop ? playerSpace - 2 : playerSpace + 2;
    } else {
      player.currentPOS = getRandomPenaltyPosition(matchDetails);
    }
  }

  matchDetails.endIteration = true;
  return matchDetails;
}
export {
  executePenaltyShot,
  setPenaltyPositions,
  executeDeepSetPieceSetup,
  repositionTeamsForSetPiece,
};
