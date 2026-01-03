//example implementation application
import { readFile as _readFile } from 'fs';

import { MatchDetails, PitchDetails, Team } from '../lib/types.js';

import {
  initiateGame,
  playIteration as _playIteration,
  startSecondHalf,
} from './../engine.js';

let nextIteration;
gameOfTenIterations()
  .then(function () {})
  .catch(function (error) {
    throw new Error(error);
  });

async function gameOfTenIterations() {
  try {
    const t1location = './team1.json';
    const t2location = './team2.json';
    const plocation = './pitch.json';
    const initJSON = await initGame(t1location, t2location, plocation);
    nextIteration = await playIteration(initJSON);
    nextIteration = await playIteration(nextIteration);
    nextIteration = await playIteration(nextIteration);
    nextIteration = await playIteration(nextIteration);
    nextIteration = await playIteration(nextIteration);
    const halftimeIteration = await setupSecondHalf(nextIteration);
    nextIteration = await playIteration(halftimeIteration);
    nextIteration = await playIteration(nextIteration);
    nextIteration = await playIteration(nextIteration);
    nextIteration = await playIteration(nextIteration);
    nextIteration = await playIteration(nextIteration);
    return nextIteration;
  } catch (error) {
    // @ts-expect-error TS(2769): No overload matches this call.
    throw new Error(error);
  }
}

async function initGame(t1: string, t2: string, p: string) {
  try {
    const team1 = (await readFile(t1)) as Team;
    const team2 = (await readFile(t2)) as Team;
    const pitch = (await readFile(p)) as PitchDetails;
    const matchSetup = initiateGame(team1, team2, pitch);
    return matchSetup;
  } catch (error) {
    // @ts-expect-error TS(2769): No overload matches this call.
    throw new Error(error);
  }
}

async function playIteration(
  inputIteration: MatchDetails,
): Promise<MatchDetails> {
  try {
    const outputIteration = await _playIteration(inputIteration);
    return outputIteration;
  } catch (error) {
    throw new Error(String(error));
  }
}

async function setupSecondHalf(
  inputIteration: MatchDetails,
): Promise<MatchDetails> {
  try {
    const outputJSON = await startSecondHalf(inputIteration);
    return outputJSON;
  } catch (error) {
    // @ts-expect-error TS(2769): No overload matches this call.
    throw new Error(error);
  }
}

function readFile(filePath: string) {
  return new Promise(function (resolve, reject) {
    _readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        data = JSON.parse(data);
        resolve(data);
      }
    });
  });
}
