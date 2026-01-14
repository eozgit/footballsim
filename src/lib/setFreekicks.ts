import * as common from './common.js';
import {
  repositionTeamsForSetPiece,
  setPenaltyPositions,
} from './setPieces.js';
import { repositionForDeepSetPiece } from './setPositions.js';
import type { Ball, MatchDetails, Player, Team } from './types.js';

/**
 * Unified logic for deep-third freekicks (e.g., Goal Kicks)
 * Handles both Top and Bottom starts via the 'side' parameter.
 */
function setOneHundredYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
  side: 'top' | 'bottom',
): MatchDetails {
  const isTop = side === 'top';
  const [, pitchHeight] = matchDetails.pitchSize;

  // Set ball possession to the goalkeeper (players[0])
  attack.players[0].hasBall = true;
  const { ball } = matchDetails;

  ball.lastTouch.playerName = attack.players[0].name;
  ball.Player = attack.players[0].playerID;
  ball.withTeam = attack.teamID;

  // Direction is South for top-side kicks (moving +Y), North for bottom-side (moving -Y)
  ball.direction = isTop ? 'south' : 'north';

  // Position attacking players
  for (const player of attack.players) {
    if (player.position === 'GK') {
      // Explicit tuple assignment for [number, number]
      player.currentPOS = [ball.position[0], ball.position[1]];
    } else {
      player.currentPOS = [player.originPOS[0], player.originPOS[1]];
    }
  }

  // Position defensive players with a 100-unit buffer from their origin
  for (const player of defence.players) {
    if (player.position === 'GK') {
      player.currentPOS = [player.originPOS[0], player.originPOS[1]];
    } else {
      const newY = isTop
        ? common.upToMin(player.originPOS[1] - 100, 0) // Push toward Top goal
        : common.upToMax(player.originPOS[1] + 100, pitchHeight); // Push toward Bottom goal

      player.currentPOS = [player.originPOS[0], newY];
    }
  }

  matchDetails.endIteration = true;

  return matchDetails;
}

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
  kickPlayer.currentPOS = [ball.position[0], ball.position[1]];

  // 2. Position Attacking Team
  attack.players.forEach((player) => {
    if (player.position === 'GK') {
      const gkY = isTop ? pitchHeight * 0.25 : pitchHeight * 0.75;

      player.currentPOS = [player.originPOS[0], Math.floor(gkY)];
    } else if (player.name !== kickPlayer.name) {
      player.currentPOS[0] = player.originPOS[0];
      player.currentPOS[1] = Math.floor(
        calculateAttackerY(player, ball, pitchHeight, isTop),
      );
    }
  });

  // 3. Position Defending Team
  defence.players.forEach((player) => {
    if (['GK', 'CB', 'LB', 'RB'].includes(player.position)) {
      player.currentPOS = [...player.originPOS];
    } else {
      const wallY = isTop ? pitchHeight * 0.75 : pitchHeight * 0.25;
      const targetY = ['CM', 'LM', 'RM'].includes(player.position)
        ? wallY
        : pitchHeight * 0.5;

      player.currentPOS[0] = player.originPOS[0];
      player.currentPOS[1] = Math.floor(targetY);
    }
  });

  matchDetails.endIteration = true;

  return { matchDetails, kickPlayer };
}

/** * Logic to determine ball direction based on lateral pitch position
 */
function getBallDirection(
  ballX: number,
  pitchWidth: number,
  isTop: boolean,
): string {
  const ballInCentre = common.isBetween(
    ballX,
    pitchWidth / 4 + 5,
    pitchWidth - pitchWidth / 4 - 5,
  );
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
  const limitFactor = isMidfielder ? (isTop ? 0.75 : 0.25) : isTop ? 0.9 : 0.1;

  const push = common.getRandomNumber(pushRange[0], pushRange[1]);
  const signedPush = isTop ? push : -push;

  return isTop
    ? common.upToMax(ball.position[1] + signedPush, pitchHeight * limitFactor)
    : common.upToMin(ball.position[1] + signedPush, pitchHeight * limitFactor);
}

function setDeepFreekickBallAndKicker(
  ball: Ball,
  kickPlayer: Player,
  teamID: number,
  pitchWidth: number,
  isTop: boolean,
) {
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

  ball.direction = isTop
    ? ballInCentre
      ? 'south'
      : ballLeft
        ? 'southeast'
        : 'southwest'
    : ballLeft
      ? 'east'
      : 'west';
  const [ballX, ballY] = ball.position;

  kickPlayer.currentPOS = [ballX, ballY];
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

function alignPlayersForPenalty(
  isTop: boolean,
  attack: Team,
  pitchHeight: number,
  kickPlayer: Player,
  matchDetails: MatchDetails,
  defence: Team,
  ball: Ball,
  pitchWidth: number,
) {
  return setPenaltyPositions(
    isTop,
    attack,
    pitchHeight,
    kickPlayer,
    matchDetails,
    defence,
    ball,
    pitchWidth,
  );
}

function setSetPiecePositions(
  attack: Team,
  pitchHeight: number,
  kickPlayer: Player,
  matchDetails: MatchDetails,
  ball: Ball,
  defence: Team,
  pitchWidth: number,
  isTop: boolean,
) {
  return repositionTeamsForSetPiece(
    attack,
    pitchHeight,
    kickPlayer,
    matchDetails,
    ball,
    defence,
    pitchWidth,
    isTop,
  );
}

export {
  alignPlayersForPenalty,
  initializeKickerAndBall,
  setBallPossession,
  setDeepFreekickBallAndKicker,
  setHalfwayToOppositeQtrYPos,
  setOneHundredToHalfwayYPos,
  setOneHundredYPos,
  setSetPiecePositions,
};
