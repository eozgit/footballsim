'use strict';
import { MatchDetails, Player, Team } from './types.js';
import common from '../lib/common.js';

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

  if (ballY < 101) return setTopOneHundredYPos(matchDetails, attack, defence);
  if (hundredToHalfway)
    return setTopOneHundredToHalfwayYPos(matchDetails, attack, defence);
  if (halfwayToLastQtr)
    return setTopHalfwayToBottomQtrYPos(matchDetails, attack, defence);
  if (upperFinalQtr)
    return setTopBottomQtrCentreYPos(matchDetails, attack, defence);
  if (lowerFinalQtr)
    return setTopLowerFinalQtrBylinePos(matchDetails, attack, defence);
  throw new Error(
    `Unhandled freekick position: ball at [${matchDetails.ball.position}]`,
  );
}

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

  if (ballY > pitchHeight - 100)
    return setBottomOneHundredYPos(matchDetails, attack, defence);
  if (hundredToHalfway)
    return setBottomOneHundredToHalfwayYPos(matchDetails, attack, defence);
  if (halfwayToLastQtr)
    return setBottomHalfwayToTopQtrYPos(matchDetails, attack, defence);
  if (upperFinalQtr)
    return setBottomUpperQtrCentreYPos(matchDetails, attack, defence);
  if (lowerFinalQtr)
    return setBottomLowerFinalQtrBylinePos(matchDetails, attack, defence);
  throw new Error(
    `Unhandled freekick position: ball at [${matchDetails.ball.position}]`,
  );
}

