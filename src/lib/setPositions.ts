import { createPlayer } from './ballMovement.js';
import { resolveBallLocation } from './boundaryHandler.js';
import * as common from './common.js';
import * as setBottomFreekicks from './setBottomFreekicks.js';
import { executeDeepSetPieceSetup } from './setPieces.js';
import * as setTopFreekicks from './setTopFreekicks.js';
import * as setVariables from './setVariables.js';
import type {
  Ball,
  BallPosition,
  MatchDetails,
  Player,
  PlayerProximityDetails,
  Team,
} from './types.js';

function setTopRightCornerPositions(matchDetails: MatchDetails): MatchDetails {
  const { attack, defence } = assignTeamsAndResetPositions(matchDetails);

  const [pitchWidth] = matchDetails.pitchSize;

  common.setPlayerXY(attack.players[1], pitchWidth, 0);
  common.setPlayerXY(attack.players[4], pitchWidth - 10, 20);
  common.setPlayerXY(defence.players[4], pitchWidth - 12, 10);
  matchDetails.ball.position = [pitchWidth, 0, 0];
  setBallSpecificCornerValue(matchDetails, attack);
  matchDetails.endIteration = true;

  return matchDetails;
}

function assignTeamsAndResetPositions(matchDetails: MatchDetails): { attack: Team; defence: Team } {
  common.removeBallFromAllPlayers(matchDetails);
  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];

  const halfPitchSize = matchDetails.pitchSize[1] / 2;

  const attack =
    kickOffTeamKeepYPos > halfPitchSize ? matchDetails.kickOffTeam : matchDetails.secondTeam;

  const defence =
    kickOffTeamKeepYPos > halfPitchSize ? matchDetails.secondTeam : matchDetails.kickOffTeam;

  for (const playerNum of [0, 1, 2, 3, 4]) {
    common.setPlayerPos(attack.players[playerNum], [...attack.players[playerNum].originPOS]);
    common.setPlayerPos(defence.players[playerNum], [...defence.players[playerNum].originPOS]);
  }

  for (const playerNum of [5, 6, 7, 8, 9, 10]) {
    common.setPlayerPos(
      attack.players[playerNum],
      common.getRandomTopPenaltyPosition(matchDetails),
    );
    common.setPlayerPos(
      defence.players[playerNum],
      common.getRandomTopPenaltyPosition(matchDetails),
    );
  }

  return { attack, defence };
}

function setTopLeftCornerPositions(matchDetails: MatchDetails): MatchDetails {
  const { attack, defence } = assignTeamsAndResetPositions(matchDetails);

  common.setPlayerXY(attack.players[1], 0, 0);
  common.setPlayerXY(attack.players[4], 10, 20);
  common.setPlayerXY(defence.players[1], 12, 10);
  matchDetails.ball.position = [0, 0, 0];
  setBallSpecificCornerValue(matchDetails, attack);
  matchDetails.endIteration = true;

  return matchDetails;
}

function setBottomLeftCornerPositions(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const [, pitchHeight] = matchDetails.pitchSize;

  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];

  const halfPitchSize = matchDetails.pitchSize[1] / 2;

  const attack =
    kickOffTeamKeepYPos < halfPitchSize ? matchDetails.kickOffTeam : matchDetails.secondTeam;

  const defence =
    kickOffTeamKeepYPos < halfPitchSize ? matchDetails.secondTeam : matchDetails.kickOffTeam;

  for (const playerNum of [0, 1, 2, 3, 4]) {
    common.setPlayerPos(attack.players[playerNum], [...attack.players[playerNum].originPOS]);
    common.setPlayerPos(defence.players[playerNum], [...defence.players[playerNum].originPOS]);
  }

  for (const playerNum of [5, 6, 7, 8, 9, 10]) {
    common.setPlayerPos(
      attack.players[playerNum],
      common.getRandomBottomPenaltyPosition(matchDetails),
    );
    common.setPlayerPos(
      defence.players[playerNum],
      common.getRandomBottomPenaltyPosition(matchDetails),
    );
  }

  common.setPlayerXY(attack.players[1], 0, pitchHeight);
  common.setPlayerXY(attack.players[4], 10, pitchHeight - 20);
  common.setPlayerXY(defence.players[1], 12, pitchHeight - 10);
  matchDetails.ball.position = [0, pitchHeight, 0];
  setBallSpecificCornerValue(matchDetails, attack);
  matchDetails.endIteration = true;

  return matchDetails;
}

