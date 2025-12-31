'use strict';
import { MatchDetails, Player, Team } from './types.js';
import common from '../lib/common.js';
import setVariables from '../lib/setVariables.js';
import setFreekicks from '../lib/setFreekicks.js';
import { createPlayer } from './ballMovement.js';

function setGoalieHasBall(
  matchDetails: MatchDetails,
  thisGoalie: Player,
): MatchDetails {
  const { kickOffTeam, secondTeam } = matchDetails;
  const team =
    kickOffTeam.players[0].playerID === thisGoalie.playerID
      ? kickOffTeam
      : secondTeam;
  const opposition =
    kickOffTeam.players[0].playerID === thisGoalie.playerID
      ? secondTeam
      : kickOffTeam;
  thisGoalie.hasBall = true;
  matchDetails.ball.lastTouch.playerName = thisGoalie.name;
  matchDetails.ball.lastTouch.playerID = thisGoalie.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;

  const [x, y] = thisGoalie.currentPOS as [number, number];
  matchDetails.ball.position = [x, y, 0];
  thisGoalie.currentPOS = [x, y, 0] as any;

  matchDetails.ball.Player = thisGoalie.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = team.teamID;
  team.intent = 'attack';
  opposition.intent = 'defend';
  matchDetails.ball.ballOverIterations = [];
  return matchDetails;
}

function setTopRightCornerPositions(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const [pitchWidth] = matchDetails.pitchSize;
  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];
  const halfPitchSize = matchDetails.pitchSize[1] / 2;
  const attack =
    kickOffTeamKeepYPos > halfPitchSize
      ? matchDetails.kickOffTeam
      : matchDetails.secondTeam;
  const defence =
    kickOffTeamKeepYPos > halfPitchSize
      ? matchDetails.secondTeam
      : matchDetails.kickOffTeam;
  for (const playerNum of [0, 1, 2, 3, 4]) {
    attack.players[playerNum].currentPOS = [
      ...attack.players[playerNum].originPOS,
    ];
    defence.players[playerNum].currentPOS = [
      ...defence.players[playerNum].originPOS,
    ];
  }
  for (const playerNum of [5, 6, 7, 8, 9, 10]) {
    attack.players[playerNum].currentPOS =
      common.getRandomTopPenaltyPosition(matchDetails);
    defence.players[playerNum].currentPOS =
      common.getRandomTopPenaltyPosition(matchDetails);
  }
  attack.players[1].currentPOS = [pitchWidth, 0];
  attack.players[4].currentPOS = [pitchWidth - 10, 20];
  defence.players[4].currentPOS = [pitchWidth - 12, 10];
  matchDetails.ball.position = [pitchWidth, 0, 0];
  setBallSpecificCornerValue(matchDetails, attack);
  matchDetails.endIteration = true;
  return matchDetails;
}

function setTopLeftCornerPositions(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];
  const halfPitchSize = matchDetails.pitchSize[1] / 2;
  const attack =
    kickOffTeamKeepYPos > halfPitchSize
      ? matchDetails.kickOffTeam
      : matchDetails.secondTeam;
  const defence =
    kickOffTeamKeepYPos > halfPitchSize
      ? matchDetails.secondTeam
      : matchDetails.kickOffTeam;
  for (const playerNum of [0, 1, 2, 3, 4]) {
    attack.players[playerNum].currentPOS = [
      ...attack.players[playerNum].originPOS,
    ];
    defence.players[playerNum].currentPOS = [
      ...defence.players[playerNum].originPOS,
    ];
  }
  for (const playerNum of [5, 6, 7, 8, 9, 10]) {
    attack.players[playerNum].currentPOS =
      common.getRandomTopPenaltyPosition(matchDetails);
    defence.players[playerNum].currentPOS =
      common.getRandomTopPenaltyPosition(matchDetails);
  }
  attack.players[1].currentPOS = [0, 0];
  attack.players[4].currentPOS = [10, 20];
  defence.players[1].currentPOS = [12, 10];
  matchDetails.ball.position = [0, 0, 0];
  setBallSpecificCornerValue(matchDetails, attack);
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBottomLeftCornerPositions(
  matchDetails: MatchDetails,
): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const [, pitchHeight] = matchDetails.pitchSize;
  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];
  const halfPitchSize = matchDetails.pitchSize[1] / 2;
  const attack =
    kickOffTeamKeepYPos < halfPitchSize
      ? matchDetails.kickOffTeam
      : matchDetails.secondTeam;
  const defence =
    kickOffTeamKeepYPos < halfPitchSize
      ? matchDetails.secondTeam
      : matchDetails.kickOffTeam;
  for (const playerNum of [0, 1, 2, 3, 4]) {
    attack.players[playerNum].currentPOS = [
      ...attack.players[playerNum].originPOS,
    ];
    defence.players[playerNum].currentPOS = [
      ...defence.players[playerNum].originPOS,
    ];
  }
  for (const playerNum of [5, 6, 7, 8, 9, 10]) {
    attack.players[playerNum].currentPOS =
      common.getRandomBottomPenaltyPosition(matchDetails);
    defence.players[playerNum].currentPOS =
      common.getRandomBottomPenaltyPosition(matchDetails);
  }
  attack.players[1].currentPOS = [0, pitchHeight];
  attack.players[4].currentPOS = [10, pitchHeight - 20];
  defence.players[1].currentPOS = [12, pitchHeight - 10];
  matchDetails.ball.position = [0, pitchHeight, 0];
  setBallSpecificCornerValue(matchDetails, attack);
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBottomRightCornerPositions(
  matchDetails: MatchDetails,
): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];
  const halfPitchSize = matchDetails.pitchSize[1] / 2;
  const attack =
    kickOffTeamKeepYPos < halfPitchSize
      ? matchDetails.kickOffTeam
      : matchDetails.secondTeam;
  const defence =
    kickOffTeamKeepYPos < halfPitchSize
      ? matchDetails.secondTeam
      : matchDetails.kickOffTeam;
  for (const playerNum of [0, 1, 2, 3, 4]) {
    attack.players[playerNum].currentPOS = [
      ...attack.players[playerNum].originPOS,
    ];
    defence.players[playerNum].currentPOS = [
      ...defence.players[playerNum].originPOS,
    ];
  }
  for (const playerNum of [5, 6, 7, 8, 9, 10]) {
    attack.players[playerNum].currentPOS =
      common.getRandomBottomPenaltyPosition(matchDetails);
    defence.players[playerNum].currentPOS =
      common.getRandomBottomPenaltyPosition(matchDetails);
  }
  attack.players[1].currentPOS = [pitchWidth, pitchHeight];
  attack.players[4].currentPOS = [pitchWidth - 10, pitchHeight - 20];
  defence.players[4].currentPOS = [pitchWidth - 12, pitchHeight - 10];
  matchDetails.ball.position = [pitchWidth, pitchHeight, 0];
  setBallSpecificCornerValue(matchDetails, attack);
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBallSpecificCornerValue(
  matchDetails: MatchDetails,
  attack: Team,
): void {
  attack.players[1].hasBall = true;
  matchDetails.ball.lastTouch.playerName = attack.players[1].name;
  matchDetails.ball.lastTouch.playerID = attack.players[1].playerID;
  matchDetails.ball.lastTouch.teamID = attack.teamID;
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.Player = attack.players[1].playerID;
  matchDetails.ball.withTeam = attack.teamID;
  matchDetails.iterationLog.push(`Corner to - ${attack.name}`);
}

