import { readFile } from '../../lib/fileReader.js';
import engine from '../../engine.js';
import validate from '../../lib/validate.js';
import { MatchDetails } from 'lib/types.js';
import { readMatchDetails } from './utils.js';

async function initGame(t1: any, t2: any, p: any) {
  const team1 = await readFile(t1);
  const team2 = await readFile(t2);
  const pitch = await readFile(p);
  const matchSetup = engine.initiateGame(team1, team2, pitch);
  return matchSetup;
}

async function playIteration(inputIteration: string): Promise<MatchDetails> {
  const inputMatchDetails = await readMatchDetails(inputIteration);
  return await engine.playIteration(inputMatchDetails);
}

async function setupSecondHalf(inputIteration: any) {
  const inputJson = await readFile(inputIteration);
  const outputJSON = await engine.startSecondHalf(inputJson);
  return outputJSON;
}

function validateArguments(a: any, b: any, c: any) {
  return validate.validateArguments(a, b, c);
}

function validateTeam(team: any) {
  validate.validateTeam(team);
}

function validateTeamSecondHalf(team: any) {
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
