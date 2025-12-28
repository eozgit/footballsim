import { readFile } from '../../lib/fileReader.js';
import engine from '../../engine.js';
import validate from '../../lib/validate.js';

async function initGame(t1, t2, p) {
  const team1 = await readFile(t1);
  const team2 = await readFile(t2);
  const pitch = await readFile(p);
  const matchSetup = engine.initiateGame(team1, team2, pitch);
  return matchSetup;
}

async function playIteration(inputIteration) {
  const inputJson = await readFile(inputIteration);
  const outputIteration = await engine.playIteration(inputJson);
  return outputIteration;
}

async function setupSecondHalf(inputIteration) {
  const inputJson = await readFile(inputIteration);
  const outputJSON = await engine.startSecondHalf(inputJson);
  return outputJSON;
}

function validateArguments(a, b, c) {
  return validate.validateArguments(a, b, c);
}

function validateTeam(team) {
  validate.validateTeam(team);
}

function validateTeamSecondHalf(team) {
  validate.validateTeamSecondHalf(team);
}

export default {
  initGame,
  playIteration,
  setupSecondHalf,
  validateArguments,
  validateTeam,
  validateTeamSecondHalf,
};
