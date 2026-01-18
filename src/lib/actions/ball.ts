import * as common from '../common.js';
import type { MatchDetails, Player, Team } from '../types.js';
export function setBallMovementMatchDetails(proximityConfig: {
  matchDetails: MatchDetails;
  player: Player;
  startPos: [number, number];
  team: Team;
}): void {
  const { matchDetails, player: thisPlayer, startPos: thisPos, team: thisTeam } = proximityConfig;

  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.Player = thisPlayer.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.lastTouch.playerName = thisPlayer.name;
  matchDetails.ball.lastTouch.playerID = thisPlayer.playerID;
  matchDetails.ball.lastTouch.teamID = thisTeam.teamID;
  matchDetails.ball.withTeam = thisTeam.teamID;
  matchDetails.ball.position = [...thisPos];
  common.setPlayerXY(thisPlayer, thisPos[0], thisPos[1]);
}

export function ballMoved(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  team: Team,
  opp: Team,
): void {
  thisPlayer.hasBall = false;
  matchDetails.ball.withPlayer = false;
  team.intent = `attack`;
  opp.intent = `attack`;
  matchDetails.ball.Player = ``;
  matchDetails.ball.withTeam = ``;
}
