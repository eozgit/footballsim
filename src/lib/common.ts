import type { Ball, BallPosition, MatchDetails, Player } from './types.js';

//-------------------------
// Seedable RNG (Mulberry32)
//-------------------------

// Default to Math.random until a seed is provided
let matchRNG: () => number = Math.random;

/**
 * Initializes the match-wide random number generator with a specific seed.
 * This ensures the entire match simulation is deterministic and repeatable.
 */
function setMatchSeed(seed: number): void {
  matchRNG = function () {
    let t = (seed += 0x6d2b79f5);

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

//--------------
//Maths Functions
//--------------

function getRandomNumber(min: number, max: number): number {
  // Now uses the seedable matchRNG instead of Math.random()
  return Math.floor(matchRNG() * (max - min + 1)) + min;
}

/**
 * Rounds a number to a specified number of decimal places.
 * Satisfies sonarjs/no-nested-template-literals by using math over string templates.
 */
function round(value: number | string, decimals: number): number {
  const p = Math.pow(10, decimals);

  const n = Number(value) * p;

  const rounded = Math.round(n);

  return rounded / p;
}

function isBetween(num: number, low: number, high: number): boolean {
  return num > low && num < high;
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

/**
 * Safely updates a player's position tuple.
 * Uses Object.defineProperty to bypass runtime 'writable: false' constraints.
 */
function setPlayerXY(player: Player, x: number | 'NP', y: number): void {
  safeSet(player, 'currentPOS', [x, y]);
}

/**
 * Safely updates the ball's position.
 * Bypasses readonly constraints using Object.defineProperty to ensure
 * compatibility with frozen objects in test environments.
 */
function setBallPosition(ball: Ball, x: number, y: number, z?: number): void {
  const newPos: BallPosition = z !== undefined ? [x, y, z] : [x, y];

  safeSet(ball, 'position', newPos);
}

/**
 * Internal helper to bypass readonly constraints and avoid
 * Firefox 'redefine non-configurable' errors.
 */
function safeSet<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);

  const objUnknown = obj as unknown;

  // If the property is non-configurable, we CANNOT use defineProperty.
  // We must hope a forced assignment works, or mutate the internal reference.
  if (descriptor && descriptor.configurable === false) {
    try {
      objUnknown[key] = value;
    } catch {
      // If it's a non-configurable array, mutate its contents instead
      if (Array.isArray(objUnknown[key]) && Array.isArray(value)) {
        const target = objUnknown[key];

        value.forEach((val, i) => { target[i] = val; });
      } else {
        console.error(`Property ${String(key)} is locked (non-configurable).`);
      }
    }

    return;
  }

  // If it IS configurable, or doesn't exist yet, use the standard logic
  Object.defineProperty(obj, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

/**
 * Updates player position using an existing tuple.
 */
function setPlayerPos(
  player: Player,
  pos: readonly [number | 'NP', number],
): void {
  // We call our internal XY setter to keep the 'any' cast in one place
  setPlayerXY(player, pos[0], pos[1]);
}

function destructPos(position: readonly [number | 'NP', number]): [number, number] {
  const [x, y] = position;

  if (x === 'NP') {
    throw new Error('Not playing.');
  }

  return [x, y];
}

function debug(label: string, ...args: unknown[]): void {
  console.log(`[DEBUG:${label}]`, ...args);
}

export {
  aTimesbDividedByC,
  calculatePower,
  debug,
  getBallTrajectory,
  getRandomBottomPenaltyPosition,
  getRandomNumber,
  getRandomTopPenaltyPosition,
  inBottomPenalty,
  inTopPenalty,
  isBetween,
  isEven,
  isOdd,
  removeBallFromAllPlayers,
  round,
  setBallPosition,
  setMatchSeed,
  setPlayerPos,
  setPlayerXY,
  sumFrom1toX,
  upToMax,
  upToMin,
  destructPos,
};