function setLeftKickOffTeamThrowIn(
  matchDetails: MatchDetails,
  ballIntended: [number, number, number],
): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const { kickOffTeam, secondTeam } = matchDetails;
  let [, place] = ballIntended;
  const [, pitchHeight] = matchDetails.pitchSize;
  place = place - 30 < 0 ? 30 : place;
  place = place + 10 > pitchHeight + 1 ? pitchHeight - 10 : place;
  const movement = kickOffTeam.players[5].originPOS[1] - place;
  const oppMovement = 0 - movement;
  ballThrowInPosition(matchDetails, kickOffTeam);
  setPlayerPositions(matchDetails, kickOffTeam, movement);
  setPlayerPositions(matchDetails, secondTeam, oppMovement);
  attackLeftThrowInPlayerPosition(pitchHeight, kickOffTeam, place);
  defenceLeftThrowInPlayerPosition(pitchHeight, secondTeam, place);
  matchDetails.ball.position = [0, place, 0];
  kickOffTeam.players[5].currentPOS = [
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  ];
  matchDetails.ball.lastTouch.playerName = kickOffTeam.players[5].name;
  matchDetails.ball.lastTouch.playerID = kickOffTeam.players[5].playerID;
  matchDetails.ball.lastTouch.teamID = kickOffTeam.teamID;
  matchDetails.endIteration = true;
  return matchDetails;
}

function setRightKickOffTeamThrowIn(
  matchDetails: MatchDetails,
  ballIntended: [number, number, number],
): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const { kickOffTeam, secondTeam } = matchDetails;
  let [, place] = ballIntended;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  place = place - 30 < 0 ? 30 : place;
  place = place + 10 > pitchHeight + 1 ? pitchHeight - 10 : place;
  const movement = kickOffTeam.players[5].originPOS[1] - place;
  const oppMovement = 0 - movement;
  ballThrowInPosition(matchDetails, kickOffTeam);
  setPlayerPositions(matchDetails, kickOffTeam, movement);
  setPlayerPositions(matchDetails, secondTeam, oppMovement);
  attackRightThrowInPlayerPosition(matchDetails.pitchSize, kickOffTeam, place);
  defenceRightThrowInPlayerPosition(matchDetails.pitchSize, secondTeam, place);
  matchDetails.ball.position = [pitchWidth, place, 0];
  kickOffTeam.players[5].currentPOS = [
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  ];
  matchDetails.ball.lastTouch.playerName = kickOffTeam.players[5].name;
  matchDetails.ball.lastTouch.playerID = kickOffTeam.players[5].playerID;
  matchDetails.ball.lastTouch.teamID = kickOffTeam.teamID;
  matchDetails.endIteration = true;
  return matchDetails;
}

