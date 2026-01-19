import * as common from '../common.js';
import { resetPlayerPositions } from '../setVariables.js';
import type { MatchDetails, Player, Team } from '../types.js';

export function setKickOffTeamGoalScored(matchDetails: MatchDetails): MatchDetails {
  const scorer = matchDetails.ball.lastTouch.playerName;

  matchDetails.iterationLog.push(`Goal Scored by - ${scorer} - (${matchDetails.kickOffTeam.name})`);
  const thisIndex = matchDetails.kickOffTeam.players.findIndex(function (thisPlayer: Player) {
    return thisPlayer.name === scorer;
  });

  if (thisIndex > -1) {
    matchDetails.kickOffTeam.players[thisIndex].stats.goals++;
  }

  matchDetails.ball.lastTouch.playerName = ``;
  matchDetails.ball.lastTouch.playerID = -99;
  matchDetails.ball.lastTouch.teamID = -99;
  common.removeBallFromAllPlayers(matchDetails);
  resetPlayerPositions(matchDetails);
  setBallSpecificGoalScoreValue(matchDetails, matchDetails.secondTeam);
  matchDetails.secondTeam.intent = `attack`;
  matchDetails.kickOffTeam.intent = `defend`;
  matchDetails.kickOffTeamStatistics.goals++;
  matchDetails.endIteration = true;

  return matchDetails;
}

export function setSecondTeamGoalScored(matchDetails: MatchDetails): MatchDetails {
  const scorer = matchDetails.ball.lastTouch.playerName;

  matchDetails.iterationLog.push(`Goal Scored by - ${scorer} - (${matchDetails.secondTeam.name})`);
  const thisIndex = matchDetails.secondTeam.players.findIndex(function (thisPlayer: Player) {
    return thisPlayer.name === scorer;
  });

  if (thisIndex > -1) {
    matchDetails.secondTeam.players[thisIndex].stats.goals++;
  }

  matchDetails.ball.lastTouch.playerName = '';
  matchDetails.ball.lastTouch.playerID = -99;
  matchDetails.ball.lastTouch.teamID = -99;
  common.removeBallFromAllPlayers(matchDetails);
  resetPlayerPositions(matchDetails);
  setBallSpecificGoalScoreValue(matchDetails, matchDetails.kickOffTeam);
  matchDetails.kickOffTeam.intent = `attack`;
  matchDetails.secondTeam.intent = `defend`;
  matchDetails.secondTeamStatistics.goals++;
  matchDetails.endIteration = true;

  return matchDetails;
}

export function setBallSpecificGoalScoreValue(
  matchDetails: MatchDetails,
  conceedingTeam: Team,
): void {
  matchDetails.ball.position = [matchDetails.pitchSize[0] / 2, matchDetails.pitchSize[1] / 2, 0];
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = conceedingTeam.teamID;
  const playerWithBall = common.getRandomNumber(9, 10);

  const waitingPlayer = playerWithBall === 9 ? 10 : 9;

  common.setPlayerXY(
    conceedingTeam.players[playerWithBall],
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  );
  conceedingTeam.players[playerWithBall].hasBall = true;
  matchDetails.ball.lastTouch.playerName = conceedingTeam.players[playerWithBall].name;
  matchDetails.ball.lastTouch.playerID = conceedingTeam.players[playerWithBall].playerID;
  matchDetails.ball.lastTouch.teamID = conceedingTeam.teamID;
  matchDetails.ball.Player = conceedingTeam.players[playerWithBall].playerID;

  common.setPlayerXY(
    conceedingTeam.players[waitingPlayer],
    matchDetails.ball.position[0] + 20,
    matchDetails.ball.position[1],
  );
}

export function resolveGoalScored(matchDetails: MatchDetails, isTopGoal: boolean): MatchDetails {
  const { half } = matchDetails;

  if (half === 0) {
    throw new Error('cannot set half as 0');
  }

  const isOddHalf = common.isOdd(half);

  // Logic: Top Goal (Y < 1) vs Bottom Goal (Y >= Height)
  if (isTopGoal) {
    return isOddHalf
      ? setSecondTeamGoalScored(matchDetails)
      : setKickOffTeamGoalScored(matchDetails);
  } else {
    return isOddHalf
      ? setKickOffTeamGoalScored(matchDetails)
      : setSecondTeamGoalScored(matchDetails);
  }
}
