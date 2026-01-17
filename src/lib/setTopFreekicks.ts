import * as common from './common.js';
import {
  setOneHundredYPos,
  setOneHundredToHalfwayYPos,
  initializeKickerAndBall,
  setDeepFreekickBallAndKicker,
  setHalfwayToOppositeQtrYPos,
  alignPlayersForPenalty,
  setSetPiecePositions,
} from './setFreekicks.js';
import type { MatchDetails, Team } from './types.js';

function setTopFreekick(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const { kickOffTeam, secondTeam } = matchDetails;

  const [, pitchHeight] = matchDetails.pitchSize;

  const [, ballY] = matchDetails.ball.position;

  const attack = kickOffTeam.players[0].originPOS[1] < pitchHeight / 2 ? kickOffTeam : secondTeam;

  const defence = kickOffTeam.players[0].originPOS[1] < pitchHeight / 2 ? secondTeam : kickOffTeam;

  const hundredToHalfway = common.isBetween(ballY, 100, pitchHeight / 2 + 1);

  const halfwayToLastQtr = common.isBetween(ballY, pitchHeight / 2, pitchHeight - pitchHeight / 4);

  const upperFinalQtr = common.isBetween(
    ballY,
    pitchHeight - pitchHeight / 4,
    pitchHeight - pitchHeight / 6 - 5,
  );

  const lowerFinalQtr = common.isBetween(ballY, pitchHeight - pitchHeight / 6 - 5, pitchHeight);

  if (ballY < 101) {
    return setTopOneHundredYPos(matchDetails, attack, defence);
  }

  if (hundredToHalfway) {
    return setTopOneHundredToHalfwayYPos(matchDetails, attack, defence);
  }

  if (halfwayToLastQtr) {
    return setTopHalfwayToBottomQtrYPos(matchDetails, attack, defence);
  }

  if (upperFinalQtr) {
    return setTopBottomQtrCentreYPos(matchDetails, attack, defence);
  }

  if (lowerFinalQtr) {
    return setTopLowerFinalQtrBylinePos(matchDetails, attack, defence);
  }

  throw new Error(
    `Unhandled freekick position: ball at [${matchDetails.ball.position[0]} ${matchDetails.ball.position[1]}]`,
  );
}

function setTopOneHundredYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  return setOneHundredYPos(matchDetails, attack, defence, 'top');
}

function setTopOneHundredToHalfwayYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  return setOneHundredToHalfwayYPos(matchDetails, attack, defence, 'top');
}

function setTopHalfwayToBottomQtrYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  const { matchDetails: details } = setHalfwayToOppositeQtrYPos(
    matchDetails,
    attack,
    defence,
    'top',
  );

  return details;
}

function setTopBottomQtrCentreYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  const { ball, pitchWidth, pitchHeight, kickPlayer } = initializeKickerAndBall(
    matchDetails,
    attack,
  );

  setDeepFreekickBallAndKicker({
    ball: ball,
    kickPlayer: kickPlayer,
    teamID: attack.teamID,
    pitchWidth: pitchWidth,
    isTop: true,
  });

  return alignPlayersForPenalty({
    isTop: true,
    attack: attack,
    pitchHeight: pitchHeight,
    kickPlayer: kickPlayer,
    matchDetails: matchDetails,
    defence: defence,
    ball: ball,
    pitchWidth: pitchWidth,
  });
}

function setTopLowerFinalQtrBylinePos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  const { ball, pitchWidth, pitchHeight, kickPlayer } = initializeKickerAndBall(
    matchDetails,
    attack,
  );

  const ballLeft = common.isBetween(ball.position[0], 0, pitchWidth / 4 + 4);

  ball.direction = ballLeft ? 'east' : 'west';
  const [ballX, ballY] = ball.position;

  common.setPlayerXY(kickPlayer, ballX, ballY);

  return setSetPiecePositions({
    attack: attack,
    pitchHeight: pitchHeight,
    kickPlayer: kickPlayer,
    matchDetails: matchDetails,
    ball: ball,
    defence: defence,
    pitchWidth: pitchWidth,
    isTop: true,
  });
}

export { setTopFreekick };
