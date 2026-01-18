import * as common from './common.js';
import { repositionTeamsForSetPiece, setPenaltyPositions } from './setPieces.js';
import { repositionForDeepSetPiece } from './setPositions.js';
import type { Ball, MatchDetails, Player, Team } from './types.js';

/**
 * Unified logic for deep-third freekicks (e.g., Goal Kicks)
 * Handles both Top and Bottom starts via the 'side' parameter.
 */

/**
 * Unified logic for freekicks between the 100-mark and the halfway line.
 */
function setOneHundredToHalfwayYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
  side: 'top' | 'bottom',
): MatchDetails {
  return repositionForDeepSetPiece(matchDetails, attack, defence, side);
}

/**
 * Unified logic for freekicks from the halfway line to the opposite quarter.
 * Positions players for a midfield free kick, pushing attackers forward
 * and maintaining defensive lines based on the pitch side.
 */
function setHalfwayToOppositeQtrYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
  side: 'top' | 'bottom',
): { matchDetails: MatchDetails; kickPlayer: Player } {
  const isTop = side === 'top';

  const { ball, pitchWidth, pitchHeight, kickPlayer } = initializeKickerAndBall(
    matchDetails,
    attack,
  );

  // 1. Set Ball Direction based on position relative to centre
  ball.direction = getBallDirection(ball.position[0], pitchWidth, isTop);
  common.setPlayerXY(kickPlayer, ball.position[0], ball.position[1]);

  // 2. Position Attacking Team
  attack.players.forEach((player) => {
    if (player.position === 'GK') {
      const gkY = isTop ? pitchHeight * 0.25 : pitchHeight * 0.75;

      common.setPlayerXY(player, player.originPOS[0], Math.floor(gkY));
    } else if (player.name !== kickPlayer.name) {
      common.setPlayerXY(player, player.originPOS[0], player.currentPOS[1]);
      common.setPlayerXY(
        player,
        player.currentPOS[0],
        Math.floor(calculateAttackerY(player, ball, pitchHeight, isTop)),
      );
    }
  });

  // 3. Position Defending Team
  defence.players.forEach((player) => {
    if (['GK', 'CB', 'LB', 'RB'].includes(player.position)) {
      common.setPlayerPos(player, [...player.originPOS]);
    } else {
      const wallY = isTop ? pitchHeight * 0.75 : pitchHeight * 0.25;

      const targetY = ['CM', 'LM', 'RM'].includes(player.position) ? wallY : pitchHeight * 0.5;

      common.setPlayerXY(player, player.originPOS[0], player.currentPOS[1]);
      common.setPlayerXY(player, player.currentPOS[0], Math.floor(targetY));
    }
  });

  matchDetails.endIteration = true;

  return { matchDetails, kickPlayer };
}

/** * Logic to determine ball direction based on lateral pitch position
 */
function getBallDirection(ballX: number, pitchWidth: number, isTop: boolean): string {
  const ballInCentre = common.isBetween(ballX, pitchWidth / 4 + 5, pitchWidth - pitchWidth / 4 - 5);

  const ballLeft = common.isBetween(ballX, 0, pitchWidth / 4 + 4);

  if (isTop) {
    if (ballInCentre) {
      return 'south';
    }

    return ballLeft ? 'southeast' : 'southwest';
  }

  if (ballInCentre) {
    return 'north';
  }

  return ballLeft ? 'northeast' : 'northwest';
}

/** * Logic for offensive player Y-positioning based on role and ball position
 */
function calculateAttackerY(
  player: Player,
  ball: Ball,
  pitchHeight: number,
  isTop: boolean,
): number {
  if (['CB', 'LB', 'RB'].includes(player.position)) {
    return isTop
      ? common.upToMax(ball.position[1] - 100, pitchHeight * 0.5)
      : common.upToMin(ball.position[1] + 100, pitchHeight * 0.5);
  }

  const isMidfielder = ['CM', 'LM', 'RM'].includes(player.position);

  const pushRange = isMidfielder ? [150, 300] : [300, 400];

  // Refactored to satisfy sonarjs/no-nested-conditional
  let limitFactor: number;

  if (isMidfielder) {
    limitFactor = isTop ? 0.75 : 0.25;
  } else {
    limitFactor = isTop ? 0.9 : 0.1;
  }

  const push = common.getRandomNumber(pushRange[0], pushRange[1]);

  const signedPush = isTop ? push : -push;

  return isTop
    ? common.upToMax(ball.position[1] + signedPush, pitchHeight * limitFactor)
    : common.upToMin(ball.position[1] + signedPush, pitchHeight * limitFactor);
}

