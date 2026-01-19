import { calculateShotTarget } from './actions/ballTrajectory.js';
import { processBallMomentum } from './ballState.js';
import { checkInterceptionsOnTrajectory, resolvePlayerBallInteraction } from './collisions.js';
import * as common from './common.js';
import { attemptGoalieSave } from './intentLogic.js';
import { executeKickAction, resolvePassDestination } from './kickLogic.js';
import { calculateDeflectionVector, updateBallCardinalDirection } from './physics.js';
import { initializePlayerObject } from './playerDefaults.js';
import { resolveBestPassOption } from './playerSelectors.js';
import { getPlayersInDistance } from './position/proximity.js';
import { executePenaltyShot } from './setPieces.js';
import * as setPositions from './setPositions.js';
import type { Ball, BallPosition, MatchDetails, Player, Team } from './types.js';

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

function moveBall(matchDetails: MatchDetails): MatchDetails {
  return processBallMomentum(matchDetails);
}

function createPlayer(position: string): Player {
  return initializePlayerObject(position);
}

function setBPlayer(ballPos: BallPosition): Player {
  const [ballX, ballY] = ballPos;

  const pos: [number, number] = [ballX, ballY];

  const player = createPlayer('LB');

  const patch: Partial<Player> = {
    name: `Ball`,
    position: `LB`,
    rating: `100`,
    skill: {
      passing: 100,
      shooting: 100,
      saving: 100,
      tackling: 100,
      agility: 100,
      strength: 100,
      penalty_taking: 100,
      jumping: 100,
    },
    originPOS: pos,
    currentPOS: pos,
    injured: false,
  };

  return { ...player, ...patch };
}

function ballKicked(matchDetails: MatchDetails, team: Team, player: Player): [number, number] {
  return executeKickAction(matchDetails, team, player);
}

function shotMade(matchDetails: MatchDetails, team: Team, player: Player): [number, number] {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Setup & Physics
  updateLastTouchAndLog(matchDetails, team, player);
  const shotPower = common.calculatePower(player.skill.strength);

  // 2. Logic Resolution
  const isOnTarget = setPositions.checkShotAccuracy(player, pitchHeight, shotPower);

  recordShotStats(matchDetails, player, isOnTarget);

  // 3. Coordinate Resolution
  const targetCoord = calculateShotTarget({
    player: player,
    onTarget: isOnTarget,
    width: pitchWidth,
    height: pitchHeight,
    power: shotPower,
  });

  // 4. Execution
  const endPos = calcBallMovementOverTime(matchDetails, player.skill.strength, targetCoord, player);

  checkGoalScored(matchDetails);

  return endPos;
}

function recordShotStats(matchDetails: MatchDetails, player: Player, isOnTarget: boolean): void {
  const { half } = matchDetails;

  if (half === 0) {
    throw new Error(`You cannot supply 0 as a half`);
  }

  const teamStats = common.isEven(half)
    ? matchDetails.kickOffTeamStatistics
    : matchDetails.secondTeamStatistics;

  // 1. Increment Total Shots
  if (typeof teamStats.shots === 'number') {
    teamStats.shots++;
  } else {
    teamStats.shots.total++;
  }

  player.stats.shots.total++;

  // 2. Increment On/Off Target
  const status = isOnTarget ? 'on' : 'off';

  if (typeof teamStats.shots !== 'number') {
    teamStats.shots[status] = (teamStats.shots[status] || 0) + 1;
  }

  if (typeof player.stats.shots !== 'number') {
    player.stats.shots[status] = (player.stats.shots[status] || 0) + 1;
  }
}

function updateLastTouchAndLog(matchDetails: MatchDetails, team: Team, player: Player): void {
  matchDetails.iterationLog.push(`Shot Made by: ${player.name}`);
  updateLastTouch(matchDetails.ball, player, team);
}