function setLeftSecondTeamThrowIn(
  matchDetails: MatchDetails,
  ballIntended: [number, number, number],
): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const { kickOffTeam, secondTeam } = matchDetails;
  let [, place] = ballIntended;
  const [, pitchHeight] = matchDetails.pitchSize;
  place = place - 30 < 0 ? 30 : place;
  place = place + 10 > pitchHeight + 1 ? pitchHeight - 10 : place;
  const movement = secondTeam.players[5].originPOS[1] - place;
  const oppMovement = 0 - movement;
  ballThrowInPosition(matchDetails, secondTeam);
  setPlayerPositions(matchDetails, secondTeam, movement);
  setPlayerPositions(matchDetails, kickOffTeam, oppMovement);
  attackLeftThrowInPlayerPosition(pitchHeight, secondTeam, place);
  defenceLeftThrowInPlayerPosition(pitchHeight, kickOffTeam, place);
  matchDetails.ball.position = [0, place, 0];
  secondTeam.players[5].currentPOS = [
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  ];
  matchDetails.ball.lastTouch.playerName = secondTeam.players[5].name;
  matchDetails.ball.lastTouch.playerID = secondTeam.players[5].playerID;
  matchDetails.ball.lastTouch.teamID = secondTeam.teamID;
  matchDetails.endIteration = true;
  return matchDetails;
}

function setRightSecondTeamThrowIn(
  matchDetails: MatchDetails,
  ballIntended: [number, number, number],
): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const { kickOffTeam, secondTeam } = matchDetails;
  let [, place] = ballIntended;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  place = place - 30 < 0 ? 30 : place;
  place = place + 10 > pitchHeight + 1 ? pitchHeight - 10 : place;
  const movement = secondTeam.players[5].originPOS[1] - place;
  const oppMovement = 0 - movement;
  ballThrowInPosition(matchDetails, secondTeam);
  setPlayerPositions(matchDetails, secondTeam, movement);
  setPlayerPositions(matchDetails, kickOffTeam, oppMovement);
  attackRightThrowInPlayerPosition(matchDetails.pitchSize, secondTeam, place);
  defenceRightThrowInPlayerPosition(matchDetails.pitchSize, kickOffTeam, place);
  matchDetails.ball.position = [pitchWidth, place, 0];
  secondTeam.players[5].currentPOS = [
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  ];
  matchDetails.ball.lastTouch.playerName = secondTeam.players[5].name;
  matchDetails.ball.lastTouch.playerID = secondTeam.players[5].playerID;
  matchDetails.ball.lastTouch.teamID = secondTeam.teamID;
  matchDetails.endIteration = true;
  return matchDetails;
}

function ballThrowInPosition(matchDetails: MatchDetails, attack: Team): void {
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.Player = attack.players[5].playerID;
  matchDetails.ball.withTeam = attack.teamID;
  matchDetails.iterationLog.push(`Throw in to - ${attack.name}`);
}

function attackLeftThrowInPlayerPosition(
  pitchHeight: number,
  attack: Team,
  place: number,
): void {
  attack.players[8].currentPOS = [15, place];
  attack.players[7].currentPOS = [10, common.upToMax(place + 10, pitchHeight)];
  attack.players[9].currentPOS = [10, common.upToMin(place - 10, 0)];
  attack.players[5].hasBall = true;
}

function defenceLeftThrowInPlayerPosition(
  pitchHeight: number,
  defence: Team,
  place: number,
): void {
  defence.players[5].currentPOS = [20, place];
  defence.players[7].currentPOS = [30, common.upToMax(place + 5, pitchHeight)];
  defence.players[8].currentPOS = [25, common.upToMin(place - 15, 0)];
  defence.players[9].currentPOS = [10, common.upToMin(place - 30, 0)];
}

function attackRightThrowInPlayerPosition(
  pitchSize: [number, number],
  attack: Team,
  place: number,
): void {
  const [pitchWidth, pitchHeight] = pitchSize;
  attack.players[8].currentPOS = [pitchWidth - 15, place];
  attack.players[7].currentPOS = [
    pitchWidth - 10,
    common.upToMax(place + 10, pitchHeight),
  ];
  attack.players[9].currentPOS = [
    pitchWidth - 10,
    common.upToMin(place - 10, 0),
  ];
  attack.players[5].hasBall = true;
}

function defenceRightThrowInPlayerPosition(
  pitchSize: [number, number],
  defence: Team,
  place: number,
): void {
  const [pitchWidth, pitchHeight] = pitchSize;
  defence.players[5].currentPOS = [pitchWidth - 20, place];
  defence.players[7].currentPOS = [
    pitchWidth - 30,
    common.upToMax(place + 5, pitchHeight),
  ];
  defence.players[8].currentPOS = [
    pitchWidth - 25,
    common.upToMin(place - 15, 0),
  ];
  defence.players[9].currentPOS = [
    pitchWidth - 10,
    common.upToMin(place - 30, 0),
  ];
}

function setBottomGoalKick(matchDetails: MatchDetails): MatchDetails {
  const { kickOffTeam, secondTeam } = matchDetails;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const side =
    kickOffTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';
  const teamTaking = side === 'bottom' ? kickOffTeam : secondTeam;

  common.removeBallFromAllPlayers(matchDetails);
  setVariables.resetPlayerPositions(matchDetails);
  setPlayerPositions(matchDetails, teamTaking, -80);
  matchDetails.ball.position = [pitchWidth / 2, pitchHeight - 20, 0];
  setBallSpecificGoalKickValue(matchDetails, teamTaking);
  matchDetails.endIteration = true;
  return matchDetails;
}

