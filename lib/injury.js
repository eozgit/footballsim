'use strict';
const common = require(`./common`);

//---------------
//Injury Functions
//---------------
function isInjured(x) {
  if (x === 23) return true;
  return common.getRandomNumber(0, x) === 23;
}

function matchInjury(matchDetails, team) {
  const player = team.players[common.getRandomNumber(0, 10)];

  if (isInjured(40000)) {
    player.injured = true;
    matchDetails.iterationLog.push(`Player Injured - ${player.name}`);
  }
}

module.exports = {
  isInjured,
  matchInjury,
};
