import { resolveBallLocation } from './boundaryHandler.js';
import * as common from './common.js';
import { executeDeepSetPieceSetup } from './setPieces.js';
import type { Ball, BallPosition, MatchDetails, Player, Team } from './types.js';

function keepInBoundaries(
  matchDetails: MatchDetails,
  kickteamID: string | number,
  ballIntended: BallPosition,
): MatchDetails {
  return resolveBallLocation(matchDetails, kickteamID, ballIntended);
}

function setPlayerPositions(matchDetails: MatchDetails, team: Team, extra: number): void {
  for (const thisPlayer of team.players) {
    if (thisPlayer.position === `GK`) {
      common.setPlayerPos(thisPlayer, [...thisPlayer.originPOS]);
    } else {
      common.setPlayerXY(thisPlayer, thisPlayer.originPOS[0], thisPlayer.currentPOS[1]);
      common.setPlayerXY(thisPlayer, thisPlayer.currentPOS[0], thisPlayer.originPOS[1]);
      const playerPos = thisPlayer.currentPOS[1] + extra;

      if (common.isBetween(playerPos, -1, matchDetails.pitchSize[1] + 1)) {
        common.setPlayerXY(thisPlayer, thisPlayer.currentPOS[0], playerPos);
      }

      thisPlayer.intentPOS = [thisPlayer.originPOS[0], playerPos];
    }
  }
}

function setIntentPosition(matchDetails: MatchDetails, closestPlayer: Player): void {
  const { ball, kickOffTeam, secondTeam } = matchDetails;

  const kickOffTeamCheck = kickOffTeam.players.find(
    (thisPlayer: Player) => thisPlayer.playerID === ball.Player,
  );

  const secondTeamCheck = secondTeam.players.find(
    (thisPlayer: Player) => thisPlayer.playerID === ball.Player,
  );

  // 1. Extract nested ternary into a clear variable assignment
  let kickTeam: Team | undefined;

  if (kickOffTeamCheck) {
    kickTeam = kickOffTeam;
  } else if (secondTeamCheck) {
    kickTeam = secondTeam;
  } else {
    kickTeam = undefined; // satisfy unicorn/no-null
  }

  // 2. Refactor defendingTeam to avoid nested logic and null checks
  let defendingTeam: Team | undefined;

  if (!kickTeam) {
    defendingTeam = undefined;
  } else {
    // Use a simple if/else for the team ID swap logic
    defendingTeam = kickTeam.teamID === kickOffTeam.teamID ? secondTeam : kickOffTeam;
  }

  if (defendingTeam) {
    setDefenceRelativePos(matchDetails, defendingTeam, closestPlayer);
  }

  if (kickTeam) {
    setAttackRelativePos(matchDetails, kickTeam);
  }

  if (!kickTeam && !defendingTeam) {
    setLooseintentPOS(matchDetails, kickOffTeam, closestPlayer);
    setLooseintentPOS(matchDetails, secondTeam, closestPlayer);
  }
}

function setLooseintentPOS(
  matchDetails: MatchDetails,
  thisTeam: Team,
  closestPlayer: Player,
): void {
  const [, pitchHeight] = matchDetails.pitchSize;

  const { ball } = matchDetails;

  const side = thisTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

  for (const player of thisTeam.players) {
    if (player.currentPOS[0] === 'NP') {
      throw new Error('No player position!');
    }

    // Logic 1: Immediate ball proximity or ball carrier status
    if (shouldMoveDirectlyToBall(player, closestPlayer, ball)) {
      player.intentPOS = [ball.position[0], ball.position[1]];
      continue;
    }

    // Logic 2: Tactical positioning based on ball movement
    const newYPOS = calculateTacticalYPOS(player, ball, side, pitchHeight);

    player.intentPOS = [player.originPOS[0], newYPOS];
  }
}

function shouldMoveDirectlyToBall(player: Player, closest: Player, ball: Ball): boolean {
  if (player.playerID === closest.playerID) {
    return true;
  }

  const diffX = ball.position[0] - (player.currentPOS[0] as number);

  const diffY = ball.position[1] - player.currentPOS[1];

  // Checks if player is within a 16x16 unit "action zone" around the ball
  return common.isBetween(diffX, -16, 16) && common.isBetween(diffY, -16, 16);
}

function calculateTacticalYPOS(
  player: Player,
  ball: Ball,
  side: 'top' | 'bottom',
  pitchHeight: number,
): number {
  const diffY = ball.position[1] - player.currentPOS[1];

  const southwards = ['south', 'southwest', 'southeast'].includes(ball.direction);

  const northwards = ['north', 'northwest', 'northeast'].includes(ball.direction);

  // Top Team Logic
  if (side === 'top') {
    if (northwards) {
      return player.originPOS[1];
    }

    if (southwards) {
      return setNewRelativeTopYPOS(pitchHeight, player, 20);
    }
  }

  // Bottom Team Logic
  if (side === 'bottom') {
    if (northwards) {
      return setNewRelativeBottomYPOS(pitchHeight, player, -20);
    }

    if (southwards) {
      return common.isBetween(diffY, -100, 100)
        ? player.originPOS[1]
        : moveTowardsBall(player, pitchHeight, diffY);
    }
  }

  // Neutral / Wait Logic
  if (ball.direction === 'wait') {
    return moveTowardsBall(player, pitchHeight, diffY);
  }

  return player.originPOS[1];
}