function setTopGoalKick(matchDetails: MatchDetails): MatchDetails {
  const { kickOffTeam, secondTeam } = matchDetails;
  const [pitchWidth] = matchDetails.pitchSize;
  const side =
    kickOffTeam.players[0].originPOS[1] < matchDetails.pitchSize[1] / 2
      ? 'top'
      : 'bottom';
  const teamTaking = side === 'top' ? kickOffTeam : secondTeam;

  common.removeBallFromAllPlayers(matchDetails);
  setVariables.resetPlayerPositions(matchDetails);
  setPlayerPositions(matchDetails, teamTaking, 80);
  matchDetails.ball.position = [pitchWidth / 2, 20, 0];
  setBallSpecificGoalKickValue(matchDetails, teamTaking);
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBallSpecificGoalKickValue(
  matchDetails: MatchDetails,
  attack: Team,
): void {
  const ballPos = matchDetails.ball.position;
  attack.players[0].currentPOS = [ballPos[0], ballPos[1]];
  attack.players[0].hasBall = true;
  matchDetails.ball.lastTouch.playerName = attack.players[0].name;
  matchDetails.ball.lastTouch.playerID = attack.players[0].playerID;
  matchDetails.ball.lastTouch.teamID = attack.teamID;
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.Player = attack.players[0].playerID;
  matchDetails.ball.withTeam = attack.teamID;
  matchDetails.iterationLog.push(`Goal Kick to - ${attack.name}`);
}

function closestPlayerToPosition(
  player: Player,
  team: Team,
  position: [number, number],
): { thePlayer: Player; proxPOS: [number, number]; proxToBall: number } {
  let currentDifference = 1000000;
  const playerInformation: {
    thePlayer: Player;
    proxPOS: [number, number];
    proxToBall: number;
  } = {
    thePlayer: createPlayer('GK'),
    proxPOS: [0, 0],
    proxToBall: 0,
  };
  for (const thisPlayer of team.players) {
    if (player.playerID !== thisPlayer.playerID) {
      if (thisPlayer.currentPOS[0] === 'NP') {
        throw new Error('Player no position!');
      }
      const ballToPlayerX = thisPlayer.currentPOS[0] - position[0];
      const ballToPlayerY = thisPlayer.currentPOS[1] - position[1];
      const proximityToBall = Math.abs(ballToPlayerX) + Math.abs(ballToPlayerY);
      if (proximityToBall < currentDifference) {
        playerInformation.thePlayer = thisPlayer;
        playerInformation.proxPOS = [ballToPlayerX, ballToPlayerY];
        playerInformation.proxToBall = proximityToBall;
        currentDifference = proximityToBall;
      }
    }
  }
  return playerInformation;
}

function setSetpieceKickOffTeam(matchDetails: MatchDetails): MatchDetails {
  const [, pitchHeight] = matchDetails.pitchSize;
  const ballPosition = matchDetails.ball.position;
  const attackingTowardsTop =
    matchDetails.kickOffTeam.players[0].currentPOS[1] > pitchHeight / 2;
  if (
    attackingTowardsTop &&
    common.inTopPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.kickOffTeamStatistics.penalties++;
    matchDetails.iterationLog.push(
      `penalty to: ${matchDetails.kickOffTeam.name}`,
    );
    return setTopPenalty(matchDetails);
  } else if (
    attackingTowardsTop === false &&
    common.inBottomPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.kickOffTeamStatistics.penalties++;
    matchDetails.iterationLog.push(
      `penalty to: ${matchDetails.kickOffTeam.name}`,
    );
    return setBottomPenalty(matchDetails);
  } else if (attackingTowardsTop) {
    matchDetails.kickOffTeamStatistics.freekicks++;
    matchDetails.iterationLog.push(
      `freekick to: ${matchDetails.kickOffTeam.name} [${matchDetails.ball.position}]`,
    );
    return setFreekicks.setBottomFreekick(matchDetails);
  }
  matchDetails.kickOffTeamStatistics.freekicks++;
  matchDetails.iterationLog.push(
    `freekick to: ${matchDetails.kickOffTeam.name} [${matchDetails.ball.position}]`,
  );
  return setFreekicks.setTopFreekick(matchDetails);
}

function setSetpieceSecondTeam(matchDetails: MatchDetails): MatchDetails {
  const [, pitchHeight] = matchDetails.pitchSize;
  const ballPosition = matchDetails.ball.position;
  const attackingTowardsTop =
    matchDetails.secondTeam.players[0].currentPOS[1] > pitchHeight / 2;
  if (
    attackingTowardsTop &&
    common.inTopPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.secondTeamStatistics.penalties++;
    matchDetails.iterationLog.push(
      `penalty to: ${matchDetails.secondTeam.name}`,
    );
    return setTopPenalty(matchDetails);
  } else if (
    attackingTowardsTop === false &&
    common.inBottomPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.secondTeamStatistics.penalties++;
    matchDetails.iterationLog.push(
      `penalty to: ${matchDetails.secondTeam.name}`,
    );
    return setBottomPenalty(matchDetails);
  } else if (attackingTowardsTop) {
    matchDetails.secondTeamStatistics.freekicks++;
    matchDetails.iterationLog.push(
      `freekick to: ${matchDetails.secondTeam.name} [${matchDetails.ball.position}]`,
    );
    return setFreekicks.setBottomFreekick(matchDetails);
  }
  matchDetails.secondTeamStatistics.freekicks++;
  matchDetails.iterationLog.push(
    `freekick to: ${matchDetails.secondTeam.name} [${matchDetails.ball.position}]`,
  );
  return setFreekicks.setTopFreekick(matchDetails);
}

function setTopPenalty(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];
  const halfPitchSize = matchDetails.pitchSize[1] / 2;
  const attack =
    kickOffTeamKeepYPos > halfPitchSize
      ? matchDetails.kickOffTeam
      : matchDetails.secondTeam;
  const defence =
    kickOffTeamKeepYPos > halfPitchSize
      ? matchDetails.secondTeam
      : matchDetails.kickOffTeam;
  const tempArray: [number, number] = [pitchWidth / 2, pitchHeight / 6];
  const shootArray: [number, number] = [
    pitchWidth / 2,
    common.round(pitchHeight / 17.5, 0),
  ];
  defence.players[0].currentPOS = [...defence.players[0].originPOS];
  setPlayerPenaltyPositions(tempArray, attack, defence);
  setBallSpecificPenaltyValue(matchDetails, shootArray, attack);
  matchDetails.ball.direction = `north`;
  attack.intent = `attack`;
  defence.intent = `defend`;
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBottomPenalty(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];
  const halfPitchSize = matchDetails.pitchSize[1] / 2;
  const attack =
    kickOffTeamKeepYPos > halfPitchSize
      ? matchDetails.secondTeam
      : matchDetails.kickOffTeam;
  const defence =
    kickOffTeamKeepYPos > halfPitchSize
      ? matchDetails.kickOffTeam
      : matchDetails.secondTeam;
  const tempArray: [number, number] = [
    pitchWidth / 2,
    pitchHeight - pitchHeight / 6,
  ];
  const shootArray: [number, number] = [
    pitchWidth / 2,
    pitchHeight - common.round(pitchHeight / 17.5, 0),
  ];
  defence.players[0].currentPOS = [...defence.players[0].originPOS];
  setPlayerPenaltyPositions(tempArray, attack, defence);
  setBallSpecificPenaltyValue(matchDetails, shootArray, attack);
  matchDetails.ball.direction = `south`;
  attack.intent = `attack`;
  defence.intent = `defend`;
  matchDetails.endIteration = true;
  return matchDetails;
}

