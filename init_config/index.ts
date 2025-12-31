//example implementation application
import { readFile as _readFile } from 'fs';

import {
  initiateGame,
  playIteration as _playIteration,
  startSecondHalf,
} from './../engine.js';
import { MatchDetails } from 'lib/types.ts';

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

async function initGame(t1: any, t2: any, p: any) {
  try {
    const team1 = await readFile(t1);
    const team2 = await readFile(t2);
    const pitch = await readFile(p);
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

async function setupSecondHalf(inputIteration: any) {
  try {
    const outputJSON = await startSecondHalf(inputIteration);
    return outputJSON;
  } catch (error) {
    // @ts-expect-error TS(2769): No overload matches this call.
    throw new Error(error);
  }
}

function readFile(filePath: any) {
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
