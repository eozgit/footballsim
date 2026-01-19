import * as common from '../../lib/common.js';
import * as penalties from '../../lib/position/set-pieces/penalties.js';
import * as setPos from '../../lib/setPositions.js';
import type { BallPosition, MatchDetails, Team } from '../../lib/types.js';

import { readMatchDetails } from './utils.js';

import * as goal from '@/lib/event/goal.js';
import {
  setTopLeftCornerPositions,
  setTopRightCornerPositions,
  setBottomLeftCornerPositions,
  setBottomRightCornerPositions,
} from '@/lib/position/set-pieces/corners.js';

async function setupTopPenalty(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  return penalties.setTopPenalty(matchDetails);
}

async function setupBottomPenalty(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  return penalties.setBottomPenalty(matchDetails);
}

async function setupTopLeftCorner(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  return setTopLeftCornerPositions(matchDetails);
}

async function setupTopRightCorner(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  return setTopRightCornerPositions(matchDetails);
}

async function setupBottomLeftCorner(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  return setBottomLeftCornerPositions(matchDetails);
}

async function setupBottomRightCorner(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  return setBottomRightCornerPositions(matchDetails);
}

async function keepInBoundaries(
  iterationFile: string,
  kickersSide: string | number,
  ballIntended: BallPosition,
): Promise<MatchDetails> {
  const matchDetails = await readMatchDetails(iterationFile);

  setPos.keepInBoundaries(matchDetails, kickersSide, ballIntended);

  return matchDetails;
}

async function removeBallFromAllPlayers(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  common.removeBallFromAllPlayers(matchDetails);

  return matchDetails;
}

async function setSetpieceKickOffTeam(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  penalties.setSetpieceKickOffTeam(matchDetails);

  return matchDetails;
}

async function setSetpieceSecondTeam(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  penalties.setSetpieceSecondTeam(matchDetails);

  return matchDetails;
}

async function setTopGoalKick(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  setPos.setTopGoalKick(matchDetails);

  return matchDetails;
}

async function setBottomGoalKick(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  setPos.setBottomGoalKick(matchDetails);

  return matchDetails;
}

async function switchSide(matchDetails: MatchDetails, team: Team) {
  return setPos.switchSide(matchDetails, team);
}

async function setKickOffTeamGoalScored(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  goal.setKickOffTeamGoalScored(matchDetails);

  return matchDetails;
}

async function setSecondTeamGoalScored(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  goal.setSecondTeamGoalScored(matchDetails);

  return matchDetails;
}

async function setLeftKickOffTeamThrowIn(iterationFile: string, ballIntended: BallPosition) {
  const matchDetails = await readMatchDetails(iterationFile);

  setPos.setLeftKickOffTeamThrowIn(matchDetails, ballIntended);

  return matchDetails;
}

async function setLeftSecondTeamThrowIn(iterationFile: string, ballIntended: BallPosition) {
  const matchDetails = await readMatchDetails(iterationFile);

  setPos.setLeftSecondTeamThrowIn(matchDetails, ballIntended);

  return matchDetails;
}

async function setRightKickOffTeamThrowIn(iterationFile: string, ballIntended: BallPosition) {
  const matchDetails = await readMatchDetails(iterationFile);

  setPos.setRightKickOffTeamThrowIn(matchDetails, ballIntended);

  return matchDetails;
}

async function setRightSecondTeamThrowIn(iterationFile: string, ballIntended: BallPosition) {
  const matchDetails = await readMatchDetails(iterationFile);

  setPos.setRightSecondTeamThrowIn(matchDetails, ballIntended);

  return matchDetails;
}

async function inTopPenalty(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  return common.inTopPenalty(matchDetails, matchDetails.ball.position);
}

async function inBottomPenalty(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  return common.inBottomPenalty(matchDetails, matchDetails.ball.position);
}

async function goalieHasBall(iterationFile: string) {
  const matchDetails = await readMatchDetails(iterationFile);

  return setPos.setGoalieHasBall(matchDetails, matchDetails.kickOffTeam.players[0]);
}

export default {
  setupTopPenalty,
  setupBottomPenalty,
  setupTopLeftCorner,
  setupTopRightCorner,
  setupBottomLeftCorner,
  setupBottomRightCorner,
  keepInBoundaries,
  removeBallFromAllPlayers,
  setSetpieceKickOffTeam,
  setSetpieceSecondTeam,
  setTopGoalKick,
  setBottomGoalKick,
  switchSide,
  setKickOffTeamGoalScored,
  setSecondTeamGoalScored,
  setLeftKickOffTeamThrowIn,
  setLeftSecondTeamThrowIn,
  setRightKickOffTeamThrowIn,
  setRightSecondTeamThrowIn,
  inTopPenalty,
  inBottomPenalty,
  goalieHasBall,
};