function setBottomRightCornerPositions(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];

  const halfPitchSize = matchDetails.pitchSize[1] / 2;

  const attack =
    kickOffTeamKeepYPos < halfPitchSize ? matchDetails.kickOffTeam : matchDetails.secondTeam;

  const defence =
    kickOffTeamKeepYPos < halfPitchSize ? matchDetails.secondTeam : matchDetails.kickOffTeam;

  for (const playerNum of [0, 1, 2, 3, 4]) {
    common.setPlayerPos(attack.players[playerNum], [...attack.players[playerNum].originPOS]);
    common.setPlayerPos(defence.players[playerNum], [...defence.players[playerNum].originPOS]);
  }

  for (const playerNum of [5, 6, 7, 8, 9, 10]) {
    common.setPlayerPos(
      attack.players[playerNum],
      common.getRandomBottomPenaltyPosition(matchDetails),
    );
    common.setPlayerPos(
      defence.players[playerNum],
      common.getRandomBottomPenaltyPosition(matchDetails),
    );
  }

  common.setPlayerXY(attack.players[1], pitchWidth, pitchHeight);
  common.setPlayerXY(attack.players[4], pitchWidth - 10, pitchHeight - 20);
  common.setPlayerXY(defence.players[4], pitchWidth - 12, pitchHeight - 10);
  matchDetails.ball.position = [pitchWidth, pitchHeight, 0];
  setBallSpecificCornerValue(matchDetails, attack);
  matchDetails.endIteration = true;

  return matchDetails;
}

function setBallSpecificCornerValue(matchDetails: MatchDetails, attack: Team): void {
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
  ballIntended: BallPosition,
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
  common.setPlayerXY(
    kickOffTeam.players[5],
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  );
  matchDetails.ball.lastTouch.playerName = kickOffTeam.players[5].name;
  matchDetails.ball.lastTouch.playerID = kickOffTeam.players[5].playerID;
  matchDetails.ball.lastTouch.teamID = kickOffTeam.teamID;
  matchDetails.endIteration = true;

  return matchDetails;
}

function setRightKickOffTeamThrowIn(
  matchDetails: MatchDetails,
  ballIntended: BallPosition,
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
  common.setPlayerXY(
    kickOffTeam.players[5],
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  );
  matchDetails.ball.lastTouch.playerName = kickOffTeam.players[5].name;
  matchDetails.ball.lastTouch.playerID = kickOffTeam.players[5].playerID;
  matchDetails.ball.lastTouch.teamID = kickOffTeam.teamID;
  matchDetails.endIteration = true;

  return matchDetails;
}

function setLeftSecondTeamThrowIn(
  matchDetails: MatchDetails,
  ballIntended: BallPosition,
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
  common.setPlayerXY(
    secondTeam.players[5],
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  );
  matchDetails.ball.lastTouch.playerName = secondTeam.players[5].name;
  matchDetails.ball.lastTouch.playerID = secondTeam.players[5].playerID;
  matchDetails.ball.lastTouch.teamID = secondTeam.teamID;
  matchDetails.endIteration = true;

  return matchDetails;
}

