import * as common from '../common.js';
import type { MatchDetails, Team } from '../types.js';
export function switchSide(matchDetails: MatchDetails, team: Team): MatchDetails {
  for (const thisPlayer of team.players) {
    if (!thisPlayer.originPOS) {
      throw new Error(`Each player must have an origin position set`);
    }

    thisPlayer.originPOS[1] = matchDetails.pitchSize[1] - thisPlayer.originPOS[1];
    common.setPlayerPos(thisPlayer, [...thisPlayer.originPOS]);
    thisPlayer.intentPOS = [...thisPlayer.originPOS];
    thisPlayer.fitness = thisPlayer.fitness < 51 ? common.round(thisPlayer.fitness + 50, 2) : 100;
  }

  return matchDetails;
}
