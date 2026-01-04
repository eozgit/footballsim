import * as common from './common.js';
import { MatchDetails, Team } from './types.js';
import * as setFreekicks from './setFreekicks.js';

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
  return setFreekicks.setOneHundredYPos(
    matchDetails,
    attack,
    defence,
    'bottom',
  );
}

function setBottomOneHundredToHalfwayYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  return setFreekicks.setOneHundredToHalfwayYPos(
    matchDetails,
    attack,
    defence,
    'bottom',
  );
}

function setBottomHalfwayToTopQtrYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  return setFreekicks.setHalfwayToOppositeQtrYPos(
    matchDetails,
    attack,
    defence,
    'bottom',
  );
}

function setBottomUpperQtrCentreYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  const { ball } = matchDetails;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const kickPlayer = attack.players[5];
  kickPlayer.hasBall = true;
  ball.lastTouch.playerName = kickPlayer.name;
  ball.Player = kickPlayer.playerID;
  ball.withTeam = attack.teamID;
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
  const [ballX, ballY] = ball.position;
  kickPlayer.currentPOS = [ballX, ballY];
  for (const player of attack.players) {
    if (player.position === 'GK') {
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.75)];
    } else if (['CB', 'LB', 'RB'].includes(player.position)) {
      if (player.position === 'CB') {
        player.currentPOS = [
          player.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ];
      } else if (player.position === 'LB' || player.position === 'RB') {
        player.currentPOS = [
          player.originPOS[0],
          Math.floor(pitchHeight * 0.33),
        ];
      }
    } else if (player.name !== kickPlayer.name) {
      player.currentPOS = common.getRandomTopPenaltyPosition(matchDetails);
    }
  }
  let playerSpace = -3;
  for (const player of defence.players) {
    const ballDistanceFromGoalX = ball.position[0] - pitchWidth / 2;
    const midWayFromBalltoGoalX = Math.floor(
      (ball.position[0] - ballDistanceFromGoalX) / 2,
    );
    const midWayFromBalltoGoalY = Math.floor(ball.position[1] / 2);
    if (player.position === 'GK') {
      const [origX, origY] = player.originPOS;
      player.currentPOS = [origX, origY];
    } else if (['CB', 'LB', 'RB'].includes(player.position)) {
      player.currentPOS = [
        midWayFromBalltoGoalX + playerSpace,
        midWayFromBalltoGoalY,
      ];
      playerSpace += 2;
    } else {
      player.currentPOS = common.getRandomTopPenaltyPosition(matchDetails);
    }
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBottomLowerFinalQtrBylinePos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  const side = 'bottom';
  const isTop = side === 'top';
  const { ball } = matchDetails;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const kickPlayer = attack.players[5];
  kickPlayer.hasBall = true;
  ball.lastTouch.playerName = kickPlayer.name;
  ball.Player = kickPlayer.playerID;
  ball.withTeam = attack.teamID;
  const ballInCentre = common.isBetween(
    ball.position[0],
    pitchWidth / 4 + 5,
    pitchWidth - pitchWidth / 4 - 5,
  );
  const ballLeft = common.isBetween(ball.position[0], 0, pitchWidth / 4 + 4);
  ball.direction = isTop
    ? ballInCentre
      ? 'south'
      : ballLeft
        ? 'southeast'
        : 'southwest'
    : ballLeft
      ? 'east'
      : 'west';
  const [ballX, ballY] = ball.position;
  kickPlayer.currentPOS = [ballX, ballY];

  for (const player of attack.players) {
    const { playerID, position, originPOS } = player;
    if (position === 'GK') {
      player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.75)];
    } // Replaced parseInt
    else if (['CB', 'LB', 'RB'].includes(position)) {
      if (position === 'CB') {
        player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.5)];
      } // Replaced parseInt
      else if (['LB', 'RB'].includes(position)) {
        player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.33)];
      } // Replaced parseInt
    } else if (playerID !== kickPlayer.playerID) {
      player.currentPOS = common.getRandomTopPenaltyPosition(matchDetails);
    }
  }

  let playerSpace = common.upToMin(ball.position[1] - 3, 0);
  for (const player of defence.players) {
    const { position, originPOS } = player;
    const ballDistanceFromGoalX = ball.position[0] - pitchWidth / 2;
    // Calculation optimized with Math.floor
    const midWayFromBalltoGoalX = Math.floor(
      (ball.position[0] - ballDistanceFromGoalX) / 2,
    );

    if (position === 'GK') {
      player.currentPOS = [...originPOS];
    } else if (['CB', 'LB', 'RB'].includes(position)) {
      player.currentPOS = [midWayFromBalltoGoalX, playerSpace];
      playerSpace += 2;
    } else {
      player.currentPOS = common.getRandomTopPenaltyPosition(matchDetails);
    }
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

export { setBottomFreekick };