function setRightSecondTeamThrowIn(
  matchDetails: MatchDetails,
  ballIntended: BallPosition,
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
  common.setPlayerXY(
    secondTeam.players[5],
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  );
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

function attackLeftThrowInPlayerPosition(pitchHeight: number, attack: Team, place: number): void {
  common.setPlayerXY(attack.players[8], 15, place);
  common.setPlayerXY(attack.players[7], 10, common.upToMax(place + 10, pitchHeight));
  common.setPlayerXY(attack.players[9], 10, common.upToMin(place - 10, 0));
  attack.players[5].hasBall = true;
}

function defenceLeftThrowInPlayerPosition(pitchHeight: number, defence: Team, place: number): void {
  common.setPlayerXY(defence.players[5], 20, place);
  common.setPlayerXY(defence.players[7], 30, common.upToMax(place + 5, pitchHeight));
  common.setPlayerXY(defence.players[8], 25, common.upToMin(place - 15, 0));
  common.setPlayerXY(defence.players[9], 10, common.upToMin(place - 30, 0));
}

function attackRightThrowInPlayerPosition(
  pitchSize: [number, number, number],
  attack: Team,
  place: number,
): void {
  const [pitchWidth, pitchHeight] = pitchSize;

  common.setPlayerXY(attack.players[8], pitchWidth - 15, place);
  common.setPlayerXY(attack.players[7], pitchWidth - 10, common.upToMax(place + 10, pitchHeight));
  common.setPlayerXY(attack.players[9], pitchWidth - 10, common.upToMin(place - 10, 0));
  attack.players[5].hasBall = true;
}

function defenceRightThrowInPlayerPosition(
  pitchSize: [number, number, number],
  defence: Team,
  place: number,
): void {
  const [pitchWidth, pitchHeight] = pitchSize;

  common.setPlayerXY(defence.players[5], pitchWidth - 20, place);
  common.setPlayerXY(defence.players[7], pitchWidth - 30, common.upToMax(place + 5, pitchHeight));
  common.setPlayerXY(defence.players[8], pitchWidth - 25, common.upToMin(place - 15, 0));
  common.setPlayerXY(defence.players[9], pitchWidth - 10, common.upToMin(place - 30, 0));
}

function setBottomGoalKick(matchDetails: MatchDetails): MatchDetails {
  const { kickOffTeam, secondTeam } = matchDetails;

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const side = kickOffTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

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
    kickOffTeam.players[0].originPOS[1] < matchDetails.pitchSize[1] / 2 ? 'top' : 'bottom';

  const teamTaking = side === 'top' ? kickOffTeam : secondTeam;

  common.removeBallFromAllPlayers(matchDetails);
  setVariables.resetPlayerPositions(matchDetails);
  setPlayerPositions(matchDetails, teamTaking, 80);
  matchDetails.ball.position = [pitchWidth / 2, 20, 0];
  setBallSpecificGoalKickValue(matchDetails, teamTaking);
  matchDetails.endIteration = true;

  return matchDetails;
}

function setBallSpecificGoalKickValue(matchDetails: MatchDetails, attack: Team): void {
  const ballPos = matchDetails.ball.position;

  common.setPlayerXY(attack.players[0], ballPos[0], ballPos[1]);
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
  position: BallPosition,
): PlayerProximityDetails {
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

  const attackingTowardsTop = matchDetails.kickOffTeam.players[0].currentPOS[1] > pitchHeight / 2;

  if (
    attackingTowardsTop &&
    common.inTopPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.kickOffTeamStatistics.penalties++;
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.kickOffTeam.name}`);

    return setTopPenalty(matchDetails);
  } else if (
    attackingTowardsTop === false &&
    common.inBottomPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.kickOffTeamStatistics.penalties++;
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.kickOffTeam.name}`);

    return setBottomPenalty(matchDetails);
  } else if (attackingTowardsTop) {
    matchDetails.kickOffTeamStatistics.freekicks++;
    const [bx, by] = matchDetails.ball.position;

    matchDetails.iterationLog.push(`freekick to: ${matchDetails.kickOffTeam.name} [${bx} ${by}]`);

    return setBottomFreekicks.setBottomFreekick(matchDetails);
  }

  matchDetails.kickOffTeamStatistics.freekicks++;
  const [bx, by] = matchDetails.ball.position;

  matchDetails.iterationLog.push(`freekick to: ${matchDetails.kickOffTeam.name} [${bx} ${by}]`);

  return setTopFreekicks.setTopFreekick(matchDetails);
}

