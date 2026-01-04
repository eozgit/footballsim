import { MatchDetails, PitchDetails, Team } from '../../lib/types.js';
import { readFile } from '../../lib/fileReader.js';
import { initiateGame, playIteration, startSecondHalf } from '../../engine.js';
import * as validate from '../../lib/validate.js';

import { readMatchDetails } from './utils.js';

async function initGame(t1: string, t2: string, p: string) {
  const team1 = (await readFile(t1)) as Team;
  const team2 = (await readFile(t2)) as Team;
  const pitch = (await readFile(p)) as PitchDetails;
  return initiateGame(team1, team2, pitch);
}

async function playIter(inputIteration: string): Promise<MatchDetails> {
  const inputMatchDetails = await readMatchDetails(inputIteration);
  return await playIteration(inputMatchDetails);
}

async function setupSecondHalf(inputIteration: string) {
  const inputJson = (await readFile(inputIteration)) as MatchDetails;
  return await startSecondHalf(inputJson);
}

function validateArguments(a: unknown, b: unknown, c: unknown) {
  return validate.validateArguments(a, b, c);
}

function validateTeam(team: Team) {
  validate.validateTeam(team);
}

function validateTeamSecondHalf(team: Team) {
  validate.validateTeamSecondHalf(team);
}

export default {
  initGame,
  playIter,
  setupSecondHalf,
  validateArguments,
  validateTeam,
  validateTeamSecondHalf,
};