function setPlayerPenaltyPositions(
  tempArray: [number, number],
  attack: Team,
  defence: Team,
): void {
  let oppxpos = -10;
  let teamxpos = -9;
  for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    if (num !== 10) {
      if (attack.players[num].currentPOS[0] !== 'NP') {
        attack.players[num].currentPOS = [
          tempArray[0] + teamxpos,
          tempArray[1],
        ];
      }
    }
    if (defence.players[num].currentPOS[0] !== 'NP') {
      defence.players[num].currentPOS = [tempArray[0] + oppxpos, tempArray[1]];
    }
    oppxpos += 2;
    teamxpos += 2;
  }
}

function setBallSpecificPenaltyValue(
  matchDetails: MatchDetails,
  shootArray: [number, number],
  attack: Team,
): void {
  attack.players[0].currentPOS = [...attack.players[0].originPOS];
  attack.players[10].currentPOS = [...shootArray];
  attack.players[10].hasBall = true;
  attack.players[10].action = `penalty`;
  matchDetails.ball.lastTouch.playerName = attack.players[10].name;
  matchDetails.ball.lastTouch.playerID = attack.players[10].playerID;
  matchDetails.ball.lastTouch.teamID = attack.teamID;

  // Tests expect 2D array in certain assertions even though Ball is 3D
  matchDetails.ball.position = [shootArray[0], shootArray[1]];

  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.Player = attack.players[10].playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = attack.teamID;
}

function setKickOffTeamGoalScored(matchDetails: MatchDetails): MatchDetails {
  const scorer = matchDetails.ball.lastTouch.playerName;
  matchDetails.iterationLog.push(
    `Goal Scored by - ${scorer} - (${matchDetails.kickOffTeam.name})`,
  );
  const thisIndex = matchDetails.kickOffTeam.players.findIndex(function (
    thisPlayer: Player,
  ) {
    return thisPlayer.name === scorer;
  });
  if (thisIndex > -1) matchDetails.kickOffTeam.players[thisIndex].stats.goals++;
  common.debug('sp3', matchDetails.ball.lastTouch);
  matchDetails.ball.lastTouch.playerName = ``;
  matchDetails.ball.lastTouch.playerID = -99;
  matchDetails.ball.lastTouch.teamID = -99;
  common.removeBallFromAllPlayers(matchDetails);
  setVariables.resetPlayerPositions(matchDetails);
  setBallSpecificGoalScoreValue(matchDetails, matchDetails.secondTeam);
  matchDetails.secondTeam.intent = `attack`;
  matchDetails.kickOffTeam.intent = `defend`;
  matchDetails.kickOffTeamStatistics.goals++;
  matchDetails.endIteration = true;
  return matchDetails;
}

