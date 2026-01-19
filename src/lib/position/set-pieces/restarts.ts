import * as common from '#/lib/common.js';
import { setPlayerPositions } from '#/lib/setPositions.js';
import { resetPlayerPositions } from '#/lib/setVariables.js';
import type { BallPosition, MatchDetails, Team } from '#/lib/types.js';
export function setLeftKickOffTeamThrowIn(
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

export function setRightKickOffTeamThrowIn(
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

export function setLeftSecondTeamThrowIn(
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

export function setRightSecondTeamThrowIn(
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

export function setBottomGoalKick(matchDetails: MatchDetails): MatchDetails {
  const { kickOffTeam, secondTeam } = matchDetails;

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const side = kickOffTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';

  const teamTaking = side === 'bottom' ? kickOffTeam : secondTeam;

  common.removeBallFromAllPlayers(matchDetails);
  resetPlayerPositions(matchDetails);
  setPlayerPositions(matchDetails, teamTaking, -80);
  matchDetails.ball.position = [pitchWidth / 2, pitchHeight - 20, 0];
  setBallSpecificGoalKickValue(matchDetails, teamTaking);
  matchDetails.endIteration = true;

  return matchDetails;
}

export function setTopGoalKick(matchDetails: MatchDetails): MatchDetails {
  const { kickOffTeam, secondTeam } = matchDetails;

  const [pitchWidth] = matchDetails.pitchSize;

  const side =
    kickOffTeam.players[0].originPOS[1] < matchDetails.pitchSize[1] / 2 ? 'top' : 'bottom';

  const teamTaking = side === 'top' ? kickOffTeam : secondTeam;

  common.removeBallFromAllPlayers(matchDetails);
  resetPlayerPositions(matchDetails);
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
