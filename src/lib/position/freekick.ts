import * as common from '../common.js';
import type { MatchDetails, Team } from "../types.js";
export function setOneHundredYPos(
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
      common.setPlayerXY(player, ball.position[0], ball.position[1]);
    } else {
      common.setPlayerXY(player, player.originPOS[0], player.originPOS[1]);
    }
  }

  // Position defensive players with a 100-unit buffer from their origin
  for (const player of defence.players) {
    if (player.position === 'GK') {
      common.setPlayerXY(player, player.originPOS[0], player.originPOS[1]);
    } else {
      const newY = isTop
        ? common.upToMin(player.originPOS[1] - 100, 0) // Push toward Top goal
        : common.upToMax(player.originPOS[1] + 100, pitchHeight); // Push toward Bottom goal

      common.setPlayerXY(player, player.originPOS[0], newY);
    }
  }

  matchDetails.endIteration = true;

  return matchDetails;
}
