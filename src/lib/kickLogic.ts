import type { TestPlayer } from './ballMovement.js';
import {
  getTopKickedPosition,
  getBottomKickedPosition,
  calcBallMovementOverTime,
  getPlayersInDistance,
} from './ballMovement.js';
import * as common from './common.js';
import type { MatchDetails, Team, Player } from './types.js';

/**
 * Provides a random cardinal direction based on which half the player is attacking.
 */
function getRandomKickDirection(side: 'top' | 'bottom'): string {
  const horizontal = ['east', 'east', 'west', 'west'];

  const baseTop = ['wait', 'north', 'north', 'north', 'north', ...horizontal];

  const diagTop = ['northeast', 'northeast', 'northeast', 'northwest', 'northwest', 'northwest'];

  const baseBottom = ['wait', 'south', 'south', 'south', 'south', ...horizontal];

  const diagBottom = ['southeast', 'southeast', 'southeast', 'southwest', 'southwest', 'southwest'];

  const pool = side === 'top' ? baseTop.concat(diagTop) : baseBottom.concat(diagBottom);

  return pool[common.getRandomNumber(0, pool.length - 1)];
}

/**
 * Processes the outcome of a player kicking the ball.
 * Refactored to pass the 50-line linting limit.
 */
function executeKickAction(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
): [number, number] {
  const { ball, pitchSize } = matchDetails;

  const [, pitchHeight] = pitchSize;

  // 1. Update Metadata
  matchDetails.iterationLog.push(`ball kicked by: ${player.name}`);
  Object.assign(ball.lastTouch, {
    playerName: player.name,
    playerID: player.playerID,
    teamID: team.teamID,
  });

  // 2. Resolve Direction and Power
  const side = player.originPOS[1] > pitchHeight / 2 ? 'top' : 'bottom';

  const direction = getRandomKickDirection(side);

  const power = common.calculatePower(player.skill.strength);

  // 3. Resolve Target Position
  const newPos =
    side === 'top'
      ? getTopKickedPosition(direction, ball.position, power)
      : getBottomKickedPosition(direction, ball.position, power);

  // 4. Calculate Movement
  return calcBallMovementOverTime(matchDetails, player.skill.strength, newPos, player);
}

/**
 * Resolves the destination of a through ball and executes movement.
 * Refactored to comply with the 50-line limit and use existing common utilities.
 */
function resolvePassDestination(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
): [number, number] {
  const { ball, pitchSize } = matchDetails;

  // 1. Update Metadata & Stats
  Object.assign(ball.lastTouch, {
    playerName: player.name,
    playerID: player.playerID,
    teamID: team.teamID,
  });

  const playersInDistance = getPlayersInDistance(team, player, pitchSize);

  // FIXED: Replaced non-existent common.sample with your actual random logic
  const randIdx = common.getRandomNumber(0, playersInDistance.length - 1);

  const tPlyr = playersInDistance[randIdx];

  matchDetails.iterationLog.push(`through ball passed by: ${player.name} to: ${tPlyr.name}`);
  player.stats.passes.total++;

  // 2. Calculate Target Position (Extracted)
  const closePlyPos = calculateThroughBallTarget(player, tPlyr, matchDetails);

  // 3. Execute Movement
  return calcBallMovementOverTime(matchDetails, player.skill.strength, closePlyPos, player);
}

/**
 * Helper to determine the target coordinate based on player skill and pitch position.
 */
function calculateThroughBallTarget(
  player: Player,
  targetPlayer: TestPlayer,
  matchDetails: MatchDetails,
): [number, number] {
  const [, pitchHeight] = matchDetails.pitchSize;

  const { position } = matchDetails.ball;

  const [tpX, tpY] = common.destructPos(targetPlayer.currentPOS);

  const pos: [number, number] = [tpX, tpY];

  const isAttackingTop = player.originPOS[1] > pitchHeight / 2;

  const bottomThird = position[1] > pitchHeight - pitchHeight / 3;

  const middleThird = position[1] > pitchHeight / 3 && position[1] < pitchHeight - pitchHeight / 3;

  // Logic Branch 1: Successful skill check
  if (player.skill.passing > common.getRandomNumber(0, 100)) {
    return isAttackingTop
      ? setTargetPlyPos({ tplyr: pos, lowX: 0, highX: 0, lowY: -20, highY: -10 })
      : setTargetPlyPos({ tplyr: pos, lowX: 0, highX: 0, lowY: 10, highY: 30 });
  }

  // Logic Branch 2: Failed skill check
  if (isAttackingTop) {
    if (bottomThird) {
      return setTargetPlyPos({ tplyr: pos, lowX: -10, highX: 10, lowY: -10, highY: 10 });
    }

    if (middleThird) {
      return setTargetPlyPos({ tplyr: pos, lowX: -20, highX: 20, lowY: -50, highY: 50 });
    }

    return setTargetPlyPos({ tplyr: pos, lowX: -30, highX: 30, lowY: -100, highY: 100 });
  }

  // Branch 3: Failed skill check (Bottom team)
  if (bottomThird) {
    return setTargetPlyPos({ tplyr: pos, lowX: -30, highX: 30, lowY: -100, highY: 100 });
  }

  if (middleThird) {
    return setTargetPlyPos({ tplyr: pos, lowX: -20, highX: 20, lowY: -50, highY: 50 });
  }

  return setTargetPlyPos({ tplyr: pos, lowX: -10, highX: 10, lowY: -10, highY: 10 });
}

export function setTargetPlyPos(targetConfig: {
  tplyr: Player;
  lowX: number;
  highX: number;
  lowY: number;
  highY: number;
}): [number, number] {
  const { tplyr, lowX, highX, lowY, highY } = targetConfig;

  const closePlyPos: [number, number] = [0, 0];

  const [targetPlayerXPos, targetPlayerYPos] = common.destructPos(tplyr);

  closePlyPos[0] = common.round(targetPlayerXPos + common.getRandomNumber(lowX, highX), 0);
  closePlyPos[1] = common.round(targetPlayerYPos + common.getRandomNumber(lowY, highY), 0);

  return closePlyPos;
}

export { executeKickAction, resolvePassDestination };
