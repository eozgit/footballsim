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
  const isTop = side === 'top';
  const { ball } = matchDetails;
  const [, pitchHeight] = matchDetails.pitchSize;

  const goalieToKick = isTop
    ? common.isBetween(ball.position[1], 0, pitchHeight * 0.25 + 1)
    : common.isBetween(ball.position[1], pitchHeight * 0.75 - 1, pitchHeight);

  const kickPlayer = goalieToKick ? attack.players[0] : attack.players[3];

  kickPlayer.hasBall = true;
  ball.lastTouch.playerName = kickPlayer.name;
  ball.Player = kickPlayer.playerID;
  ball.withTeam = attack.teamID;
  ball.direction = isTop ? 'south' : 'north';

  for (const player of attack.players) {
    if (player.name === kickPlayer.name) {
      player.currentPOS = [ball.position[0], ball.position[1]];
    } else {
      // Logic from original setTopFreekicks:
      // If GK is kicking, it's a fixed +300.
      // If a defender is kicking, it's origin + (ballY - origin) + 300
      let newYPOS: number;
      const offset = isTop ? 300 : -300;

      if (kickPlayer.position === 'GK') {
        newYPOS = player.originPOS[1] + offset;
      } else {
        newYPOS =
          player.originPOS[1] +
          (ball.position[1] - player.originPOS[1]) +
          offset;
      }

      // Restore specific boundary limits per position
      let limit: number;
      if (player.position === 'GK') {
        limit = isTop ? pitchHeight * 0.25 : pitchHeight * 0.75;
      } else if (['CB', 'LB', 'RB'].includes(player.position)) {
        limit = pitchHeight * 0.5;
      } else if (['CM', 'LM', 'RM'].includes(player.position)) {
        limit = isTop ? pitchHeight * 0.75 : pitchHeight * 0.25;
      } else {
        limit = isTop ? pitchHeight * 0.9 : pitchHeight * 0.1;
      }

      const finalY = isTop
        ? common.upToMax(newYPOS, limit)
        : common.upToMin(newYPOS, limit);

      player.currentPOS = [player.originPOS[0], Math.floor(finalY)];
    }
  }

  for (const player of defence.players) {
    if (kickPlayer.position === 'GK') {
      // Original logic for GK-led defensive positioning
      if (player.position === 'GK') {
        player.currentPOS = [player.originPOS[0], player.originPOS[1]];
      } else {
        const defY = isTop
          ? common.upToMin(player.originPOS[1] - 100, 0)
          : common.upToMax(player.originPOS[1] + 100, pitchHeight);
        player.currentPOS = [player.originPOS[0], defY];
      }
    } else if (['GK', 'CB', 'LB', 'RB'].includes(player.position)) {
      player.currentPOS = [player.originPOS[0], player.originPOS[1]];
    } else {
      // Match the exact pixel requirements for CMs and others
      const targetY =
        player.position === 'CM' ||
        player.position === 'LM' ||
        player.position === 'RM'
          ? isTop
            ? pitchHeight * 0.75 + 5
            : pitchHeight * 0.25 - 5
          : pitchHeight * 0.5;
      player.currentPOS = [player.originPOS[0], Math.floor(targetY)];
    }
  }

  matchDetails.endIteration = true;
  return matchDetails;
}

export { setOneHundredYPos, setOneHundredToHalfwayYPos };
