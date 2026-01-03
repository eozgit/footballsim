import { MatchDetails } from '../../lib/types.js';
import * as common from '../../lib/common.js';
import * as setPos from '../../lib/setPositions.js';

import { readMatchDetails } from './utils.js';

async function setupTopPenalty(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setTopPenalty(matchDetails);
}

async function setupBottomPenalty(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setBottomPenalty(matchDetails);
}

async function setupTopLeftCorner(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setTopLeftCornerPositions(matchDetails);
}

async function setupTopRightCorner(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setTopRightCornerPositions(matchDetails);
}

async function setupBottomLeftCorner(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setBottomLeftCornerPositions(matchDetails);
}

async function setupBottomRightCorner(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  return setPos.setBottomRightCornerPositions(matchDetails);
}

async function keepInBoundaries(
  iterationFile: unknown,
  kickersSide: unknown,
  ballIntended: unknown,
): Promise<MatchDetails> {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.keepInBoundaries(matchDetails, kickersSide, ballIntended);
  return matchDetails;
}

async function removeBallFromAllPlayers(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  common.removeBallFromAllPlayers(matchDetails);
  return matchDetails;
}

async function setSetpieceKickOffTeam(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setSetpieceKickOffTeam(matchDetails);
  return matchDetails;
}

async function setSetpieceSecondTeam(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setSetpieceSecondTeam(matchDetails);
  return matchDetails;
}

async function setTopGoalKick(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setTopGoalKick(matchDetails);
  return matchDetails;
}

async function setBottomGoalKick(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setBottomGoalKick(matchDetails);
  return matchDetails;
}

async function switchSide(matchDetails: unknown, team: unknown) {
  return setPos.switchSide(matchDetails, team);
}

async function setKickOffTeamGoalScored(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setKickOffTeamGoalScored(matchDetails);
  return matchDetails;
}

async function setSecondTeamGoalScored(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setSecondTeamGoalScored(matchDetails);
  return matchDetails;
}

async function setLeftKickOffTeamThrowIn(
  iterationFile: unknown,
  ballIntended: unknown,
) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setLeftKickOffTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setLeftSecondTeamThrowIn(
  iterationFile: unknown,
  ballIntended: unknown,
) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setLeftSecondTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setRightKickOffTeamThrowIn(
  iterationFile: unknown,
  ballIntended: unknown,
) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setRightKickOffTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setRightSecondTeamThrowIn(
  iterationFile: unknown,
  ballIntended: unknown,
) {
  const matchDetails = await readMatchDetails(iterationFile);
  setPos.setRightSecondTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function inTopPenalty(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  return common.inTopPenalty(matchDetails, matchDetails.ball.position);
}

async function inBottomPenalty(iterationFile: unknown) {
  const matchDetails = await readMatchDetails(iterationFile);
  return common.inBottomPenalty(matchDetails, matchDetails.ball.position);
}

async function goalieHasBall(iterationFile: unknown) {
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