function setSecondTeamGoalScored(matchDetails: MatchDetails): MatchDetails {
  const scorer = matchDetails.ball.lastTouch.playerName;
  matchDetails.iterationLog.push(
    `Goal Scored by - ${scorer} - (${matchDetails.secondTeam.name})`,
  );
  const thisIndex = matchDetails.secondTeam.players.findIndex(function (
    thisPlayer: Player,
  ) {
    return thisPlayer.name === scorer;
  });
  if (thisIndex > -1) matchDetails.secondTeam.players[thisIndex].stats.goals++;
  common.debug('sp4', matchDetails.ball.lastTouch);
  matchDetails.ball.lastTouch.playerName = '';
  matchDetails.ball.lastTouch.playerID = -99;
  matchDetails.ball.lastTouch.teamID = -99;
  common.removeBallFromAllPlayers(matchDetails);
  setVariables.resetPlayerPositions(matchDetails);
  setBallSpecificGoalScoreValue(matchDetails, matchDetails.kickOffTeam);
  matchDetails.kickOffTeam.intent = `attack`;
  matchDetails.secondTeam.intent = `defend`;
  matchDetails.secondTeamStatistics.goals++;
  matchDetails.endIteration = true;
  return matchDetails;
}

function setBallSpecificGoalScoreValue(
  matchDetails: MatchDetails,
  conceedingTeam: Team,
): void {
  matchDetails.ball.position = [
    matchDetails.pitchSize[0] / 2,
    matchDetails.pitchSize[1] / 2,
    0,
  ];
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = conceedingTeam.teamID;
  const playerWithBall = common.getRandomNumber(9, 10);
  const waitingPlayer = playerWithBall === 9 ? 10 : 9;

  conceedingTeam.players[playerWithBall].currentPOS = [
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  ];
  conceedingTeam.players[playerWithBall].hasBall = true;
  matchDetails.ball.lastTouch.playerName =
    conceedingTeam.players[playerWithBall].name;
  matchDetails.ball.lastTouch.playerID =
    conceedingTeam.players[playerWithBall].playerID;
  matchDetails.ball.lastTouch.teamID = conceedingTeam.teamID;
  matchDetails.ball.Player = conceedingTeam.players[playerWithBall].playerID;

  conceedingTeam.players[waitingPlayer].currentPOS = [
    matchDetails.ball.position[0] + 20,
    matchDetails.ball.position[1],
  ];
}

function keepInBoundaries(
  matchDetails: MatchDetails,
  kickteamID: string | number,
  ballIntended: [number, number, number],
): MatchDetails {
  const { kickOffTeam } = matchDetails;
  const KOTid = kickOffTeam.teamID;
  const [pitchWidth, pitchHeight, goalWidth] = matchDetails.pitchSize;
  const halfMWidth = pitchWidth / 2;
  const leftPost = halfMWidth - goalWidth / 2;
  const rightPost = halfMWidth + goalWidth / 2;
  const [bXPOS, bYPOS] = ballIntended;
  const kickOffTeamSide =
    kickOffTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

  const isKOT = String(kickteamID) === String(KOTid);
  if (bXPOS < 0) {
    return isKOT
      ? setLeftSecondTeamThrowIn(matchDetails, ballIntended)
      : setLeftKickOffTeamThrowIn(matchDetails, ballIntended);
  }
  if (bXPOS > pitchWidth) {
    return isKOT
      ? setRightSecondTeamThrowIn(matchDetails, ballIntended)
      : setRightKickOffTeamThrowIn(matchDetails, ballIntended);
  }

  if (bYPOS < 0) {
    if (common.isBetween(bXPOS, leftPost, rightPost)) {
      return kickOffTeamSide === 'top'
        ? setSecondTeamGoalScored(matchDetails)
        : setKickOffTeamGoalScored(matchDetails);
    } else {
      if (bXPOS < halfMWidth && isKOT) {
        return kickOffTeamSide === 'top'
          ? setTopLeftCornerPositions(matchDetails)
          : setTopGoalKick(matchDetails);
      }
      if (bXPOS > halfMWidth && isKOT) {
        return kickOffTeamSide === 'top'
          ? setTopRightCornerPositions(matchDetails)
          : setTopGoalKick(matchDetails);
      }
      if (bXPOS < halfMWidth && !isKOT) {
        return kickOffTeamSide === 'top'
          ? setTopGoalKick(matchDetails)
          : setTopLeftCornerPositions(matchDetails);
      }
      return kickOffTeamSide === 'top'
        ? setTopGoalKick(matchDetails)
        : setTopRightCornerPositions(matchDetails);
    }
  }

  if (bYPOS > pitchHeight) {
    if (common.isBetween(bXPOS, leftPost, rightPost)) {
      return kickOffTeamSide === 'top'
        ? setKickOffTeamGoalScored(matchDetails)
        : setSecondTeamGoalScored(matchDetails);
    } else {
      if (bXPOS < halfMWidth && isKOT) {
        return kickOffTeamSide === 'top'
          ? setBottomGoalKick(matchDetails)
          : setBottomLeftCornerPositions(matchDetails);
      }
      if (bXPOS > halfMWidth && isKOT) {
        return kickOffTeamSide === 'top'
          ? setBottomGoalKick(matchDetails)
          : setBottomRightCornerPositions(matchDetails);
      }
      if (bXPOS < halfMWidth && !isKOT) {
        return kickOffTeamSide === 'top'
          ? setBottomLeftCornerPositions(matchDetails)
          : setBottomGoalKick(matchDetails);
      }
      return kickOffTeamSide === 'top'
        ? setBottomRightCornerPositions(matchDetails)
        : setBottomGoalKick(matchDetails);
    }
  }
  matchDetails.ballIntended = ballIntended;
  return matchDetails;
}