function moveTowardsBall(
  player: Player,
  pitchHeight: number,
  diffYPOSplayerandball: number,
): number {
  const side = player.originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

  if (side === 'top' && diffYPOSplayerandball > 0) {
    return setNewRelativeTopYPOS(pitchHeight, player, 20);
  }

  if (side === 'top' && diffYPOSplayerandball < 0) {
    return setNewRelativeTopYPOS(pitchHeight, player, -20);
  }

  if (side === 'bottom' && diffYPOSplayerandball > 0) {
    return setNewRelativeBottomYPOS(pitchHeight, player, 20);
  }

  if (side === 'bottom' && diffYPOSplayerandball < 0) {
    return setNewRelativeBottomYPOS(pitchHeight, player, -20);
  }

  return 0;
}

/**
 * Updates defensive players' intent positions based on ball location and team side.
 * Refactored to separate proximity logic from tactical positioning.
 */
function setDefenceRelativePos(
  matchDetails: MatchDetails,
  defendingTeam: Team,
  closestPlayer: Player,
): void {
  const [, pitchHeight] = matchDetails.pitchSize;

  const { ball } = matchDetails;

  // Determine if team is defending the 'top' or 'bottom' goal
  const teamSide = defendingTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

  for (const player of defendingTeam.players) {
    if (player.currentPOS[0] === 'NP') {
      throw new Error('No player position!');
    }

    // 1. Proximity Check: If close to ball, move to ball
    if (isPlayerNearBall(player, [ball.position[0], ball.position[1]], 40)) {
      player.intentPOS = [ball.position[0], ball.position[1]];
      continue;
    }

    // 2. Closest Player: Always pursues ball
    if (player.playerID === closestPlayer.playerID) {
      player.intentPOS = [ball.position[0], ball.position[1]];
      continue;
    }

    // 3. Tactical Positioning: Return to origin or shift if ball is on opposite side
    const ballOnOppositeSide = isBallOnOppositeHalf(ball.position[1], teamSide, pitchHeight);

    if (ballOnOppositeSide) {
      player.intentPOS = calculateShiftedPosition(player, teamSide, pitchHeight);
    } else {
      player.intentPOS = [...player.originPOS];
    }
  }
}

/**
 * Checks if a player is within a specific distance (delta) of the ball.
 */
function isPlayerNearBall(player: Player, ballPos: [number, number], delta: number): boolean {
  const diffX = ballPos[0] - (player.currentPOS[0] as number);

  const diffY = ballPos[1] - player.currentPOS[1];

  return common.isBetween(diffX, -delta, delta) && common.isBetween(diffY, -delta, delta);
}

/**
 * Determines if the ball has crossed the halfway line relative to the defending team.
 */
function isBallOnOppositeHalf(ballY: number, side: 'top' | 'bottom', pitchHeight: number): boolean {
  const halfway = pitchHeight / 2;

  return (side === 'top' && ballY > halfway) || (side === 'bottom' && ballY < halfway);
}

/**
 * Calculates a tactical shift in Y-position when the ball is deep in the opponent's half.
 */
function calculateShiftedPosition(
  player: Player,
  side: 'top' | 'bottom',
  pitchHeight: number,
): [number, number] {
  let newYPOS: number | undefined;

  if (side === 'top') {
    newYPOS = setNewRelativeTopYPOS(pitchHeight, player, 20);
  } else {
    newYPOS = setNewRelativeBottomYPOS(pitchHeight, player, -20);
  }

  return [player.originPOS[0], newYPOS ?? player.originPOS[1]];
}

function setAttackRelativePos(matchDetails: MatchDetails, kickingTeam: Team): void {
  const [, pitchHeight] = matchDetails.pitchSize;

  const side = kickingTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

  for (const player of kickingTeam.players) {
    let newYPOS;

    if (side === 'top') {
      newYPOS = setNewRelativeTopYPOS(pitchHeight, player, 20);
    }

    if (side === 'bottom') {
      newYPOS = setNewRelativeBottomYPOS(pitchHeight, player, -20);
    }

    player.intentPOS = [player.originPOS[0], newYPOS ?? player.originPOS[1]];
  }
}

function setNewRelativeTopYPOS(pitchHeight: number, player: Player, diff: number): number {
  const { position } = player;

  if (position === 'GK') {
    return common.upToMax(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.15));
  }

  if (position === 'CB') {
    return common.upToMax(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.25));
  }

  if (['LB', 'RB'].includes(position)) {
    return common.upToMax(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.66));
  }

  if (position === 'CM') {
    return common.upToMax(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.75));
  }

  return common.upToMax(player.currentPOS[1] + diff, pitchHeight);
}

function setNewRelativeBottomYPOS(pitchHeight: number, player: Player, diff: number): number {
  const { position } = player;

  if (position === 'GK') {
    return common.upToMin(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.85));
  }

  if (position === 'CB') {
    return common.upToMin(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.75));
  }

  if (['LB', 'RB'].includes(position)) {
    return common.upToMin(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.33));
  }

  if (position === 'CM') {
    return common.upToMin(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.25));
  }

  return common.upToMin(player.currentPOS[1] + diff, 0);
}

/**
 * Calculates the X and Y target coordinates for a penalty shot
 */

/**
 * Orchestrates team positioning for goal kicks and deep free kicks.
 * Adjusts team shape based on whether a GK or Defender is taking the kick.
 */
function repositionForDeepSetPiece(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
  side: 'top' | 'bottom',
): MatchDetails {
  return executeDeepSetPieceSetup(matchDetails, attack, defence, side);
}

export { keepInBoundaries, repositionForDeepSetPiece, setIntentPosition, setPlayerPositions };

export { calculatePenaltyTarget } from './actions/penalty.js';

export { setGoalieHasBall } from './actions/possession.js';

export { switchSide } from './position/halftime.js';
