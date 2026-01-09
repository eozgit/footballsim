import { calcBallMovementOverTime, checkGoalScored } from './ballMovement.js';
import * as common from './common.js';
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
export { executePenaltyShot, setPenaltyPositions };
