import { updateLastTouch } from './ballActionHandler.js';
import { checkInterceptionsOnTrajectory } from './collisions.js';
import * as common from './common.js';
import { resolveGoalScored } from './event/goal.js';
import { attemptGoalieSave } from './intentLogic.js';
import { setTargetPlyPos } from './kickLogic.js';
import { resolveBestPassOption } from './playerSelectors.js';
import { getPlayersInDistance } from './position/proximity.js';
import type { BallPosition, MatchDetails, Player, Team } from './types.js';

export type TestPlayer = Pick<Player, 'name' | 'currentPOS'>;
export type PlayerWithProximity = TestPlayer & { proximity: number };
function splitNumberIntoN(num: number, n: number): number[] {
  const arrayN = Array.from(new Array(n).keys());

  const splitNumber = [];

  for (const thisn of arrayN) {
    const nextNum = common.aTimesbDividedByC(n - thisn, num, n);

    if (nextNum === 0) {
      splitNumber.push(1);
    } else {
      splitNumber.push(common.round(nextNum, 0));
    }
  }

  return splitNumber;
}

function checkGoalScored(matchDetails: MatchDetails): void {
  const { ball, kickOffTeam, secondTeam } = matchDetails;

  const [pitchWidth, pitchHeight, goalWidth] = matchDetails.pitchSize;

  const [ballX, ballY] = ball.position;

  // 1. Position Safety Checks
  const koTeamGk = kickOffTeam.players[0];

  const sndTeamGk = secondTeam.players[0];

  if (koTeamGk.currentPOS[0] === 'NP' || sndTeamGk.currentPOS[0] === 'NP') {
    throw new Error('Goalie position missing!');
  }

  // 2. Phase 1: Goalkeeper Saves (Prevents Goal)
  if (attemptGoalieSave(matchDetails, koTeamGk, kickOffTeam.name)) {
    return;
  }

  if (attemptGoalieSave(matchDetails, sndTeamGk, secondTeam.name)) {
    return;
  }

  // 3. Phase 2: Goal Line Detection
  const centreGoal = pitchWidth / 2;

  const goalEdge = goalWidth / 2;

  const withinGoalX = common.isBetween(ballX, centreGoal - goalEdge, centreGoal + goalEdge);

  if (withinGoalX) {
    if (ballY < 1) {
      resolveGoalScored(matchDetails, true);
    } else if (ballY >= pitchHeight) {
      resolveGoalScored(matchDetails, false);
    }
  }
}

function resolveBallMovement(movementConfig: {
  player: Player;
  startPos: [number, number];
  targetPos: [number, number];
  power: number;
  team: Team;
  opp: Team;
  matchDetails: MatchDetails;
}): [number, number] {
  const {
    player,
    startPos: thisPOS,
    targetPos: newPOS,
    power,
    team,
    opp,
    matchDetails,
  } = movementConfig;

  return checkInterceptionsOnTrajectory({
    player: player,
    thisPOS: [thisPOS[0], thisPOS[1]],
    newPOS: [newPOS[0], newPOS[1]],
    power: power,
    team: team,
    opp: opp,
    matchDetails: matchDetails,
  });
}

function ballPassed(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
): [number, number] | MatchDetails {
  const { ball, pitchSize, iterationLog } = matchDetails;

  const [, pitchHeight] = pitchSize;

  // 1. Update state & identify pass target
  updateLastTouch(ball, player, team);
  const targetPlayer = getTargetPlayerCandidate(team, player, pitchSize, pitchHeight);

  const [curX, curY] = targetPlayer.currentPOS;

  if (curX === 'NP') {
    throw new Error('No position');
  }

  // 2. Determine destination (with accuracy logic)
  const destination = calculatePassDestination(player, ball.position, [curX, curY], pitchHeight);

  // 3. Finalize stats and movement
  iterationLog.push(`ball passed by: ${player.name} to: ${targetPlayer.name}`);
  player.stats.passes.total++;

  return calcBallMovementOverTime(matchDetails, player.skill.strength, destination, player);
}

/** HELPER FUNCTIONS **/

function getTargetPlayerCandidate(
  team: Team,
  player: Player,
  pitchSize: [number, number, number?],
  pitchHeight: number,
): PlayerWithProximity {
  const side = player.originPOS[1] > pitchHeight / 2 ? 'bottom' : 'top';

  const playersInDistance = getPlayersInDistance(team, player, pitchSize);

  const target = getTargetPlayer(playersInDistance, side, pitchHeight);

  if (target.currentPOS[0] === 'NP') {
    throw new Error('No position');
  }

  return target;
}