function setTopOneHundredYPos(
  matchDetails: MatchDetails,
  attack: any,
  defence: any,
): MatchDetails {
  attack.players[0].hasBall = true;
  const { ball } = matchDetails;
  ball.lastTouch.playerName = attack.players[0].name;
  ball.Player = attack.players[0].playerID;
  ball.withTeam = attack.teamID;
  ball.direction = 'south';
  for (const player of attack.players) {
    if (player.position === 'GK')
      player.currentPOS = [...matchDetails.ball.position];
    if (player.position !== 'GK') player.currentPOS = [...player.originPOS];
  }
  for (const player of defence.players) {
    if (player.position === 'GK') player.currentPOS = [...player.originPOS];
    if (player.position !== 'GK')
      player.currentPOS = [
        player.originPOS[0],
        common.upToMin(player.originPOS[1] - 100, 0),
      ];
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBottomOneHundredYPos(
  matchDetails: MatchDetails,
  attack: any,
  defence: any,
): MatchDetails {
  attack.players[0].hasBall = true;
  const { ball, pitchSize } = matchDetails;
  const [, pitchHeight] = pitchSize;
  ball.lastTouch.playerName = attack.players[0].name;
  ball.Player = attack.players[0].playerID;
  ball.withTeam = attack.teamID;
  ball.direction = 'north';
  for (const player of attack.players) {
    if (player.position === 'GK')
      player.currentPOS = [...matchDetails.ball.position];
    if (player.position !== 'GK') player.currentPOS = [...player.originPOS];
  }
  for (const player of defence.players) {
    if (player.position === 'GK') player.currentPOS = [...player.originPOS];
    if (player.position !== 'GK') {
      player.currentPOS = [
        player.originPOS[0],
        common.upToMax(player.originPOS[1] + 100, pitchHeight),
      ];
    }
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

function setTopOneHundredToHalfwayYPos(
  matchDetails: MatchDetails,
  attack: any,
  defence: any,
): MatchDetails {
  const { ball } = matchDetails;
  const [, pitchHeight] = matchDetails.pitchSize;
  const goalieToKick = common.isBetween(
    ball.position[1],
    0,
    pitchHeight * 0.25 + 1,
  );
  const kickPlayer = goalieToKick ? attack.players[0] : attack.players[3];
  kickPlayer.hasBall = true;
  ball.lastTouch.playerName = kickPlayer.name;
  ball.Player = kickPlayer.playerID;
  ball.withTeam = attack.teamID;
  ball.direction = 'south';
  for (const player of attack.players) {
    if (kickPlayer.position === 'GK') {
      if (player.position === 'GK') player.currentPOS = [...ball.position];
      if (player.name !== kickPlayer.name) {
        const newYPOS = common.upToMax(
          player.originPOS[1] + 300,
          pitchHeight * 0.9,
        );
        player.currentPOS = [player.originPOS[0], newYPOS];
      }
    } else {
      const newYPOS =
        player.originPOS[1] + (ball.position[1] - player.originPOS[1]) + 300;
      if (player.name === kickPlayer.name)
        player.currentPOS = [...ball.position];
      else if (player.position === 'GK') {
        const maxYPOSCheck = Math.floor(
          common.upToMax(newYPOS, pitchHeight * 0.25),
        );
        player.currentPOS = [player.originPOS[0], maxYPOSCheck];
      } else if (['CB', 'LB', 'RB'].includes(player.position)) {
        const maxYPOSCheck = Math.floor(
          common.upToMax(newYPOS, pitchHeight * 0.5),
        );
        player.currentPOS = [player.originPOS[0], maxYPOSCheck];
      } else if (['CM', 'LM', 'RM'].includes(player.position)) {
        const maxYPOSCheck = Math.floor(
          common.upToMax(newYPOS, pitchHeight * 0.75),
        );
        player.currentPOS = [player.originPOS[0], maxYPOSCheck];
      } else {
        const maxYPOSCheck = Math.floor(
          common.upToMax(newYPOS, pitchHeight * 0.9),
        );
        player.currentPOS = [player.originPOS[0], maxYPOSCheck];
      }
    }
  }
  for (const player of defence.players) {
    if (kickPlayer.position === 'GK') {
      if (player.position === 'GK') player.currentPOS = [...player.originPOS];
      if (player.position !== 'GK') {
        player.currentPOS = [
          player.originPOS[0],
          common.upToMin(player.originPOS[1] - 100, 0),
        ];
      }
    } else if (['GK', 'CB', 'LB', 'RB'].includes(player.position))
      player.currentPOS = [...player.originPOS];
    else if (['CM', 'LM', 'RM'].includes(player.position)) {
      player.currentPOS = [
        player.originPOS[0],
        Math.floor(pitchHeight * 0.75 + 5),
      ];
    } else {
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.5)];
    }
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBottomOneHundredToHalfwayYPos(
  matchDetails: MatchDetails,
  attack: any,
  defence: Team,
): MatchDetails {
  const { ball } = matchDetails;
  const [, pitchHeight] = matchDetails.pitchSize;
  const goalieToKick = common.isBetween(
    ball.position[1],
    pitchHeight * 0.75 + 1,
    pitchHeight,
  );
  const kickPlayer = goalieToKick ? attack.players[0] : attack.players[3];
  kickPlayer.hasBall = true;
  common.debug('sf1', ball.lastTouch);
  common.debug('sf2', ball.Player);
  ball.lastTouch.playerName = kickPlayer.name;
  ball.Player = kickPlayer.playerID;
  ball.withTeam = attack.teamID;
  ball.direction = 'north';
  for (const player of attack.players) {
    if (kickPlayer.position === 'GK') {
      if (player.position === 'GK') player.currentPOS = [...ball.position]; // Spread to create new reference
      if (player.name !== kickPlayer.name) {
        const newYPOS = common.upToMin(
          player.originPOS[1] - 300,
          pitchHeight * 0.1,
        );
        player.currentPOS = [player.originPOS[0], Math.floor(newYPOS)];
      }
    } else {
      const newYPOS =
        player.originPOS[1] + (ball.position[1] - player.originPOS[1]) - 300;
      if (player.name === kickPlayer.name)
        player.currentPOS = [...ball.position];
      else if (player.position === 'GK') {
        const maxYPOSCheck = Math.floor(
          common.upToMin(newYPOS, pitchHeight * 0.75),
        );
        player.currentPOS = [player.originPOS[0], maxYPOSCheck];
      } else if (['CB', 'LB', 'RB'].includes(player.position)) {
        const maxYPOSCheck = Math.floor(
          common.upToMin(newYPOS, pitchHeight * 0.5),
        );
        player.currentPOS = [player.originPOS[0], maxYPOSCheck];
      } else if (['CM', 'LM', 'RM'].includes(player.position)) {
        const maxYPOSCheck = Math.floor(
          common.upToMin(newYPOS, pitchHeight * 0.25),
        );
        player.currentPOS = [player.originPOS[0], maxYPOSCheck];
      } else {
        const maxYPOSCheck = Math.floor(
          common.upToMin(newYPOS, pitchHeight * 0.1),
        );
        player.currentPOS = [player.originPOS[0], maxYPOSCheck];
      }
    }
  }
  for (const player of defence.players) {
    if (kickPlayer.position === 'GK') {
      if (player.position === 'GK') {
        player.currentPOS = [...player.originPOS];
      } else {
        const newYPOS = common.upToMax(player.originPOS[1] + 100, pitchHeight);
        // FIX: Ensure newYPOS is an integer and assigned to a new array
        player.currentPOS = [player.originPOS[0], Math.floor(newYPOS)];
      }
    } else if (['GK', 'CB', 'LB', 'RB'].includes(player.position))
      player.currentPOS = [...player.originPOS];
    else if (['CM', 'LM', 'RM'].includes(player.position)) {
      player.currentPOS = [
        player.originPOS[0],
        Math.floor(pitchHeight * 0.25 - 5),
      ];
    } else {
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.5)];
    }
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

function setTopHalfwayToBottomQtrYPos(
  matchDetails: MatchDetails,
  attack: any,
  defence: any,
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
    ? 'south'
    : ballLeft
      ? 'southeast'
      : 'southwest';
  kickPlayer.currentPOS = [...ball.position];
  for (const player of attack.players) {
    if (player.position === 'GK')
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.25)];
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
      const maxYPOSCheck = Math.floor(
        common.upToMax(ball.position[1] - 100, pitchHeight * 0.5),
      );
      player.currentPOS = [player.originPOS[0], maxYPOSCheck];
    } else if (['CM', 'LM', 'RM'].includes(player.position)) {
      const maxYPOSCheck = common.upToMax(
        ball.position[1] + common.getRandomNumber(150, 300),
        pitchHeight * 0.75,
      );
      if (player.name !== kickPlayer.name)
        player.currentPOS = [player.originPOS[0], Math.floor(maxYPOSCheck)];
    } else {
      const maxYPOSCheck = common.upToMax(
        ball.position[1] + common.getRandomNumber(300, 400),
        pitchHeight * 0.9,
      );
      player.currentPOS = [player.originPOS[0], Math.floor(maxYPOSCheck)];
    }
  }
  for (const player of defence.players) {
    if (['GK', 'CB', 'LB', 'RB'].includes(player.position)) {
      player.currentPOS = [...player.originPOS];
    } else if (['CM', 'LM', 'RM'].includes(player.position)) {
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.75)];
    } else {
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.5)];
    }
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBottomHalfwayToTopQtrYPos(
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
  kickPlayer.currentPOS = [ball.position[0], ball.position[1]];
  for (const player of attack.players) {
    if (player.position === 'GK')
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.75)];
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
      const maxYPOSCheck = Math.floor(
        common.upToMin(ball.position[1] + 100, pitchHeight * 0.5),
      );
      player.currentPOS = [player.originPOS[0], maxYPOSCheck];
    } else if (['CM', 'LM', 'RM'].includes(player.position)) {
      const maxYPOSCheck = common.upToMin(
        ball.position[1] - common.getRandomNumber(150, 300),
        pitchHeight * 0.25,
      );
      if (player.name !== kickPlayer.name)
        player.currentPOS = [player.originPOS[0], Math.floor(maxYPOSCheck)];
    } else {
      const maxYPOSCheck = common.upToMin(
        ball.position[1] - common.getRandomNumber(300, 400),
        pitchHeight * 0.1,
      );
      player.currentPOS = [player.originPOS[0], Math.floor(maxYPOSCheck)];
    }
  }
  for (const player of defence.players) {
    if (['GK', 'CB', 'LB', 'RB'].includes(player.position)) {
      player.currentPOS = [...player.originPOS];
    } else if (['CM', 'LM', 'RM'].includes(player.position)) {
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.25)];
    } else {
      player.currentPOS = [player.originPOS[0], pitchHeight * 0.5];
    }
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

