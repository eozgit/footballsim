import { readFile } from '../../lib/fileReader.js';
import common from '../../lib/common.js';
import setPos from '../../lib/setPositions.js';

async function setupTopPenalty(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setTopPenalty(matchDetails);
}

async function setupBottomPenalty(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setBottomPenalty(matchDetails);
}

async function setupTopLeftCorner(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setTopLeftCornerPositions(matchDetails);
}

async function setupTopRightCorner(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setTopRightCornerPositions(matchDetails);
}

async function setupBottomLeftCorner(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setBottomLeftCornerPositions(matchDetails);
}

async function setupBottomRightCorner(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return setPos.setBottomRightCornerPositions(matchDetails);
}

async function keepInBoundaries(iterationFile, kickersSide, ballIntended) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.keepInBoundaries(matchDetails, kickersSide, ballIntended);
  return matchDetails;
}

async function removeBallFromAllPlayers(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  common.removeBallFromAllPlayers(matchDetails);
  return matchDetails;
}

async function setSetpieceKickOffTeam(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setSetpieceKickOffTeam(matchDetails);
  return matchDetails;
}

async function setSetpieceSecondTeam(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setSetpieceSecondTeam(matchDetails);
  return matchDetails;
}

async function setTopGoalKick(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setTopGoalKick(matchDetails);
  return matchDetails;
}

async function setBottomGoalKick(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setBottomGoalKick(matchDetails);
  return matchDetails;
}

async function switchSide(matchDetails, team) {
  return setPos.switchSide(matchDetails, team);
}

async function setKickOffTeamGoalScored(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setKickOffTeamGoalScored(matchDetails);
  return matchDetails;
}

async function setSecondTeamGoalScored(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setSecondTeamGoalScored(matchDetails);
  return matchDetails;
}

async function setLeftKickOffTeamThrowIn(iterationFile, ballIntended) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setLeftKickOffTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setLeftSecondTeamThrowIn(iterationFile, ballIntended) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setLeftSecondTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setRightKickOffTeamThrowIn(iterationFile, ballIntended) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setRightKickOffTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function setRightSecondTeamThrowIn(iterationFile, ballIntended) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  setPos.setRightSecondTeamThrowIn(matchDetails, ballIntended);
  return matchDetails;
}

async function inTopPenalty(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return common.inTopPenalty(matchDetails, matchDetails.ball.position);
}

async function inBottomPenalty(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  return common.inBottomPenalty(matchDetails, matchDetails.ball.position);
}

async function goalieHasBall(iterationFile) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
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