function setSetpieceSecondTeam(matchDetails: MatchDetails): MatchDetails {
  const [, pitchHeight] = matchDetails.pitchSize;

  const ballPosition = matchDetails.ball.position;

  const attackingTowardsTop = matchDetails.secondTeam.players[0].currentPOS[1] > pitchHeight / 2;

  if (
    attackingTowardsTop &&
    common.inTopPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.secondTeamStatistics.penalties++;
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.secondTeam.name}`);

    return setTopPenalty(matchDetails);
  } else if (
    attackingTowardsTop === false &&
    common.inBottomPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.secondTeamStatistics.penalties++;
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.secondTeam.name}`);

    return setBottomPenalty(matchDetails);
  } else if (attackingTowardsTop) {
    matchDetails.secondTeamStatistics.freekicks++;
    const [bx, by] = matchDetails.ball.position;

    matchDetails.iterationLog.push(`freekick to: ${matchDetails.secondTeam.name} [${bx} ${by}]`);

    return setBottomFreekicks.setBottomFreekick(matchDetails);
  }

  matchDetails.secondTeamStatistics.freekicks++;
  const [bx, by] = matchDetails.ball.position;

  matchDetails.iterationLog.push(`freekick to: ${matchDetails.secondTeam.name} [${bx} ${by}]`);

  return setTopFreekicks.setTopFreekick(matchDetails);
}

function setTopPenalty(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];

  const halfPitchSize = matchDetails.pitchSize[1] / 2;

  const attack =
    kickOffTeamKeepYPos > halfPitchSize ? matchDetails.kickOffTeam : matchDetails.secondTeam;

  const defence =
    kickOffTeamKeepYPos > halfPitchSize ? matchDetails.secondTeam : matchDetails.kickOffTeam;

  const tempArray: [number, number] = [pitchWidth / 2, pitchHeight / 6];

  const shootArray: [number, number] = [pitchWidth / 2, common.round(pitchHeight / 17.5, 0)];

  common.setPlayerPos(defence.players[0], [...defence.players[0].originPOS]);
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
    kickOffTeamKeepYPos > halfPitchSize ? matchDetails.secondTeam : matchDetails.kickOffTeam;

  const defence =
    kickOffTeamKeepYPos > halfPitchSize ? matchDetails.kickOffTeam : matchDetails.secondTeam;

  const tempArray: [number, number] = [pitchWidth / 2, pitchHeight - pitchHeight / 6];

  const shootArray: [number, number] = [
    pitchWidth / 2,
    pitchHeight - common.round(pitchHeight / 17.5, 0),
  ];

  common.setPlayerPos(defence.players[0], [...defence.players[0].originPOS]);
  setPlayerPenaltyPositions(tempArray, attack, defence);
  setBallSpecificPenaltyValue(matchDetails, shootArray, attack);
  matchDetails.ball.direction = `south`;
  attack.intent = `attack`;
  defence.intent = `defend`;
  matchDetails.endIteration = true;

  return matchDetails;
}