function setTopBottomQtrCentreYPos(
  matchDetails: MatchDetails,
  attack: any,
  defence: any,
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
    ? 'south'
    : ballLeft
      ? 'southeast'
      : 'southwest';
  kickPlayer.currentPOS = [...ball.position];
  for (const player of attack.players) {
    if (player.position === 'GK')
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.25)];
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
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
    if (player.position === 'GK')
      player.currentPOS = player.currentPOS = player.originPOS.map(
        (x: any) => x,
      );
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
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

function setBottomUpperQtrCentreYPos(
  matchDetails: MatchDetails,
  attack: any,
  defence: any,
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
  kickPlayer.currentPOS = [...ball.position];
  for (const player of attack.players) {
    if (player.position === 'GK')
      player.currentPOS = [player.originPOS[0], Math.floor(pitchHeight * 0.75)];
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
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
    if (player.position === 'GK')
      player.currentPOS = player.currentPOS = player.originPOS.map(
        (x: any) => x,
      );
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
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

function setTopLowerFinalQtrBylinePos(
  matchDetails: MatchDetails,
  attack: any,
  defence: any,
): MatchDetails {
  const { ball } = matchDetails;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const kickPlayer = attack.players[5];
  kickPlayer.hasBall = true;
  ball.lastTouch.playerName = kickPlayer.name;
  ball.Player = kickPlayer.playerID;
  ball.withTeam = attack.teamID;
  const ballLeft = common.isBetween(ball.position[0], 0, pitchWidth / 4 + 4);
  ball.direction = ballLeft ? 'east' : 'west';
  kickPlayer.currentPOS = [...ball.position];
  for (const player of attack.players) {
    const { playerID, position, originPOS } = player;
    if (position === 'GK')
      player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.25)];
    else if (['CB', 'LB', 'RB'].includes(position)) {
      if (position === 'CB')
        player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.5)];
      else if (['LB', 'RB'].includes(position))
        player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.66)];
    } else if (playerID !== kickPlayer.playerID)
      player.currentPOS = common.getRandomBottomPenaltyPosition(matchDetails);
  }
  let playerSpace = common.upToMax(ball.position[1] + 3, pitchHeight);
  for (const player of defence.players) {
    const { position, originPOS } = player;
    const ballDistanceFromGoalX = ball.position[0] - pitchWidth / 2;
    const midWayFromBalltoGoalX = Math.floor(
      (ball.position[0] - ballDistanceFromGoalX) / 2,
    );
    if (position === 'GK')
      player.currentPOS = player.currentPOS = [...originPOS];
    else if (['CB', 'LB', 'RB'].includes(position)) {
      player.currentPOS = [midWayFromBalltoGoalX, playerSpace];
      playerSpace -= 2;
    } else
      player.currentPOS = common.getRandomBottomPenaltyPosition(matchDetails);
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBottomLowerFinalQtrBylinePos(
  matchDetails: MatchDetails,
  attack: any,
  defence: any,
): MatchDetails {
  const { ball } = matchDetails;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const kickPlayer = attack.players[5];
  kickPlayer.hasBall = true;
  ball.lastTouch.playerName = kickPlayer.name;
  ball.Player = kickPlayer.playerID;
  ball.withTeam = attack.teamID;
  const ballLeft = common.isBetween(ball.position[0], 0, pitchWidth / 4 + 4);
  ball.direction = ballLeft ? 'east' : 'west';
  kickPlayer.currentPOS = [...ball.position]; // Improved cloning

  for (const player of attack.players) {
    const { playerID, position, originPOS } = player;
    if (position === 'GK')
      player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.75)]; // Replaced parseInt
    else if (['CB', 'LB', 'RB'].includes(position)) {
      if (position === 'CB')
        player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.5)]; // Replaced parseInt
      else if (['LB', 'RB'].includes(position))
        player.currentPOS = [originPOS[0], Math.floor(pitchHeight * 0.33)]; // Replaced parseInt
    } else if (playerID !== kickPlayer.playerID)
      player.currentPOS = common.getRandomTopPenaltyPosition(matchDetails);
  }

  let playerSpace = common.upToMin(ball.position[1] - 3, 0);
  for (const player of defence.players) {
    const { position, originPOS } = player;
    const ballDistanceFromGoalX = ball.position[0] - pitchWidth / 2;
    // Calculation optimized with Math.floor
    const midWayFromBalltoGoalX = Math.floor(
      (ball.position[0] - ballDistanceFromGoalX) / 2,
    );

    if (position === 'GK') player.currentPOS = [...originPOS];
    else if (['CB', 'LB', 'RB'].includes(position)) {
      player.currentPOS = [midWayFromBalltoGoalX, playerSpace];
      playerSpace += 2;
    } else player.currentPOS = common.getRandomTopPenaltyPosition(matchDetails);
  }
  matchDetails.endIteration = true;
  return matchDetails;
}

export default {
  setTopFreekick,
  setBottomFreekick,
};
