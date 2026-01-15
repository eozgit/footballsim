//example implementation application
import { readFile } from 'fs';

import * as common from '../lib/common.js';
import type { MatchDetails, PitchDetails, Team } from '../lib/types.js';

import { initiateGame, playIteration, startSecondHalf } from './../engine.js';

let nextIteration;

async function init(): Promise<void> {
  await gameOfTenIterations();
}

async function gameOfTenIterations(): Promise<MatchDetails> {
  const t1location = './team1.json';

  const t2location = './team2.json';

  const plocation = './pitch.json';

  const initJSON = await initGame(t1location, t2location, plocation);

  nextIteration = invokePlayIteration(initJSON);
  nextIteration = invokePlayIteration(nextIteration);
  nextIteration = invokePlayIteration(nextIteration);
  nextIteration = invokePlayIteration(nextIteration);
  nextIteration = invokePlayIteration(nextIteration);
  const halftimeIteration = setupSecondHalf(nextIteration);

  nextIteration = invokePlayIteration(halftimeIteration);
  nextIteration = invokePlayIteration(nextIteration);
  nextIteration = invokePlayIteration(nextIteration);
  nextIteration = invokePlayIteration(nextIteration);
  nextIteration = invokePlayIteration(nextIteration);

  return nextIteration;
}

async function initGame(
  t1: string,
  t2: string,
  p: string,
): Promise<MatchDetails> {
  const team1 = (await readDataFile(t1)) as Team;

  const team2 = (await readDataFile(t2)) as Team;

  const pitch = (await readDataFile(p)) as PitchDetails;

  const matchDetails = initiateGame(team1, team2, pitch);

  const numericSeed = parseInt(String(matchDetails.matchID).slice(-9), 10);

  common.setMatchSeed(numericSeed);

  return matchDetails;
}

function invokePlayIteration(
  inputIteration: MatchDetails,
): MatchDetails {
  return playIteration(inputIteration);
}

function setupSecondHalf(
  inputIteration: MatchDetails,
): MatchDetails {
  return startSecondHalf(inputIteration);
}

function readDataFile(filePath: string): Promise<unknown> {
  return new Promise(function (resolve, reject) {
    readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        data = JSON.parse(data);
        resolve(data);
      }
    });
  });
}

export { init };
