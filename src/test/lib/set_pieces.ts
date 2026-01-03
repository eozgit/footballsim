import { MatchDetails } from '../../lib/types.js';

import common from '../../lib/common.js';
import setPos from '../../lib/setPositions.js';

import { readMatchDetails } from './utils.js';

async function setupTopPenalty(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setTopPenalty(matchDetails);
}

async function setupBottomPenalty(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setBottomPenalty(matchDetails);
}

async function setupTopLeftCorner(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setTopLeftCornerPositions(matchDetails);
}

async function setupTopRightCorner(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setTopRightCornerPositions(matchDetails);
}

async function setupBottomLeftCorner(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setBottomLeftCornerPositions(matchDetails);
}

async function setupBottomRightCorner(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setBottomRightCornerPositions(matchDetails);
}

async function keepInBoundaries(
  iterationFile: any,
  kickersSide: any,
  ballIntended: any,
): Promise<MatchDetails> {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.keepInBoundaries(matchDetails, kickersSide, ballIntended);
  return matchDetails;
}

async function removeBallFromAllPlayers(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  common.removeBallFromAllPlayers(matchDetails);
  return matchDetails;
}

async function setSetpieceKickOffTeam(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setSetpieceKickOffTeam(matchDetails);
  return matchDetails;
}

async function setSetpieceSecondTeam(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setSetpieceSecondTeam(matchDetails);
  return matchDetails;
}

async function setTopGoalKick(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setTopGoalKick(matchDetails);
  return matchDetails;
}

async function setBottomGoalKick(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setBottomGoalKick(matchDetails);
  return matchDetails;
}

async function switchSide(matchDetails: any, team: any) {
  return setPos.switchSide(matchDetails, team);
}

async function setKickOffTeamGoalScored(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setKickOffTeamGoalScored(matchDetails);
  return matchDetails;
}

async function setSecondTeamGoalScored(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setSecondTeamGoalScored(matchDetails);
  return matchDetails;
}

async function setLeftKickOffTeamThrowIn(
  iterationFile: any,
  ballIntended: any,
) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setLeftKickOffTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setLeftSecondTeamThrowIn(iterationFile: any, ballIntended: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setLeftSecondTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setRightKickOffTeamThrowIn(
  iterationFile: any,
  ballIntended: any,
) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setRightKickOffTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setRightSecondTeamThrowIn(
  iterationFile: any,
  ballIntended: any,
) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setRightSecondTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function inTopPenalty(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  return common.inTopPenalty(matchDetails, matchDetails.ball.position);
}

async function inBottomPenalty(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  return common.inBottomPenalty(matchDetails, matchDetails.ball.position);
}

async function goalieHasBall(iterationFile: any) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setGoalieHasBall(
    matchDetails,
    matchDetails.kickOffTeam.players[0],
  );
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
