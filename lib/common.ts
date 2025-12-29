'use strict';

//---------------
//Maths Functions
//---------------
function getRandomNumber(min: any, max: any) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round(value: any, decimals: any) {
  // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
  return Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);
}

function isBetween(num: any, low: any, high: any) {
  return num > low && num < high;
}

function upToMax(num: any, max: any) {
  if (num > max) return max;
  return num;
}

function upToMin(num: any, min: any) {
  if (num < min) return min;
  return num;
}

function getBallTrajectory(thisPOS: any, newPOS: any, power: any) {
  const xMovement = (thisPOS[0] - newPOS[0]) ** 2;
  const yMovement = (parseInt(thisPOS[1], 10) - parseInt(newPOS[1], 10)) ** 2;
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
  const movementDistance = Math.round(Math.sqrt(xMovement + yMovement), 0);

  let arraySize = Math.round(thisPOS[1] - newPOS[1]);

  if (movementDistance >= power) {
    // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
    power = parseInt(power, 10) + parseInt(movementDistance, 10);
  }
  const height = Math.sqrt(
    Math.abs((movementDistance / 2) ** 2 - (power / 2) ** 2),
  );

  if (arraySize < 1) arraySize = 1;

  const yPlaces = Array.from({ length: Math.abs(arraySize) }, (_, i) => i);

  const trajectory = [[thisPOS[0], thisPOS[1], 0]];

  const changeInX = (newPOS[0] - thisPOS[0]) / Math.abs(thisPOS[1] - newPOS[1]);
  const changeInY = (thisPOS[1] - newPOS[1]) / (newPOS[1] - thisPOS[1]);
  const changeInH = height / (yPlaces.length / 2);
  let elevation = 1;

  yPlaces.forEach(() => {
    const lastX = trajectory[trajectory.length - 1][0];
    const lastY = trajectory[trajectory.length - 1][1];
    const lastH = trajectory[trajectory.length - 1][2];
    const xPos = round(lastX + changeInX, 5);
    let yPos = 0;
    if (newPOS[1] > thisPOS[1])
      // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      yPos = parseInt(lastY, 10) - parseInt(changeInY, 10);
    // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
    else yPos = parseInt(lastY, 10) + parseInt(changeInY, 10);
    let hPos;
    if (elevation === 1) {
      hPos = round(lastH + changeInH, 5);
      if (hPos >= height) {
        elevation = 0;
        hPos = height;
      }
    } else hPos = round(lastH - changeInH, 5);
    trajectory.push([xPos, yPos, hPos]);
  });
  return trajectory;
}

function calculatePower(strength: any) {
  const hit = getRandomNumber(1, 5);
  return parseInt(strength, 10) * hit;
}

function aTimesbDividedByC(a: any, b: any, c: any) {
  return a * (b / sumFrom1toX(c));
}

function sumFrom1toX(x: any) {
  return (x * (x + 1)) / 2;
}

function inTopPenalty(matchDetails: any, item: any) {
  const [matchWidth, matchHeight] = matchDetails.pitchSize;
  const ballInPenalyBoxX = isBetween(
    item[0],
    matchWidth / 4 + 5,
    matchWidth - matchWidth / 4 - 5,
  );
  const ballInTopPenalyBoxY = isBetween(item[1], -1, matchHeight / 6 + 7);
  if (ballInPenalyBoxX && ballInTopPenalyBoxY) return true;
  return false;
}

function inBottomPenalty(matchDetails: any, item: any) {
  const [matchWidth, matchHeight] = matchDetails.pitchSize;
  const ballInPenalyBoxX = isBetween(
    item[0],
    matchWidth / 4 + 5,
    matchWidth - matchWidth / 4 - 5,
  );
  const ballInBottomPenalyBoxY = isBetween(
    item[1],
    matchHeight - matchHeight / 6 - 7,
    matchHeight + 1,
  );
  if (ballInPenalyBoxX && ballInBottomPenalyBoxY) return true;
  return false;
}

function getRandomTopPenaltyPosition(matchDetails: any) {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const boundaryX = [pitchWidth / 4 + 6, pitchWidth - pitchWidth / 4 - 6];
  const boundaryY = [0, pitchHeight / 6 + 6];
  return [
    getRandomNumber(boundaryX[0], boundaryX[1]),
    getRandomNumber(boundaryY[0], boundaryY[1]),
  ];
}

function getRandomBottomPenaltyPosition(matchDetails: any) {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const boundaryX = [pitchWidth / 4 + 6, pitchWidth - pitchWidth / 4 - 6];
  const boundaryY = [pitchHeight - pitchHeight / 6 + 6, pitchHeight];
  return [
    getRandomNumber(boundaryX[0], boundaryX[1]),
    getRandomNumber(boundaryY[0], boundaryY[1]),
  ];
}

function isEven(n: any) {
  return n % 2 === 0;
}

function isOdd(n: any) {
  return Math.abs(n % 2) === 1;
}

function removeBallFromAllPlayers(matchDetails: any) {
  for (const player of matchDetails.kickOffTeam.players) {
    player.hasBall = false;
  }
  for (const player of matchDetails.secondTeam.players) {
    player.hasBall = false;
  }
}

function debug(label: any, ...args: any[]) {
  if (process.env.DEBUG_ENGINE) {
    console.log(`[DEBUG:${label}]`, ...args);
  }
}

export {
  getRandomNumber,
  round,
  getBallTrajectory,
  isBetween,
  calculatePower,
  isEven,
  isOdd,
  sumFrom1toX,
  aTimesbDividedByC,
  upToMax,
  upToMin,
  inTopPenalty,
  inBottomPenalty,
  getRandomTopPenaltyPosition,
  getRandomBottomPenaltyPosition,
  removeBallFromAllPlayers,
  debug,
};
export default {
  getRandomNumber,
  round,
  getBallTrajectory,
  isBetween,
  calculatePower,
  isEven,
  isOdd,
  sumFrom1toX,
  aTimesbDividedByC,
  upToMax,
  upToMin,
  inTopPenalty,
  inBottomPenalty,
  getRandomTopPenaltyPosition,
  getRandomBottomPenaltyPosition,
  removeBallFromAllPlayers,
  debug,
};
