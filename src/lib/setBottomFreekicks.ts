import * as common from './common.js';
import {
  alignPlayersForPenalty,
  setDeepFreekickBallAndKicker,
  setHalfwayToOppositeQtrYPos,
  setOneHundredToHalfwayYPos,
  setOneHundredYPos,
  setSetPiecePositions,
} from './setFreekicks.js';
import type { MatchDetails, Team } from './types.js';

function setBottomFreekick(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const { kickOffTeam, secondTeam } = matchDetails;
  const [, pitchHeight] = matchDetails.pitchSize;
  const [, ballY] = matchDetails.ball.position;
  const attack =
    kickOffTeam.players[0].originPOS[1] > pitchHeight / 2
      ? kickOffTeam
      : secondTeam;
  const defence =
    kickOffTeam.players[0].originPOS[1] > pitchHeight / 2
      ? secondTeam
      : kickOffTeam;
  const hundredToHalfway = common.isBetween(
    ballY,
    pitchHeight / 2 - 1,
    pitchHeight - 100,
  );
  const halfwayToLastQtr = common.isBetween(
    ballY,
    pitchHeight / 4,
    pitchHeight / 2,
  );
  const upperFinalQtr = common.isBetween(
    ballY,
    pitchHeight / 6 - 5,
    pitchHeight / 4,
  );
  const lowerFinalQtr = common.isBetween(ballY, 0, pitchHeight / 6 - 5);

  if (ballY > pitchHeight - 100) {
    return setBottomOneHundredYPos(matchDetails, attack, defence);
  }
  if (hundredToHalfway) {
    return setBottomOneHundredToHalfwayYPos(matchDetails, attack, defence);
  }
  if (halfwayToLastQtr) {
    return setBottomHalfwayToTopQtrYPos(matchDetails, attack, defence);
  }
  if (upperFinalQtr) {
    return setBottomUpperQtrCentreYPos(matchDetails, attack, defence);
  }
  if (lowerFinalQtr) {
    return setBottomLowerFinalQtrBylinePos(matchDetails, attack, defence);
  }
  throw new Error(
    `Unhandled freekick position: ball at [${matchDetails.ball.position}]`,
  );
}

function setBottomOneHundredYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  return setOneHundredYPos(matchDetails, attack, defence, 'bottom');
}

function setBottomOneHundredToHalfwayYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  return setOneHundredToHalfwayYPos(matchDetails, attack, defence, 'bottom');
}

function setBottomHalfwayToTopQtrYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  const { matchDetails: details } = setHalfwayToOppositeQtrYPos(
    matchDetails,
    attack,
    defence,
    'bottom',
  );
  return details;
}

function setBottomUpperQtrCentreYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  const { matchDetails: details, kickPlayer } = setHalfwayToOppositeQtrYPos(
    matchDetails,
    attack,
    defence,
    'bottom',
  );
  const { ball, pitchSize } = details;
  const [pitchWidth, pitchHeight] = pitchSize;

  const ballInCentre = common.isBetween(
    ball.position[0],
    pitchWidth / 4 + 5,
    pitchWidth - pitchWidth / 4 - 5,
  );
  const ballLeft = common.isBetween(ball.position[0], 0, pitchWidth / 4 + 4);
  ball.direction = ballInCentre
    ? 'north'
    : ballLeft
      ? 'northeast'
      : 'northwest';

  return alignPlayersForPenalty(
    false,
    attack,
    pitchHeight,
    kickPlayer,
    details,
    defence,
    ball,
    pitchWidth,
  );
}

function setBottomLowerFinalQtrBylinePos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  const {
    ball,
    pitchSize: [pitchWidth, pitchHeight],
  } = matchDetails;
  const kickPlayer = attack.players[5];

  setDeepFreekickBallAndKicker(
    ball,
    kickPlayer,
    attack.teamID,
    pitchWidth,
    false,
  );

  return setSetPiecePositions(
    attack,
    pitchHeight,
    kickPlayer,
    matchDetails,
    ball,
    defence,
    pitchWidth,
    false,
  );
}

export { setBottomFreekick };
