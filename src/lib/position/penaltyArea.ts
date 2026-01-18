import * as common from '../common.js';
import type { ActionContext, Ball, BallPosition, MatchDetails, Player, Team } from '../types.js';

export function checkPositionInBottomPenaltyBox(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
): boolean {
  const yPos = common.isBetween(position[0], pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 5);

  const xPos = common.isBetween(position[1], pitchHeight - pitchHeight / 6 + 5, pitchHeight);

  return yPos && xPos;
}

export function checkPositionInBottomPenaltyBoxClose(penaltyBoxConfig: {
  position: [number, number];
  pitchWidth: number;
  pitchHeight: number;
}): boolean {
  const { position, pitchWidth, pitchHeight } = penaltyBoxConfig;

  const yPos = common.isBetween(position[0], pitchWidth / 3 - 5, pitchWidth - pitchWidth / 3 + 5);

  const xPos = common.isBetween(position[1], pitchHeight - pitchHeight / 12 + 5, pitchHeight);

  return yPos && xPos;
}

export function checkPositionInTopPenaltyBox(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
): boolean {
  const xPos = common.isBetween(position[0], pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 5);

  const yPos = common.isBetween(position[1], 0, pitchHeight / 6 - 5);

  return yPos && xPos;
}

export function checkPositionInTopPenaltyBoxClose(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
): boolean {
  const xPos = common.isBetween(position[0], pitchWidth / 3 - 5, pitchWidth - pitchWidth / 3 + 5);

  const yPos = common.isBetween(position[1], 0, pitchHeight / 12 - 5);

  return yPos && xPos;
}

/**
 * Sets player positions for both teams during a penalty set-piece.
 */
export function setPenaltyPositions(
  penaltyConfig: ActionContext & {
    isTop: boolean;
    pitchHeight: number;
    ball: Ball;
    pitchWidth: number;
  },
): MatchDetails {
  const {
    isTop,
    team: attack,
    pitchHeight,
    player: kickPlayer,
    matchDetails,
    opp: defence,
    ball,
    pitchWidth,
  } = penaltyConfig;

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
}): void {
  const factorGK = isTop ? 0.25 : 0.75;

  const factorWB = isTop ? 0.66 : 0.33;

  for (const player of attack.players) {
    const { position, name, originPOS } = player;

    if (position === 'GK') {
      common.setPlayerXY(player, originPOS[0], Math.floor(pitchHeight * factorGK));
    } else if (position === 'CB') {
      common.setPlayerXY(player, originPOS[0], Math.floor(pitchHeight * 0.5));
    } else if (position === 'LB' || position === 'RB') {
      common.setPlayerXY(player, originPOS[0], Math.floor(pitchHeight * factorWB));
    } else if (name !== kickPlayer.name) {
      common.setPlayerPos(player, getRandomPenaltyPosition(matchDetails));
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
}): void {
  let playerSpace = -3;

  const midWayX = Math.floor((ball.position[0] - (ball.position[0] - pitchWidth / 2)) / 2);

  for (const player of defence.players) {
    let midWayY: number;

    if (isTop) {
      const ballDistanceFromGoalY = pitchHeight - ball.position[1];

      midWayY = Math.floor((ball.position[1] - ballDistanceFromGoalY) / 2);
    } else {
      midWayY = Math.floor(ball.position[1] / 2);
    }

    playerSpace = setDefenderSetPiecePosition({
      player: player,
      midWayFromBalltoGoalX: midWayX,
      playerSpace: playerSpace,
      midWayFromBalltoGoalY: midWayY,
      matchDetails: matchDetails,
      getRandomPenaltyPosition: getRandomPenaltyPosition,
    });
  }
}

function setDefenderSetPiecePosition(defenderPositionConfig: {
  player: Player;
  matchDetails: MatchDetails;
  midWayFromBalltoGoalX: number;
  playerSpace: number;
  midWayFromBalltoGoalY: number;
  getRandomPenaltyPosition: (state: MatchDetails) => [number, number];
}): number {
  let { playerSpace } = defenderPositionConfig;

  const {
    player,
    midWayFromBalltoGoalX,
    midWayFromBalltoGoalY,
    matchDetails,
    getRandomPenaltyPosition,
  } = defenderPositionConfig;

  if (player.position === 'GK') {
    const [origX, origY] = player.originPOS;

    common.setPlayerXY(player, origX, origY);
  } else if (['CB', 'LB', 'RB'].includes(player.position)) {
    common.setPlayerXY(player, midWayFromBalltoGoalX + playerSpace, midWayFromBalltoGoalY);
    playerSpace += 2;
  } else {
    common.setPlayerPos(player, getRandomPenaltyPosition(matchDetails));
  }

  return playerSpace;
}
