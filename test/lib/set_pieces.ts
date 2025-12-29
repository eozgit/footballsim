import { readFile } from '../../lib/fileReader.js';
import common from '../../lib/common.js';
import setPos from '../../lib/setPositions.js';

async function setupTopPenalty(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setTopPenalty(matchDetails);
}

async function setupBottomPenalty(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setBottomPenalty(matchDetails);
}

async function setupTopLeftCorner(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setTopLeftCornerPositions(matchDetails);
}

async function setupTopRightCorner(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setTopRightCornerPositions(matchDetails);
}

async function setupBottomLeftCorner(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setBottomLeftCornerPositions(matchDetails);
}

async function setupBottomRightCorner(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setBottomRightCornerPositions(matchDetails);
}

async function keepInBoundaries(
  iterationFile: any,
  kickersSide: any,
  ballIntended: any,
) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.keepInBoundaries(matchDetails, kickersSide, ballIntended);
  return matchDetails;
}

async function removeBallFromAllPlayers(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  common.removeBallFromAllPlayers(matchDetails);
  return matchDetails;
}

async function setSetpieceKickOffTeam(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setSetpieceKickOffTeam(matchDetails);
  return matchDetails;
}

async function setSetpieceSecondTeam(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setSetpieceSecondTeam(matchDetails);
  return matchDetails;
}

async function setTopGoalKick(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setTopGoalKick(matchDetails);
  return matchDetails;
}

async function setBottomGoalKick(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setBottomGoalKick(matchDetails);
  return matchDetails;
}

async function switchSide(matchDetails: any, team: any) {
  return setPos.switchSide(matchDetails, team);
}

async function setKickOffTeamGoalScored(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setKickOffTeamGoalScored(matchDetails);
  return matchDetails;
}

async function setSecondTeamGoalScored(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setSecondTeamGoalScored(matchDetails);
  return matchDetails;
}

async function setLeftKickOffTeamThrowIn(
  iterationFile: any,
  ballIntended: any,
) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setLeftKickOffTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setLeftSecondTeamThrowIn(iterationFile: any, ballIntended: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setLeftSecondTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setRightKickOffTeamThrowIn(
  iterationFile: any,
  ballIntended: any,
) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setRightKickOffTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setRightSecondTeamThrowIn(
  iterationFile: any,
  ballIntended: any,
) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setRightSecondTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function inTopPenalty(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  return common.inTopPenalty(matchDetails, matchDetails.ball.position);
}

async function inBottomPenalty(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  return common.inBottomPenalty(matchDetails, matchDetails.ball.position);
}

async function goalieHasBall(iterationFile: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setGoalieHasBall(
    matchDetails,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
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