function setPlayerPositions(
  matchDetails: MatchDetails,
  team: Team,
  extra: number,
): void {
  for (const thisPlayer of team.players) {
    if (thisPlayer.position === `GK`)
      thisPlayer.currentPOS = [...thisPlayer.originPOS];
    else {
      thisPlayer.currentPOS = [...thisPlayer.originPOS];
      const playerPos = thisPlayer.currentPOS[1] + extra;
      if (common.isBetween(playerPos, -1, matchDetails.pitchSize[1] + 1))
        thisPlayer.currentPOS[1] = playerPos;
      thisPlayer.intentPOS = [thisPlayer.originPOS[0], playerPos];
    }
  }
}

function formationCheck(
  origin: [number, number],
  current: [number, number],
): number[] {
  const xPos = origin[0] - current[0];
  const yPos = origin[1] - current[1];
  return [xPos, yPos];
}

function switchSide(matchDetails: MatchDetails, team: Team): MatchDetails {
  for (const thisPlayer of team.players) {
    if (!thisPlayer.originPOS)
      throw new Error(`Each player must have an origin position set`);
    thisPlayer.originPOS[1] =
      matchDetails.pitchSize[1] - thisPlayer.originPOS[1];
    thisPlayer.currentPOS = [...thisPlayer.originPOS];
    thisPlayer.intentPOS = [...thisPlayer.originPOS];
    thisPlayer.fitness =
      thisPlayer.fitness < 51 ? common.round(thisPlayer.fitness + 50, 2) : 100;
  }
  return matchDetails;
}

function setIntentPosition(
  matchDetails: MatchDetails,
  closestPlayer: Player,
): void {
  const { ball, kickOffTeam, secondTeam } = matchDetails;
  const kickOffTeamCheck = kickOffTeam.players.find(
    (thisPlayer: Player) => thisPlayer.playerID === ball.Player,
  );
  const secondTeamCheck = secondTeam.players.find(
    (thisPlayer: Player) => thisPlayer.playerID === ball.Player,
  );
  const kickTeam = kickOffTeamCheck
    ? kickOffTeam
    : secondTeamCheck
      ? secondTeam
      : null;
  const defendingTeam =
    kickTeam === null
      ? null
      : kickTeam.teamID === kickOffTeam.teamID
        ? secondTeam
        : kickOffTeam;

  if (defendingTeam)
    setDefenceRelativePos(matchDetails, defendingTeam, closestPlayer);
  if (kickTeam) setAttackRelativePos(matchDetails, kickTeam);
  if (!kickTeam && !defendingTeam) {
    setLooseintentPOS(matchDetails, kickOffTeam, closestPlayer);
    setLooseintentPOS(matchDetails, secondTeam, closestPlayer);
  }
}

function setLooseintentPOS(
  matchDetails: MatchDetails,
  thisTeam: Team,
  closestPlayer: Player,
): void {
  const [, pitchHeight] = matchDetails.pitchSize;
  const { ball } = matchDetails;
  const side =
    thisTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';
  for (const player of thisTeam.players) {
    const x = player.currentPOS[0];
    if (x === 'NP') {
      throw new Error('No player position!');
    }
    const diffXPOSplayerandball = ball.position[0] - x;
    const diffYPOSplayerandball = ball.position[1] - player.currentPOS[1];
    if (player.playerID === closestPlayer.playerID)
      player.intentPOS = [ball.position[0], ball.position[1]];
    else if (
      common.isBetween(diffXPOSplayerandball, -16, 16) &&
      common.isBetween(diffYPOSplayerandball, -16, 16)
    ) {
      player.intentPOS = [ball.position[0], ball.position[1]];
    } else {
      const southwards = ['south', 'southwest', 'southeast'].includes(
        ball.direction,
      );
      const northwards = ['north', 'northwest', 'northeast'].includes(
        ball.direction,
      );
      let newYPOS;
      if (side === 'top' && northwards) newYPOS = player.originPOS[1];
      else if (side === 'top' && southwards)
        newYPOS = setNewRelativeTopYPOS(pitchHeight, player, 20);
      else if (side === 'bottom' && northwards)
        newYPOS = setNewRelativeBottomYPOS(pitchHeight, player, -20);
      else if (side === 'bottom' && southwards) {
        if (common.isBetween(diffYPOSplayerandball, -100, 100))
          newYPOS = player.originPOS[1];
        else
          newYPOS = moveTowardsBall(player, pitchHeight, diffYPOSplayerandball);
      } else if (ball.direction === 'wait') {
        newYPOS = moveTowardsBall(player, pitchHeight, diffYPOSplayerandball);
      }
      if (newYPOS === undefined) newYPOS = player.originPOS[1];
      player.intentPOS = [player.originPOS[0], newYPOS];
    }
  }
}