function setPlayerPenaltyPositions(tempArray: [number, number], attack: Team, defence: Team): void {
  let oppxpos = -10;

  let teamxpos = -9;

  for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    if (num !== 10) {
      if (attack.players[num].currentPOS[0] !== 'NP') {
        common.setPlayerXY(attack.players[num], tempArray[0] + teamxpos, tempArray[1]);
      }
    }

    if (defence.players[num].currentPOS[0] !== 'NP') {
      common.setPlayerXY(defence.players[num], tempArray[0] + oppxpos, tempArray[1]);
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
  common.setPlayerPos(attack.players[0], [...attack.players[0].originPOS]);
  common.setPlayerPos(attack.players[10], [...shootArray]);
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
  setVariables.resetPlayerPositions(matchDetails);
  setBallSpecificGoalScoreValue(matchDetails, matchDetails.kickOffTeam);
  matchDetails.kickOffTeam.intent = `attack`;
  matchDetails.secondTeam.intent = `defend`;
  matchDetails.secondTeamStatistics.goals++;
  matchDetails.endIteration = true;

  return matchDetails;
}

function setBallSpecificGoalScoreValue(matchDetails: MatchDetails, conceedingTeam: Team): void {
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

function keepInBoundaries(
  matchDetails: MatchDetails,
  kickteamID: string | number,
  ballIntended: BallPosition,
): MatchDetails {
  return resolveBallLocation(matchDetails, kickteamID, ballIntended);
}

function setPlayerPositions(matchDetails: MatchDetails, team: Team, extra: number): void {
  for (const thisPlayer of team.players) {
    if (thisPlayer.position === `GK`) {
      common.setPlayerPos(thisPlayer, [...thisPlayer.originPOS]);
    } else {
      common.setPlayerXY(thisPlayer, thisPlayer.originPOS[0], thisPlayer.currentPOS[1]);
      common.setPlayerXY(thisPlayer, thisPlayer.currentPOS[0], thisPlayer.originPOS[1]);
      const playerPos = thisPlayer.currentPOS[1] + extra;

      if (common.isBetween(playerPos, -1, matchDetails.pitchSize[1] + 1)) {
        common.setPlayerXY(thisPlayer, thisPlayer.currentPOS[0], playerPos);
      }

      thisPlayer.intentPOS = [thisPlayer.originPOS[0], playerPos];
    }
  }
}

function formationCheck(origin: [number, number], current: [number, number]): number[] {
  const xPos = origin[0] - current[0];

  const yPos = origin[1] - current[1];

  return [xPos, yPos];
}

function setIntentPosition(matchDetails: MatchDetails, closestPlayer: Player): void {
  const { ball, kickOffTeam, secondTeam } = matchDetails;

  const kickOffTeamCheck = kickOffTeam.players.find(
    (thisPlayer: Player) => thisPlayer.playerID === ball.Player,
  );

  const secondTeamCheck = secondTeam.players.find(
    (thisPlayer: Player) => thisPlayer.playerID === ball.Player,
  );

  // 1. Extract nested ternary into a clear variable assignment
  let kickTeam: Team | undefined;

  if (kickOffTeamCheck) {
    kickTeam = kickOffTeam;
  } else if (secondTeamCheck) {
    kickTeam = secondTeam;
  } else {
    kickTeam = undefined; // satisfy unicorn/no-null
  }

  // 2. Refactor defendingTeam to avoid nested logic and null checks
  let defendingTeam: Team | undefined;

  if (!kickTeam) {
    defendingTeam = undefined;
  } else {
    // Use a simple if/else for the team ID swap logic
    defendingTeam = kickTeam.teamID === kickOffTeam.teamID ? secondTeam : kickOffTeam;
  }

  if (defendingTeam) {
    setDefenceRelativePos(matchDetails, defendingTeam, closestPlayer);
  }

  if (kickTeam) {
    setAttackRelativePos(matchDetails, kickTeam);
  }

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

  const side = thisTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

  for (const player of thisTeam.players) {
    if (player.currentPOS[0] === 'NP') {
      throw new Error('No player position!');
    }

    // Logic 1: Immediate ball proximity or ball carrier status
    if (shouldMoveDirectlyToBall(player, closestPlayer, ball)) {
      player.intentPOS = [ball.position[0], ball.position[1]];
      continue;
    }

    // Logic 2: Tactical positioning based on ball movement
    const newYPOS = calculateTacticalYPOS(player, ball, side, pitchHeight);

    player.intentPOS = [player.originPOS[0], newYPOS];
  }
}

function shouldMoveDirectlyToBall(player: Player, closest: Player, ball: Ball): boolean {
  if (player.playerID === closest.playerID) {
    return true;
  }

  const diffX = ball.position[0] - (player.currentPOS[0] as number);

  const diffY = ball.position[1] - player.currentPOS[1];

  // Checks if player is within a 16x16 unit "action zone" around the ball
  return common.isBetween(diffX, -16, 16) && common.isBetween(diffY, -16, 16);
}

function calculateTacticalYPOS(
  player: Player,
  ball: Ball,
  side: 'top' | 'bottom',
  pitchHeight: number,
): number {
  const diffY = ball.position[1] - player.currentPOS[1];

  const southwards = ['south', 'southwest', 'southeast'].includes(ball.direction);

  const northwards = ['north', 'northwest', 'northeast'].includes(ball.direction);

  // Top Team Logic
  if (side === 'top') {
    if (northwards) {
      return player.originPOS[1];
    }

    if (southwards) {
      return setNewRelativeTopYPOS(pitchHeight, player, 20);
    }
  }

  // Bottom Team Logic
  if (side === 'bottom') {
    if (northwards) {
      return setNewRelativeBottomYPOS(pitchHeight, player, -20);
    }

    if (southwards) {
      return common.isBetween(diffY, -100, 100)
        ? player.originPOS[1]
        : moveTowardsBall(player, pitchHeight, diffY);
    }
  }

  // Neutral / Wait Logic
  if (ball.direction === 'wait') {
    return moveTowardsBall(player, pitchHeight, diffY);
  }

  return player.originPOS[1];
}

function moveTowardsBall(
  player: Player,
  pitchHeight: number,
  diffYPOSplayerandball: number,
): number {
  const side = player.originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

  if (side === 'top' && diffYPOSplayerandball > 0) {
    return setNewRelativeTopYPOS(pitchHeight, player, 20);
  }

  if (side === 'top' && diffYPOSplayerandball < 0) {
    return setNewRelativeTopYPOS(pitchHeight, player, -20);
  }

  if (side === 'bottom' && diffYPOSplayerandball > 0) {
    return setNewRelativeBottomYPOS(pitchHeight, player, 20);
  }

  if (side === 'bottom' && diffYPOSplayerandball < 0) {
    return setNewRelativeBottomYPOS(pitchHeight, player, -20);
  }

  return 0;
}

/**
 * Updates defensive players' intent positions based on ball location and team side.
 * Refactored to separate proximity logic from tactical positioning.
 */
function setDefenceRelativePos(
  matchDetails: MatchDetails,
  defendingTeam: Team,
  closestPlayer: Player,
): void {
  const [, pitchHeight] = matchDetails.pitchSize;

  const { ball } = matchDetails;

  // Determine if team is defending the 'top' or 'bottom' goal
  const teamSide = defendingTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

  for (const player of defendingTeam.players) {
    if (player.currentPOS[0] === 'NP') {
      throw new Error('No player position!');
    }

    // 1. Proximity Check: If close to ball, move to ball
    if (isPlayerNearBall(player, [ball.position[0], ball.position[1]], 40)) {
      player.intentPOS = [ball.position[0], ball.position[1]];
      continue;
    }

    // 2. Closest Player: Always pursues ball
    if (player.playerID === closestPlayer.playerID) {
      player.intentPOS = [ball.position[0], ball.position[1]];
      continue;
    }

    // 3. Tactical Positioning: Return to origin or shift if ball is on opposite side
    const ballOnOppositeSide = isBallOnOppositeHalf(ball.position[1], teamSide, pitchHeight);

    if (ballOnOppositeSide) {
      player.intentPOS = calculateShiftedPosition(player, teamSide, pitchHeight);
    } else {
      player.intentPOS = [...player.originPOS];
    }
  }
}

/**
 * Checks if a player is within a specific distance (delta) of the ball.
 */
function isPlayerNearBall(player: Player, ballPos: [number, number], delta: number): boolean {
  const diffX = ballPos[0] - (player.currentPOS[0] as number);

  const diffY = ballPos[1] - player.currentPOS[1];

  return common.isBetween(diffX, -delta, delta) && common.isBetween(diffY, -delta, delta);
}

/**
 * Determines if the ball has crossed the halfway line relative to the defending team.
 */
function isBallOnOppositeHalf(ballY: number, side: 'top' | 'bottom', pitchHeight: number): boolean {
  const halfway = pitchHeight / 2;

  return (side === 'top' && ballY > halfway) || (side === 'bottom' && ballY < halfway);
}

/**
 * Calculates a tactical shift in Y-position when the ball is deep in the opponent's half.
 */
function calculateShiftedPosition(
  player: Player,
  side: 'top' | 'bottom',
  pitchHeight: number,
): [number, number] {
  let newYPOS: number | undefined;

  if (side === 'top') {
    newYPOS = setNewRelativeTopYPOS(pitchHeight, player, 20);
  } else {
    newYPOS = setNewRelativeBottomYPOS(pitchHeight, player, -20);
  }

  return [player.originPOS[0], newYPOS ?? player.originPOS[1]];
}

function setAttackRelativePos(matchDetails: MatchDetails, kickingTeam: Team): void {
  const [, pitchHeight] = matchDetails.pitchSize;

  const side = kickingTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

  for (const player of kickingTeam.players) {
    let newYPOS;

    if (side === 'top') {
      newYPOS = setNewRelativeTopYPOS(pitchHeight, player, 20);
    }

    if (side === 'bottom') {
      newYPOS = setNewRelativeBottomYPOS(pitchHeight, player, -20);
    }

    player.intentPOS = [player.originPOS[0], newYPOS ?? player.originPOS[1]];
  }
}

function setNewRelativeTopYPOS(pitchHeight: number, player: Player, diff: number): number {
  const { position } = player;

  if (position === 'GK') {
    return common.upToMax(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.15));
  }

  if (position === 'CB') {
    return common.upToMax(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.25));
  }

  if (['LB', 'RB'].includes(position)) {
    return common.upToMax(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.66));
  }

  if (position === 'CM') {
    return common.upToMax(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.75));
  }

  return common.upToMax(player.currentPOS[1] + diff, pitchHeight);
}

