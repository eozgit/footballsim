//example implementation application
const engine = require('./../engine');
const fs = require('fs');

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
    throw new Error(error);
  }
}

async function initGame(t1, t2, p) {
  try {
    const team1 = await readFile(t1);
    const team2 = await readFile(t2);
    const pitch = await readFile(p);
    const matchSetup = engine.initiateGame(team1, team2, pitch);
    return matchSetup;
  } catch (error) {
    throw new Error(error);
  }
}

async function playIteration(inputIteration) {
  try {
    const outputIteration = await engine.playIteration(inputIteration);
    return outputIteration;
  } catch (error) {
    throw new Error(error);
  }
}

async function setupSecondHalf(inputIteration) {
  try {
    const outputJSON = await engine.startSecondHalf(inputIteration);
    return outputJSON;
  } catch (error) {
    throw new Error(error);
  }
}

function readFile(filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        data = JSON.parse(data);
        resolve(data);
      }
    });
  });
}
