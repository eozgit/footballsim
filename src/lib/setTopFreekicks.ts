import * as common from './common.js';
import { Ball, MatchDetails, Player, Team } from './types.js';
import * as setFreekicks from './setFreekicks.js';
import { setDeepFreekickBallAndKicker } from './setBottomFreekicks.js';

function setTopFreekick(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const { kickOffTeam, secondTeam } = matchDetails;
  const [, pitchHeight] = matchDetails.pitchSize;
  const [, ballY] = matchDetails.ball.position;
  const attack =
    kickOffTeam.players[0].originPOS[1] < pitchHeight / 2
      ? kickOffTeam
      : secondTeam;
  const defence =
    kickOffTeam.players[0].originPOS[1] < pitchHeight / 2
      ? secondTeam
      : kickOffTeam;
  const hundredToHalfway = common.isBetween(ballY, 100, pitchHeight / 2 + 1);
  const halfwayToLastQtr = common.isBetween(
    ballY,
    pitchHeight / 2,
    pitchHeight - pitchHeight / 4,
  );
  const upperFinalQtr = common.isBetween(
    ballY,
    pitchHeight - pitchHeight / 4,
    pitchHeight - pitchHeight / 6 - 5,
  );
  const lowerFinalQtr = common.isBetween(
    ballY,
    pitchHeight - pitchHeight / 6 - 5,
    pitchHeight,
  );

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
    `Unhandled freekick position: ball at [${matchDetails.ball.position}]`,
  );
}

function setTopOneHundredYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  return setFreekicks.setOneHundredYPos(matchDetails, attack, defence, 'top');
}

function setTopOneHundredToHalfwayYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  return setFreekicks.setOneHundredToHalfwayYPos(
    matchDetails,
    attack,
    defence,
    'top',
  );
}

function setTopHalfwayToBottomQtrYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  return setFreekicks.setHalfwayToOppositeQtrYPos(
    matchDetails,
    attack,
    defence,
    'top',
  );
}

function setTopBottomQtrCentreYPos(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
): MatchDetails {
  const isTop = true;

  const { ball, pitchWidth, pitchHeight, kickPlayer } = initializeKickerAndBall(
    matchDetails,
    attack,
  );

  setDeepFreekickBallAndKicker(
    ball,
    kickPlayer,
    attack.teamID,
    pitchWidth,
    true,
  );

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
    if (player.position === 'GK') {
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.25)];
    } else if (['CB', 'LB', 'RB'].includes(player.position)) {
      if (player.position === 'CB') {
        player.currentPOS = [
          player.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ];
      } else if (player.position === 'LB' || player.position === 'RB') {
        player.currentPOS = [
          player.originPOS[0],
          Math.floor(pitchHeight * 0.66),
        ];
      }
    } else if (player.name !== kickPlayer.name) {
      player.currentPOS = common.getRandomBottomPenaltyPosition(matchDetails);
    }
  }
  let playerSpace = -3;
  for (const player of defence.players) {
    const ballDistanceFromGoalX = ball.position[0] - pitchWidth / 2;
    const midWayFromBalltoGoalX = Math.floor(
      (ball.position[0] - ballDistanceFromGoalX) / 2,
    );
    const ballDistanceFromGoalY = pitchHeight - ball.position[1];
    const midWayFromBalltoGoalY = Math.floor(
      (ball.position[1] - ballDistanceFromGoalY) / 2,
    );
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
      player.currentPOS = common.getRandomBottomPenaltyPosition(matchDetails);
    }
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

function initializeKickerAndBall(
  matchDetails: MatchDetails,
  attack: Team,
): { ball: Ball; pitchWidth: number; pitchHeight: number; kickPlayer: Player } {
  const { ball, pitchSize } = matchDetails;
  const [pitchWidth, pitchHeight] = pitchSize;
  const kickPlayer = attack.players[5];
  setBallPossession(kickPlayer, ball, attack);
  return { ball, pitchWidth, pitchHeight, kickPlayer };
}

function setBallPossession(kickPlayer: Player, ball: Ball, attack: Team): void {
  kickPlayer.hasBall = true;
  ball.lastTouch.playerName = kickPlayer.name;
  ball.Player = kickPlayer.playerID;
  ball.withTeam = attack.teamID;
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
  kickPlayer.currentPOS = [ballX, ballY];
  for (const player of attack.players) {
    const { playerID, position, originPOS } = player;
    if (position === 'GK') {
      player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.25)];
    } else if (['CB', 'LB', 'RB'].includes(position)) {
      if (position === 'CB') {
        player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.5)];
      } else if (['LB', 'RB'].includes(position)) {
        player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.66)];
      }
    } else if (playerID !== kickPlayer.playerID) {
      player.currentPOS = common.getRandomBottomPenaltyPosition(matchDetails);
    }
  }
  let playerSpace = common.upToMax(ball.position[1] + 3, pitchHeight);
  for (const player of defence.players) {
    const { position, originPOS } = player;
    const ballDistanceFromGoalX = ball.position[0] - pitchWidth / 2;
    const midWayFromBalltoGoalX = Math.floor(
      (ball.position[0] - ballDistanceFromGoalX) / 2,
    );
    if (position === 'GK') {
      player.currentPOS = player.currentPOS = [...originPOS];
    } else if (['CB', 'LB', 'RB'].includes(position)) {
      player.currentPOS = [midWayFromBalltoGoalX, playerSpace];
      playerSpace -= 2;
    } else {
      player.currentPOS = common.getRandomBottomPenaltyPosition(matchDetails);
    }
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

export { setTopFreekick, initializeKickerAndBall, setBallPossession };
