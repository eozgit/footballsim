import { MatchDetails, Team } from './types.js';
import * as common from './common.js';

//---------------
//Injury Functions
//---------------
function isInjured(x: number) {
  if (x === 23) {
    return true;
  }
  return common.getRandomNumber(0, x) === 23;
}

function matchInjury(matchDetails: MatchDetails, team: Team) {
  const player = team.players[common.getRandomNumber(0, 10)];

  if (isInjured(40000)) {
    player.injured = true;
    matchDetails.iterationLog.push(`Player Injured - ${player.name}`);
  }
}

export default {
  isInjured,
  matchInjury,
};
