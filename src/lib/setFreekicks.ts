import { MatchDetails, Team } from './types.js';
import * as common from './common.js';
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

  // Direction is South for top-side kicks, North for bottom-side
  ball.direction = isTop ? 'south' : 'north';

  // Position attacking players
  for (const player of attack.players) {
    if (player.position === 'GK') {
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
        ? common.upToMin(player.originPOS[1] - 100, 0) // Push up for top-side
        : common.upToMax(player.originPOS[1] + 100, pitchHeight); // Push down for bottom-side
      player.currentPOS = [player.originPOS[0], newY];
    }
  }

  matchDetails.endIteration = true;
  return matchDetails;
}

export { setOneHundredYPos };
