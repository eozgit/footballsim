import {
  calcBallMovementOverTime,
  getBottomKickedPosition,
  getTopKickedPosition,
} from './ballMovement.js';
import * as common from './common.js';
import type { MatchDetails, Player, Team } from './types.js';

/**
 * Provides a random cardinal direction based on which half the player is attacking.
 */
function getRandomKickDirection(side: 'top' | 'bottom'): string {
  const horizontal = ['east', 'east', 'west', 'west'];
  const baseTop = ['wait', 'north', 'north', 'north', 'north', ...horizontal];
  const diagTop = [
    'northeast',
    'northeast',
    'northeast',
    'northwest',
    'northwest',
    'northwest',
  ];

  const baseBottom = [
    'wait',
    'south',
    'south',
    'south',
    'south',
    ...horizontal,
  ];
  const diagBottom = [
    'southeast',
    'southeast',
    'southeast',
    'southwest',
    'southwest',
    'southwest',
  ];

  const pool =
    side === 'top' ? baseTop.concat(diagTop) : baseBottom.concat(diagBottom);
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
) {
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
  return calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    newPos,
    player,
  );
}
export { executeKickAction };