function penaltyTaken(matchDetails: MatchDetails, team: Team, player: Player): [number, number] {
  return executePenaltyShot(matchDetails, team, player);
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
      setPositions.resolveGoalScored(matchDetails, true);
    } else if (ballY >= pitchHeight) {
      setPositions.resolveGoalScored(matchDetails, false);
    }
  }
}

function throughBall(matchDetails: MatchDetails, team: Team, player: Player): [number, number] {
  return resolvePassDestination(matchDetails, team, player);
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

function thisPlayerIsInProximity(proximityConfig: {
  matchDetails: MatchDetails;
  thisPlayer: Player;
  thisPOS: [number, number];
  thisPos: [number, number];
  power: number;
  thisTeam: Team;
}): [number, number] | [number, number, number] | undefined {
  const { matchDetails, thisPlayer, thisPOS, thisPos, power, thisTeam } = proximityConfig;

  return resolvePlayerBallInteraction({
    matchDetails: matchDetails,
    thisPlayer: thisPlayer,
    thisPOS: thisPOS,
    thisPos: thisPos,
    power: power,
    thisTeam: thisTeam,
  });
}

function resolveDeflection(deflectionConfig: {
  power: number;
  startPos: [number, number];
  defPosition: [number, number];
  player: Player;
  team: Team;
  matchDetails: MatchDetails;
}): BallPosition {
  const {
    power,
    startPos: thisPOS,
    defPosition,
    player: defPlayer,
    team: defTeam,
  } = deflectionConfig;

  let { matchDetails } = deflectionConfig;

  const xMovement = (thisPOS[0] - defPosition[0]) ** 2;

  const yMovement = (thisPOS[1] - defPosition[1]) ** 2;

  const movementDistance = Math.sqrt(xMovement + yMovement);

  const newPower = power - movementDistance;

  let tempPosition: BallPosition = [0, 0];

  const { direction } = matchDetails.ball;

  if (newPower < 75) {
    setDeflectionPlayerHasBall(matchDetails, defPlayer, defTeam);

    return defPosition;
  }

  defPlayer.hasBall = false;
  matchDetails.ball.Player = '';
  matchDetails.ball.withPlayer = false;
  matchDetails.ball.withTeam = '';
  tempPosition = setDeflectionDirectionPos(direction, defPosition, newPower);
  const lastTeam = matchDetails.ball.lastTouch.teamID;

  matchDetails = setPositions.keepInBoundaries(matchDetails, `Team: ${lastTeam}`, tempPosition);
  const intended = matchDetails.ballIntended;

  const lastPOS = structuredClone(intended ?? matchDetails.ball.position);

  delete matchDetails.ballIntended;

  return lastPOS;
}

function setDeflectionDirectionPos(
  direction: string,
  defPosition: [number, number],
  newPower: number,
): [number, number] {
  return calculateDeflectionVector(direction, defPosition, newPower);
}

function setDeflectionPlayerHasBall(
  matchDetails: MatchDetails,
  defPlayer: Player,
  defTeam: Team,
): BallPosition | undefined {
  defPlayer.hasBall = true;
  matchDetails.ball.lastTouch.playerName = defPlayer.name;
  matchDetails.ball.lastTouch.playerID = defPlayer.playerID;
  matchDetails.ball.lastTouch.teamID = defTeam.teamID;

  if (defPlayer.offside === true) {
    matchDetails = setDeflectionPlayerOffside(matchDetails, defTeam, defPlayer);

    return matchDetails.ball.position;
  }

  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.Player = defPlayer.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = defTeam.teamID;
  const [posX, posY] = common.destructPos(defPlayer.currentPOS);

  matchDetails.ball.position = [posX, posY];

  return undefined;
}

function setDeflectionPlayerOffside(
  matchDetails: MatchDetails,
  defTeam: Team,
  defPlayer: Player,
): MatchDetails {
  defPlayer.offside = false;
  defPlayer.hasBall = false;
  matchDetails.ball.Player = '';
  matchDetails.ball.withPlayer = false;
  matchDetails.ball.withTeam = '';
  matchDetails.iterationLog.push(`${defPlayer.name} is offside. Set piece given`);

  if (defTeam.name === matchDetails.kickOffTeam.name) {
    matchDetails = setPositions.setSetpieceSecondTeam(matchDetails);
  } else {
    matchDetails = setPositions.setSetpieceKickOffTeam(matchDetails);
  }

  return matchDetails;
}

function getBallDirection(matchDetails: MatchDetails, nextPOS: BallPosition): void {
  return updateBallCardinalDirection(matchDetails, nextPOS);
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

function updateLastTouch(ball: Ball, player: Player, team: Team): void {
  ball.lastTouch.playerName = player.name;
  ball.lastTouch.playerID = player.playerID;
  ball.lastTouch.teamID = team.teamID;
}

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

function setTargetPlyPos(targetConfig: {
  tplyr: Player;
  lowX: number;
  highX: number;
  lowY: number;
  highY: number;
}): [number, number] {
  const { tplyr, lowX, highX, lowY, highY } = targetConfig;

  const closePlyPos: [number, number] = [0, 0];

  const [targetPlayerXPos, targetPlayerYPos] = common.destructPos(tplyr);

  closePlyPos[0] = common.round(targetPlayerXPos + common.getRandomNumber(lowX, highX), 0);
  closePlyPos[1] = common.round(targetPlayerYPos + common.getRandomNumber(lowY, highY), 0);

  return closePlyPos;
}

function getTargetPlayer(
  playersArray: PlayerWithProximity[],
  side: string,
  pitchHeight: number = 1050,
): PlayerWithProximity {
  return resolveBestPassOption(playersArray, side, pitchHeight);
}

function ballCrossed(matchDetails: MatchDetails, team: Team, player: Player): [number, number] {
  if (player.currentPOS[0] === 'NP') {
    throw new Error('Player no position!');
  }

  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const ballIntended: [number, number] = [0, 0];

  if (player.originPOS[1] > pitchHeight / 2) {
    ballIntended[1] = common.getRandomNumber(0, pitchHeight / 5);

    if (player.currentPOS[0] < pitchWidth / 2) {
      ballIntended[0] = common.getRandomNumber(pitchWidth / 3, pitchWidth);
    } else {
      ballIntended[0] = common.getRandomNumber(0, pitchWidth - pitchWidth / 3);
    }
  } else {
    ballIntended[1] = common.getRandomNumber(pitchHeight - pitchHeight / 5, pitchHeight);

    if (player.currentPOS[0] < pitchWidth / 2) {
      ballIntended[0] = common.getRandomNumber(pitchWidth / 3, pitchWidth);
    } else {
      ballIntended[0] = common.getRandomNumber(0, pitchWidth - pitchWidth / 3);
    }
  }

  matchDetails.iterationLog.push(`ball crossed by: ${player.name}`);
  player.stats.passes.total++;
  const result = calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    ballIntended,
    player,
  );

  if (!Array.isArray(result)) {
    throw new Error('No coordinates!');
  }

  return result;
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
  ballCrossed,
  ballKicked,
  ballPassed,
  calcBallMovementOverTime,
  checkGoalScored,
  getBallDirection,
  getTargetPlayer,
  moveBall,
  penaltyTaken,
  resolveDeflection,
  setBPlayer,
  setDeflectionDirectionPos,
  setDeflectionPlayerHasBall,
  setDeflectionPlayerOffside,
  setTargetPlyPos,
  shotMade,
  throughBall,
  resolveBallMovement,
  thisPlayerIsInProximity,
  createPlayer,
  getPlayersInDistance,
  splitNumberIntoN,
  mergeArrays,
};

export { setBallMovementMatchDetails } from './actions/ball.js';

export { getTopKickedPosition, getBottomKickedPosition } from './actions/ballTrajectory.js';
