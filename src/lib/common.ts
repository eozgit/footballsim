import { BallPosition, MatchDetails } from './types.js';

//---------------
//Maths Functions
//---------------
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round(value: number | string, decimals: number): number {
  return Number(`${Math.round(Number(`${value}e${decimals}`))}e-${decimals}`);
}

function isBetween(num: number, low: number, high: number): boolean {
  return num > low && num < high;
}

function isContextBetween(
  context: { proxPOS: number[] },
  low: number,
  high: number,
) {
  return context.proxPOS[0] > low && context.proxPOS[0] < high;
}

function upToMax(num: number, max: number): number {
  if (num > max) {
    return max;
  }
  return num;
}

function upToMin(num: number, min: number): number {
  if (num < min) {
    return min;
  }
  return num;
}

function getBallTrajectory(
  thisPOS: BallPosition,
  newPOS: BallPosition,
  power: number,
): [number, number, number][] {
  const xMovement = (thisPOS[0] - newPOS[0]) ** 2;
  const yMovement = (Math.floor(thisPOS[1]) - Math.floor(newPOS[1])) ** 2;
  const movementDistance = Math.round(Math.sqrt(xMovement + yMovement));

  let arraySize = Math.round(thisPOS[1] - newPOS[1]);

  let effectivePower = power;
  if (movementDistance >= power) {
    effectivePower = Math.floor(power) + Math.floor(movementDistance);
  }

  const height = Math.sqrt(
    Math.abs((movementDistance / 2) ** 2 - (effectivePower / 2) ** 2),
  );

  if (arraySize < 1) {
    arraySize = 1;
  }

  const yPlaces = Array.from({ length: Math.abs(arraySize) }, (_, i) => i);
  const trajectory: [number, number, number][] = [[thisPOS[0], thisPOS[1], 0]];

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

    if (newPOS[1] > thisPOS[1]) {
      yPos = Math.floor(lastY) - Math.floor(changeInY);
    } else {
      yPos = Math.floor(lastY) + Math.floor(changeInY);
    }

    let hPos;
    if (elevation === 1) {
      hPos = round(lastH + changeInH, 5);
      if (hPos >= height) {
        elevation = 0;
        hPos = height;
      }
    } else {
      hPos = round(lastH - changeInH, 5);
    }
    trajectory.push([xPos, yPos, hPos]);
  });

  return trajectory;
}

function calculatePower(strength: number | string): number {
  const hit = getRandomNumber(1, 5);
  return Math.floor(Number(strength)) * hit;
}

function aTimesbDividedByC(a: number, b: number, c: number): number {
  return a * (b / sumFrom1toX(c));
}

function sumFrom1toX(x: number): number {
  return (x * (x + 1)) / 2;
}

function inTopPenalty(matchDetails: MatchDetails, item: BallPosition): boolean {
  const [matchWidth, matchHeight] = matchDetails.pitchSize;
  const ballInPenalyBoxX = isBetween(
    item[0],
    matchWidth / 4 + 5,
    matchWidth - matchWidth / 4 - 5,
  );
  const ballInTopPenalyBoxY = isBetween(item[1], -1, matchHeight / 6 + 7);
  return ballInPenalyBoxX && ballInTopPenalyBoxY;
}

function inBottomPenalty(
  matchDetails: MatchDetails,
  item: BallPosition,
): boolean {
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
  return ballInPenalyBoxX && ballInBottomPenalyBoxY;
}

function getRandomTopPenaltyPosition(
  matchDetails: MatchDetails,
): [number, number] {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const boundaryX = [pitchWidth / 4 + 6, pitchWidth - pitchWidth / 4 - 6];
  const boundaryY = [0, pitchHeight / 6 + 6];
  return [
    getRandomNumber(boundaryX[0], boundaryX[1]),
    getRandomNumber(boundaryY[0], boundaryY[1]),
  ];
}

function getRandomBottomPenaltyPosition(
  matchDetails: MatchDetails,
): [number, number] {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const boundaryX = [pitchWidth / 4 + 6, pitchWidth - pitchWidth / 4 - 6];
  const boundaryY = [pitchHeight - pitchHeight / 6 + 6, pitchHeight];
  return [
    getRandomNumber(boundaryX[0], boundaryX[1]),
    getRandomNumber(boundaryY[0], boundaryY[1]),
  ];
}

function isEven(n: number): boolean {
  return n % 2 === 0;
}

function isOdd(n: number): boolean {
  return Math.abs(n % 2) === 1;
}

function removeBallFromAllPlayers(matchDetails: MatchDetails): void {
  for (const player of matchDetails.kickOffTeam.players) {
    player.hasBall = false;
  }
  for (const player of matchDetails.secondTeam.players) {
    player.hasBall = false;
  }
}

function debug(label: string, ...args: unknown[]): void {
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