function moveTowardsBall(
  player: Player,
  pitchHeight: number,
  diffYPOSplayerandball: number,
): number | undefined {
  const side = player.originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';
  if (side === 'top' && diffYPOSplayerandball > 0)
    return setNewRelativeTopYPOS(pitchHeight, player, 20);
  if (side === 'top' && diffYPOSplayerandball < 0)
    return setNewRelativeTopYPOS(pitchHeight, player, -20);
  if (side === 'bottom' && diffYPOSplayerandball > 0)
    return setNewRelativeBottomYPOS(pitchHeight, player, 20);
  if (side === 'bottom' && diffYPOSplayerandball < 0)
    return setNewRelativeBottomYPOS(pitchHeight, player, -20);
  return undefined;
}

function setDefenceRelativePos(
  matchDetails: MatchDetails,
  defendingTeam: Team,
  closestPlayer: Player,
): void {
  const [, pitchHeight] = matchDetails.pitchSize;
  const { ball } = matchDetails;
  const side =
    defendingTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';
  for (const player of defendingTeam.players) {
    const x = player.currentPOS[0];
    if (x === 'NP') {
      throw new Error('No player position!');
    }
    const diffXPOSplayerandball = ball.position[0] - x;
    const diffYPOSplayerandball = ball.position[1] - player.currentPOS[1];
    if (
      common.isBetween(diffXPOSplayerandball, -40, 40) &&
      common.isBetween(diffYPOSplayerandball, -40, 40)
    ) {
      player.intentPOS = [ball.position[0], ball.position[1]];
    } else {
      let ballOnOppositeSide = false;
      if (side === 'top' && ball.position[1] > pitchHeight / 2)
        ballOnOppositeSide = true;
      if (side === 'bottom' && ball.position[1] < pitchHeight / 2)
        ballOnOppositeSide = true;
      if (player.playerID === closestPlayer.playerID) {
        player.intentPOS = [ball.position[0], ball.position[1]];
      } else if (ballOnOppositeSide) {
        let newYPOS;
        if (side === 'top')
          newYPOS = setNewRelativeTopYPOS(pitchHeight, player, 20);
        if (side === 'bottom')
          newYPOS = setNewRelativeBottomYPOS(pitchHeight, player, -20);
        player.intentPOS = [
          player.originPOS[0],
          newYPOS ?? player.originPOS[1],
        ];
      } else {
        player.intentPOS = [...player.originPOS];
      }
    }
  }
}

function setAttackRelativePos(
  matchDetails: MatchDetails,
  kickingTeam: Team,
): void {
  const [, pitchHeight] = matchDetails.pitchSize;
  const side =
    kickingTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';
  for (const player of kickingTeam.players) {
    let newYPOS;
    if (side === 'top')
      newYPOS = setNewRelativeTopYPOS(pitchHeight, player, 20);
    if (side === 'bottom')
      newYPOS = setNewRelativeBottomYPOS(pitchHeight, player, -20);
    player.intentPOS = [player.originPOS[0], newYPOS ?? player.originPOS[1]];
  }
}

function setNewRelativeTopYPOS(
  pitchHeight: number,
  player: Player,
  diff: number,
): number {
  const { position } = player;
  if (position === 'GK')
    return common.upToMax(
      player.currentPOS[1] + diff,
      Math.floor(pitchHeight * 0.15),
    );
  if (position === 'CB')
    return common.upToMax(
      player.currentPOS[1] + diff,
      Math.floor(pitchHeight * 0.25),
    );
  if (['LB', 'RB'].includes(position))
    return common.upToMax(
      player.currentPOS[1] + diff,
      Math.floor(pitchHeight * 0.66),
    );
  if (position === 'CM')
    return common.upToMax(
      player.currentPOS[1] + diff,
      Math.floor(pitchHeight * 0.75),
    );
  return common.upToMax(player.currentPOS[1] + diff, pitchHeight);
}

function setNewRelativeBottomYPOS(
  pitchHeight: number,
  player: Player,
  diff: number,
): number {
  const { position } = player;
  if (position === 'GK')
    return common.upToMin(
      player.currentPOS[1] + diff,
      Math.floor(pitchHeight * 0.85),
    );
  if (position === 'CB')
    return common.upToMin(
      player.currentPOS[1] + diff,
      Math.floor(pitchHeight * 0.75),
    );
  if (['LB', 'RB'].includes(position))
    return common.upToMin(
      player.currentPOS[1] + diff,
      Math.floor(pitchHeight * 0.33),
    );
  if (position === 'CM')
    return common.upToMin(
      player.currentPOS[1] + diff,
      Math.floor(pitchHeight * 0.25),
    );
  return common.upToMin(player.currentPOS[1] + diff, 0);
}

export default {
  setGoalieHasBall,
  setTopRightCornerPositions,
  setTopLeftCornerPositions,
  setBottomLeftCornerPositions,
  setBottomRightCornerPositions,
  setPlayerPositions,
  keepInBoundaries,
  setTopGoalKick,
  setBottomGoalKick,
  closestPlayerToPosition,
  setSetpieceKickOffTeam,
  setSetpieceSecondTeam,
  setTopPenalty,
  setBottomPenalty,
  setKickOffTeamGoalScored,
  setSecondTeamGoalScored,
  setBallSpecificGoalScoreValue,
  formationCheck,
  switchSide,
  setIntentPosition,
  setLeftKickOffTeamThrowIn,
  setLeftSecondTeamThrowIn,
  setRightKickOffTeamThrowIn,
  setRightSecondTeamThrowIn,
};
