import { MatchDetails, PitchDetails, Team } from './lib/types.js';

import * as common from './lib/common.js';
import { matchInjury } from './lib/injury.js';
import * as setPositions from './lib/setPositions.js';
import * as setVariables from './lib/setVariables.js';
import * as playerMovement from './lib/playerMovement.js';
import * as ballMovement from './lib/ballMovement.js';
import * as validate from './lib/validate.js';

//------------------------
//    Functions
//------------------------
async function initiateGame(
  team1: Team,
  team2: Team,
  pitchDetails: PitchDetails,
) {
  validate.validateArguments(team1, team2, pitchDetails);
  validate.validateTeam(team1);
  validate.validateTeam(team2);
  validate.validatePitch(pitchDetails);
  const matchDetails = setVariables.populateMatchDetails(
    team1,
    team2,
    pitchDetails,
  );
  let kickOffTeam = setVariables.setGameVariables(matchDetails.kickOffTeam);
  const secondTeam = setVariables.setGameVariables(matchDetails.secondTeam);
  kickOffTeam = setVariables.koDecider(kickOffTeam, matchDetails);
  matchDetails.iterationLog.push(`Team to kick off - ${kickOffTeam.name}`);
  matchDetails.iterationLog.push(`Second team - ${secondTeam.name}`);
  setPositions.switchSide(matchDetails, secondTeam);
  matchDetails.kickOffTeam = kickOffTeam;
  matchDetails.secondTeam = secondTeam;
  return matchDetails;
}

async function playIteration(
  matchDetails: MatchDetails,
): Promise<MatchDetails> {
  const closestPlayerA = {
    name: '',
    position: 100000,
  };
  const closestPlayerB = {
    name: '',
    position: 100000,
  };
  validate.validateMatchDetails(matchDetails);
  validate.validateTeamSecondHalf(matchDetails.kickOffTeam);
  validate.validateTeamSecondHalf(matchDetails.secondTeam);
  validate.validatePlayerPositions(matchDetails);
  matchDetails.iterationLog = [];
  let { kickOffTeam, secondTeam } = matchDetails;
  matchInjury(matchDetails, kickOffTeam);
  matchInjury(matchDetails, secondTeam);
  matchDetails = ballMovement.moveBall(matchDetails);
  if (matchDetails.endIteration === true) {
    delete matchDetails.endIteration;
    return matchDetails;
  }
  playerMovement.closestPlayerToBall(closestPlayerA, kickOffTeam, matchDetails);
  playerMovement.closestPlayerToBall(closestPlayerB, secondTeam, matchDetails);
  kickOffTeam = playerMovement.decideMovement(
    closestPlayerA,
    kickOffTeam,
    secondTeam,
    matchDetails,
  );
  secondTeam = playerMovement.decideMovement(
    closestPlayerB,
    secondTeam,
    kickOffTeam,
    matchDetails,
  );
  matchDetails.kickOffTeam = kickOffTeam;
  matchDetails.secondTeam = secondTeam;
  if (
    matchDetails.ball.ballOverIterations.length === 0 ||
    matchDetails.ball.withTeam !== ''
  ) {
    playerMovement.checkOffside(kickOffTeam, secondTeam, matchDetails);
  }
  return matchDetails;
}

async function startSecondHalf(
  matchDetails: MatchDetails,
): Promise<MatchDetails> {
  validate.validateMatchDetails(matchDetails);
  validate.validateTeamSecondHalf(matchDetails.kickOffTeam);
  validate.validateTeamSecondHalf(matchDetails.secondTeam);
  validate.validatePlayerPositions(matchDetails);
  const { kickOffTeam, secondTeam } = matchDetails;
  setPositions.switchSide(matchDetails, kickOffTeam);
  setPositions.switchSide(matchDetails, secondTeam);
  common.removeBallFromAllPlayers(matchDetails);
  setVariables.resetPlayerPositions(matchDetails);
  setPositions.setBallSpecificGoalScoreValue(
    matchDetails,
    matchDetails.secondTeam,
  );
  matchDetails.iterationLog = [
    `Second Half Started: ${matchDetails.secondTeam.name} to kick offs`,
  ];
  matchDetails.kickOffTeam.intent = `defend`;
  matchDetails.secondTeam.intent = `attack`;
  matchDetails.half++;
  return matchDetails;
}

export { initiateGame, playIteration, startSecondHalf };
export {
  Ball,
  Cards,
  LastTouch,
  MatchDetails,
  PitchDetails,
  Player,
  Position,
  Shots,
  Skill,
  Stats,
  Team,
  TeamStatistics,
} from './lib/types.js';
