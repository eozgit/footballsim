import type { MatchDetails, Team } from '#/engine.js';
import * as common from '#/lib/common.js';

export function setTopRightCornerPositions(matchDetails: MatchDetails): MatchDetails {
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

export function setTopLeftCornerPositions(matchDetails: MatchDetails): MatchDetails {
  const { attack, defence } = assignTeamsAndResetPositions(matchDetails);

  common.setPlayerXY(attack.players[1], 0, 0);
  common.setPlayerXY(attack.players[4], 10, 20);
  common.setPlayerXY(defence.players[1], 12, 10);
  matchDetails.ball.position = [0, 0, 0];
  setBallSpecificCornerValue(matchDetails, attack);
  matchDetails.endIteration = true;

  return matchDetails;
}

export function setBottomLeftCornerPositions(matchDetails: MatchDetails): MatchDetails {
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

export function setBottomRightCornerPositions(matchDetails: MatchDetails): MatchDetails {
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