function calculatePassDestination(
  player: Player,
  ballPos: BallPosition,
  targetPos: [number, number],
  pitchHeight: number,
): [number, number] {
  // If pass is successful, return target position directly
  if (player.skill.passing > common.getRandomNumber(0, 100)) {
    return targetPos;
  }

  // Otherwise, apply error based on pitch zone
  const errorRange = getPassErrorRange(ballPos[1], player.originPOS[1], pitchHeight);

  return setTargetPlyPos({
    tplyr: targetPos,
    lowX: -errorRange,
    highX: errorRange,
    lowY: -errorRange,
    highY: errorRange,
  });
}

function getPassErrorRange(ballY: number, playerOriginY: number, pitchHeight: number): number {
  const isBottomThird = ballY > pitchHeight - pitchHeight / 3;

  const isMiddleThird = ballY > pitchHeight / 3 && ballY < pitchHeight - pitchHeight / 3;

  const playerSide = playerOriginY > pitchHeight / 2 ? 'bottom' : 'top';

  if (isBottomThird) {
    return playerSide === 'bottom' ? 10 : 100;
  }

  if (isMiddleThird) {
    return 50;
  }

  return playerSide === 'top' ? 10 : 100;
}

function getTargetPlayer(
  playersArray: PlayerWithProximity[],
  side: string,
  pitchHeight: number = 1050,
): PlayerWithProximity {
  return resolveBestPassOption(playersArray, side, pitchHeight);
}

function calcBallMovementOverTime(
  matchDetails: MatchDetails,
  strength: number,
  nextPosition: [number, number],
  player: Player,
): [number, number] {
  const { kickOffTeam, secondTeam } = matchDetails;

  const { position } = matchDetails.ball;

  const power: number = common.calculatePower(strength);

  const changeInX = nextPosition[0] - position[0];

  const changeInY = nextPosition[1] - position[1];

  const totalChange = Math.max(Math.abs(changeInX), Math.abs(changeInY));

  let movementIterations = common.round(totalChange / common.getRandomNumber(2, 3), 0);

  if (movementIterations < 1) {
    movementIterations = 1;
  }

  const powerArray = splitNumberIntoN(power, movementIterations);

  const xArray = splitNumberIntoN(changeInX, movementIterations);

  const yArray = splitNumberIntoN(changeInY, movementIterations);

  const ballOverIters = mergeArrays({
    arrayLength: powerArray.length,
    oldPos: [matchDetails.ball.position[0], matchDetails.ball.position[1]],
    newPos: nextPosition,
    array1: xArray,
    array2: yArray,
    array3: powerArray,
  }).map((i) => [i[0], i[1], i[2] ?? 0] as [number, number, number?]);

  matchDetails.ball.ballOverIterations = ballOverIters;
  const endPos = resolveBallMovement({
    player: player,
    startPos: position,
    targetPos: [ballOverIters[0][0], ballOverIters[0][1]],
    power: power,
    team: kickOffTeam,
    opp: secondTeam,
    matchDetails: matchDetails,
  });

  if (matchDetails.endIteration === true) {
    return [matchDetails.ball.position[0], matchDetails.ball.position[1]];
  }

  matchDetails.ball.ballOverIterations.shift();
  matchDetails.iterationLog.push(`resolving ball movement`);

  return endPos;
}

function mergeArrays(mergeConfig: {
  arrayLength: number;
  oldPos: [number, number];
  newPos: [number, number];
  array1: number[];
  array2: number[];
  array3: number[];
}): number[][] {
  const { arrayLength, oldPos, newPos, array1, array2, array3 } = mergeConfig;

  let tempPos = [oldPos[0], oldPos[1]];

  const arrayN = Array.from(new Array(arrayLength - 1).keys());

  const newArray = [];

  for (const thisn of arrayN) {
    newArray.push([tempPos[0] + array1[thisn], tempPos[1] + array2[thisn], array3[thisn]]);
    tempPos = [tempPos[0] + array1[thisn], tempPos[1] + array2[thisn]];
  }

  newArray.push([newPos[0], newPos[1], array3[array3.length - 1]]);

  return newArray;
}

export {
  ballPassed,
  calcBallMovementOverTime,
  checkGoalScored,
  getTargetPlayer,
  resolveBallMovement,
  getPlayersInDistance,
  splitNumberIntoN,
  mergeArrays,
};

export { setBallMovementMatchDetails } from './actions/ball.js';

export { getTopKickedPosition, getBottomKickedPosition } from './actions/ballTrajectory.js';
