import * as common from '../common.js';
import type { MatchDetails, Player } from '../types.js';
export function setGoalieHasBall(matchDetails: MatchDetails, thisGoalie: Player): MatchDetails {
  const { kickOffTeam, secondTeam } = matchDetails;

  const team = kickOffTeam.players[0].playerID === thisGoalie.playerID ? kickOffTeam : secondTeam;

  const opposition =
    kickOffTeam.players[0].playerID === thisGoalie.playerID ? secondTeam : kickOffTeam;

  thisGoalie.hasBall = true;
  matchDetails.ball.lastTouch.playerName = thisGoalie.name;
  matchDetails.ball.lastTouch.playerID = thisGoalie.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;

  const [x, y] = thisGoalie.currentPOS as [number, number];

  matchDetails.ball.position = [x, y, 0];
  common.setPlayerXY(thisGoalie, x, y);

  matchDetails.ball.Player = thisGoalie.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = team.teamID;
  team.intent = 'attack';
  opposition.intent = 'defend';
  matchDetails.ball.ballOverIterations = [];

  return matchDetails;
}