function setNewRelativeBottomYPOS(pitchHeight: number, player: Player, diff: number): number {
  const { position } = player;

  if (position === 'GK') {
    return common.upToMin(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.85));
  }

  if (position === 'CB') {
    return common.upToMin(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.75));
  }

  if (['LB', 'RB'].includes(position)) {
    return common.upToMin(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.33));
  }

  if (position === 'CM') {
    return common.upToMin(player.currentPOS[1] + diff, Math.floor(pitchHeight * 0.25));
  }

  return common.upToMin(player.currentPOS[1] + diff, 0);
}

function resolveGoalScored(matchDetails: MatchDetails, isTopGoal: boolean): MatchDetails {
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

function checkShotAccuracy(player: Player, pitchHeight: number, power: number): boolean {
  const [, playerY] = player.currentPOS;

  const isTopTeam = player.originPOS[1] < pitchHeight / 2; // Fixed logic for top/bottom

  const shotReachGoal = isTopTeam ? playerY + power >= pitchHeight : playerY - power <= 0;

  return shotReachGoal && player.skill.shooting > common.getRandomNumber(0, 40);
}

/**
 * Calculates the X and Y target coordinates for a penalty shot
 */

/**
 * Orchestrates team positioning for goal kicks and deep free kicks.
 * Adjusts team shape based on whether a GK or Defender is taking the kick.
 */
function repositionForDeepSetPiece(
  matchDetails: MatchDetails,
  attack: Team,
  defence: Team,
  side: 'top' | 'bottom',
): MatchDetails {
  return executeDeepSetPieceSetup(matchDetails, attack, defence, side);
}

export {
  checkShotAccuracy,
  closestPlayerToPosition,
  formationCheck,
  keepInBoundaries,
  repositionForDeepSetPiece,
  resolveGoalScored,
  setBallSpecificGoalScoreValue,
  setBottomGoalKick,
  setBottomLeftCornerPositions,
  setBottomPenalty,
  setBottomRightCornerPositions,
  setIntentPosition,
  setKickOffTeamGoalScored,
  setLeftKickOffTeamThrowIn,
  setLeftSecondTeamThrowIn,
  setRightKickOffTeamThrowIn,
  setRightSecondTeamThrowIn,
  setSecondTeamGoalScored,
  setSetpieceKickOffTeam,
  setSetpieceSecondTeam,
  setTopGoalKick,
  setTopLeftCornerPositions,
  setTopPenalty,
  setTopRightCornerPositions,
};

export { calculatePenaltyTarget } from './actions/penalty.js';

export { setGoalieHasBall } from './actions/possession.js';

export { switchSide } from './position/halftime.js';
