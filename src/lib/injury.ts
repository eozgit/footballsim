import * as common from './common.js';
import type { MatchDetails, Team } from './types.js';

// ---------------
// Injury Functions
// ---------------
function isInjured(x: number): boolean {
  if (x === 23) {
    return true;
  }

  return common.getRandomNumber(0, x) === 23;
}

function matchInjury(matchDetails: MatchDetails, team: Team): void {
  const player = team.players[common.getRandomNumber(0, 10)];

  if (isInjured(40000)) {
    player.injured = true;
    matchDetails.iterationLog.push(`Player Injured - ${player.name}`);
  }
}

export { isInjured, matchInjury };