function setDeepFreekickBallAndKicker(freekickConfig: {
  ball: Ball;
  kickPlayer: Player;
  teamID: string;
  pitchWidth: number;
  isTop: boolean;
}): void {
  const { ball, kickPlayer, teamID, pitchWidth, isTop } = freekickConfig;

  kickPlayer.hasBall = true;
  ball.lastTouch.playerName = kickPlayer.name;
  ball.Player = kickPlayer.playerID;
  ball.withTeam = teamID;
  const ballInCentre = common.isBetween(
    ball.position[0],
    pitchWidth / 4 + 5,
    pitchWidth - pitchWidth / 4 - 5,
  );

  const ballLeft = common.isBetween(ball.position[0], 0, pitchWidth / 4 + 4);

  // Refactored to satisfy sonarjs/no-nested-conditional
  if (isTop) {
    if (ballInCentre) {
      ball.direction = 'south';
    } else {
      ball.direction = ballLeft ? 'southeast' : 'southwest';
    }
  } else {
    ball.direction = ballLeft ? 'east' : 'west';
  }

  const [ballX, ballY] = ball.position;

  common.setPlayerXY(kickPlayer, ballX, ballY);
}

function initializeKickerAndBall(
  matchDetails: MatchDetails,
  attack: Team,
): { ball: Ball; pitchWidth: number; pitchHeight: number; kickPlayer: Player } {
  const { ball, pitchSize } = matchDetails;

  const [pitchWidth, pitchHeight] = pitchSize;

  const kickPlayer = attack.players[5];

  setBallPossession(kickPlayer, ball, attack);

  return { ball, pitchWidth, pitchHeight, kickPlayer };
}

function setBallPossession(kickPlayer: Player, ball: Ball, attack: Team): void {
  kickPlayer.hasBall = true;
  ball.lastTouch.playerName = kickPlayer.name;
  ball.Player = kickPlayer.playerID;
  ball.withTeam = attack.teamID;
}

function alignPlayersForPenalty(penaltyAlignConfig: {
  isTop: boolean;
  attack: Team;
  pitchHeight: number;
  kickPlayer: Player;
  matchDetails: MatchDetails;
  defence: Team;
  ball: Ball;
  pitchWidth: number;
}): MatchDetails {
  const { isTop, attack, pitchHeight, kickPlayer, matchDetails, defence, ball, pitchWidth } =
    penaltyAlignConfig;

  return setPenaltyPositions({
    isTop: isTop,
    team: attack,
    pitchHeight: pitchHeight,
    player: kickPlayer,
    matchDetails: matchDetails,
    opp: defence,
    ball: ball,
    pitchWidth: pitchWidth,
  });
}

function setSetPiecePositions(setPieceConfig: {
  attack: Team;
  pitchHeight: number;
  kickPlayer: Player;
  matchDetails: MatchDetails;
  ball: Ball;
  defence: Team;
  pitchWidth: number;
  isTop: boolean;
}): MatchDetails {
  const { attack, pitchHeight, kickPlayer, matchDetails, ball, defence, pitchWidth, isTop } =
    setPieceConfig;

  return repositionTeamsForSetPiece({
    team: attack,
    pitchHeight: pitchHeight,
    player: kickPlayer,
    matchDetails: matchDetails,
    ball: ball,
    opp: defence,
    pitchWidth: pitchWidth,
    isTop: isTop,
  });
}

export {
  alignPlayersForPenalty,
  initializeKickerAndBall,
  setBallPossession,
  setDeepFreekickBallAndKicker,
  setHalfwayToOppositeQtrYPos,
  setOneHundredToHalfwayYPos,
  setSetPiecePositions,
};

export { setOneHundredYPos } from './position/freekick.js';
