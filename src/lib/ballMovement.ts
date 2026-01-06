import { processBallMomentum } from './ballState.js';
import {
  checkInterceptionsOnTrajectory,
  resolvePlayerBallInteraction,
} from './collisions.js';
import * as common from './common.js';
import { attemptGoalieSave } from './intentLogic.js';
import { executeKickAction, resolvePassDestination } from './kickLogic.js';
import {
  calculateDeflectionVector,
  updateBallCardinalDirection,
} from './physics.js';
import { initializePlayerObject } from './playerDefaults.js';
import { resolveBestPassOption } from './playerSelectors.js';
import { executePenaltyShot } from './setPieces.js';
import * as setPositions from './setPositions.js';
import type { BallPosition, MatchDetails, Player, Team } from './types.js';

function moveBall(matchDetails: MatchDetails) {
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

function ballKicked(matchDetails: MatchDetails, team: Team, player: Player) {
  return executeKickAction(matchDetails, team, player);
}

function getTopKickedPosition(
  direction: string,
  position: BallPosition,
  power: number,
): [number, number] {
  const pos: [number, number] = [position[0], position[1]];
  if (direction === `wait`) {
    return newKickedPosition(pos, 0, power / 2, 0, power / 2);
  } else if (direction === `north`) {
    return newKickedPosition(pos, -20, 20, -power, -(power / 2));
  } else if (direction === `east`) {
    return newKickedPosition(pos, power / 2, power, -20, 20);
  } else if (direction === `west`) {
    return newKickedPosition(pos, -power, -(power / 2), -20, 20);
  } else if (direction === `northeast`) {
    return newKickedPosition(pos, 0, power / 2, -power, -(power / 2));
  } else if (direction === `northwest`) {
    return newKickedPosition(pos, -(power / 2), 0, -power, -(power / 2));
  }
  throw new Error('Unexpected direction');
}

function getBottomKickedPosition(
  direction: string,
  position: BallPosition,
  power: number,
): [number, number] {
  const pos: [number, number] = [position[0], position[1]];
  if (direction === `wait`) {
    return newKickedPosition(pos, 0, power / 2, 0, power / 2);
  } else if (direction === `south`) {
    return newKickedPosition(pos, -20, 20, power / 2, power);
  } else if (direction === `east`) {
    return newKickedPosition(pos, power / 2, power, -20, 20);
  } else if (direction === `west`) {
    return newKickedPosition(pos, -power, -(power / 2), -20, 20);
  } else if (direction === `southeast`) {
    return newKickedPosition(pos, 0, power / 2, power / 2, power);
  } else if (direction === `southwest`) {
    return newKickedPosition(pos, -(power / 2), 0, power / 2, power);
  }
  throw new Error('Unexpected direction');
}

function newKickedPosition(
  pos: [number, number],
  lowX: number,
  highX: number,
  lowY: number,
  highY: number,
): [number, number] {
  const newPosition: [number, number] = [0, 0];
  newPosition[0] = pos[0] + common.getRandomNumber(lowX, highX);
  newPosition[1] = pos[1] + common.getRandomNumber(lowY, highY);
  return newPosition;
}

function shotMade(matchDetails: MatchDetails, team: Team, player: Player) {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Setup & Physics
  updateLastTouch(matchDetails, team, player);
  const shotPower = common.calculatePower(player.skill.strength);

  // 2. Logic Resolution
  const isOnTarget = setPositions.checkShotAccuracy(
    player,
    pitchHeight,
    shotPower,
  );
  recordShotStats(matchDetails, player, isOnTarget);

  // 3. Coordinate Resolution
  const targetCoord = setPositions.calculateShotTarget(
    player,
    isOnTarget,
    pitchWidth,
    pitchHeight,
    shotPower,
  );

  // 4. Execution
  const endPos = calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    targetCoord,
    player,
  );
  checkGoalScored(matchDetails);

  return endPos;
}

function recordShotStats(
  matchDetails: MatchDetails,
  player: Player,
  isOnTarget: boolean,
): void {
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

function updateLastTouch(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
): void {
  matchDetails.iterationLog.push(`Shot Made by: ${player.name}`);
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
}

function penaltyTaken(matchDetails: MatchDetails, team: Team, player: Player) {
  return executePenaltyShot(matchDetails, team, player);
}

function checkGoalScored(matchDetails: MatchDetails) {
  const { ball, kickOffTeam, secondTeam } = matchDetails;
  const [pitchWidth, pitchHeight, goalWidth] = matchDetails.pitchSize;
  const [ballX, ballY] = ball.position;

  // 1. Position Safety Checks
  const KOGoalie = kickOffTeam.players[0];
  const STGoalie = secondTeam.players[0];
  if (KOGoalie.currentPOS[0] === 'NP' || STGoalie.currentPOS[0] === 'NP') {
    throw new Error('Goalie position missing!');
  }

  // 2. Phase 1: Goalkeeper Saves (Prevents Goal)
  if (attemptGoalieSave(matchDetails, KOGoalie, kickOffTeam.name)) {
    return;
  }
  if (attemptGoalieSave(matchDetails, STGoalie, secondTeam.name)) {
    return;
  }

  // 3. Phase 2: Goal Line Detection
  const centreGoal = pitchWidth / 2;
  const goalEdge = goalWidth / 2;
  const withinGoalX = common.isBetween(
    ballX,
    centreGoal - goalEdge,
    centreGoal + goalEdge,
  );

  if (withinGoalX) {
    if (ballY < 1) {
      setPositions.resolveGoalScored(matchDetails, true);
    } else if (ballY >= pitchHeight) {
      setPositions.resolveGoalScored(matchDetails, false);
    }
  }
}

function throughBall(matchDetails: MatchDetails, team: Team, player: Player) {
  return resolvePassDestination(matchDetails, team, player);
}

function getPlayersInDistance(
  team: Team,
  player: Player,
  pitchSize: [number, number, number?],
): { position: [number, number]; proximity: number; name: string }[] {
  const [curX, curY] = player.currentPOS;
  if (curX === 'NP') {
    throw new Error('Player no position!');
  }
  const [pitchWidth, pitchHeight] = pitchSize;
  const playersInDistance = [];
  for (const teamPlayer of team.players) {
    const [tpX, tpY] = teamPlayer.currentPOS;
    if (teamPlayer.name !== player.name) {
      if (tpX === 'NP') {
        throw new Error('Team player no position!');
      }
      const onPitchX = common.isBetween(tpX, -1, pitchWidth + 1);
      const onPitchY = common.isBetween(tpY, -1, pitchHeight + 1);
      if (onPitchX && onPitchY) {
        const playerToPlayerX = curX - tpX;
        const playerToPlayerY = curY - tpY;
        const proximityToBall = Math.abs(playerToPlayerX + playerToPlayerY);
        playersInDistance.push({
          position: [tpX, tpY] as [number, number],
          proximity: proximityToBall,
          name: teamPlayer.name,
        });
      }
    }
  }
  playersInDistance.sort(function (a, b) {
    return a.proximity - b.proximity;
  });
  return playersInDistance;
}
function resolveBallMovement(
  player: Player,
  thisPOS: unknown,
  newPOS: unknown,
  power: number,
  team: Team,
  opp: Team,
  matchDetails: MatchDetails,
): [number, number] {
  return checkInterceptionsOnTrajectory(
    player,
    thisPOS,
    newPOS,
    power,
    team,
    opp,
    matchDetails,
  );
}

function thisPlayerIsInProximity(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  thisPOS: [number, number],
  thisPos: [number, number, number],
  power: number,
  thisTeam: Team,
) {
  return resolvePlayerBallInteraction(
    matchDetails,
    thisPlayer,
    thisPOS,
    thisPos,
    power,
    thisTeam,
  );
}

function setBallMovementMatchDetails(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  thisPos: BallPosition,
  thisTeam: Team,
) {
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.Player = thisPlayer.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.lastTouch.playerName = thisPlayer.name;
  matchDetails.ball.lastTouch.playerID = thisPlayer.playerID;
  matchDetails.ball.lastTouch.teamID = thisTeam.teamID;
  matchDetails.ball.withTeam = thisTeam.teamID;
  matchDetails.ball.position = [...thisPos];
  thisPlayer.currentPOS = [thisPos[0], thisPos[1]];
}

function resolveDeflection(
  power: number,
  thisPOS: unknown,
  defPosition: unknown,
  defPlayer: Player,
  defTeam: Team,
  matchDetails: MatchDetails,
) {
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
  matchDetails = setPositions.keepInBoundaries(
    matchDetails,
    `Team: ${lastTeam}`,
    tempPosition,
  );
  const intended = matchDetails.ballIntended;
  const lastPOS = intended ? [...intended] : [...matchDetails.ball.position];
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
) {
  defPlayer.hasBall = true;
  matchDetails.ball.lastTouch.playerName = defPlayer.name;
  matchDetails.ball.lastTouch.playerID = defPlayer.playerID;
  matchDetails.ball.lastTouch.teamID = defTeam.teamID;
  if (defPlayer.offside === true) {
    setDeflectionPlayerOffside(matchDetails, defTeam, defPlayer);
    return matchDetails.ball.position;
  }
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.Player = defPlayer.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = defTeam.teamID;
  const [posX, posY] = defPlayer.currentPOS;
  if (posX === 'NP') {
    throw new Error('No player position!');
  }
  matchDetails.ball.position = [posX, posY];
}

function setDeflectionPlayerOffside(
  matchDetails: MatchDetails,
  defTeam: Team,
  defPlayer: Player,
): void {
  defPlayer.offside = false;
  defPlayer.hasBall = false;
  matchDetails.ball.Player = '';
  matchDetails.ball.withPlayer = false;
  matchDetails.ball.withTeam = '';
  matchDetails.iterationLog.push(
    `${defPlayer.name} is offside. Set piece given`,
  );
  if (defTeam.name === matchDetails.kickOffTeam.name) {
    matchDetails = setPositions.setSetpieceSecondTeam(matchDetails);
  } else {
    matchDetails = setPositions.setSetpieceKickOffTeam(matchDetails);
  }
}

function getBallDirection(matchDetails: MatchDetails, nextPOS: BallPosition) {
  return updateBallCardinalDirection(matchDetails, nextPOS);
}

function ballPassed(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
): [number, number] | MatchDetails {
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  const [, pitchHeight] = matchDetails.pitchSize;
  const side = player.originPOS[1] > pitchHeight / 2 ? 'bottom' : 'top';
  const { position } = matchDetails.ball;
  let closePlyPos = [0, 0];
  const playersInDistance: {
    position: [number, number];
    proximity: number;
    name: string;
  }[] = getPlayersInDistance(team, player, matchDetails.pitchSize);
  const tPlyr = getTargetPlayer(playersInDistance, side, pitchHeight);
  const bottomThird = position[1] > pitchHeight - pitchHeight / 3;
  const middleThird = !!(
    position[1] > pitchHeight / 3 && position[1] < pitchHeight - pitchHeight / 3
  );
  if (player.skill.passing > common.getRandomNumber(0, 100)) {
    closePlyPos = tPlyr.position;
  } else if (player.originPOS[1] > pitchHeight / 2) {
    if (bottomThird) {
      closePlyPos = setTargetPlyPos(tPlyr.position, -10, 10, -10, 10);
    } else if (middleThird) {
      closePlyPos = setTargetPlyPos(tPlyr.position, -50, 50, -50, 50);
    } else {
      closePlyPos = setTargetPlyPos(tPlyr.position, -100, 100, -100, 100);
    }
  } else if (bottomThird) {
    closePlyPos = setTargetPlyPos(tPlyr.position, -100, 100, -100, 100);
  } else if (middleThird) {
    closePlyPos = setTargetPlyPos(tPlyr.position, -50, 50, -50, 50);
  } else {
    closePlyPos = setTargetPlyPos(tPlyr.position, -10, 10, -10, 10);
  }
  matchDetails.iterationLog.push(
    `ball passed by: ${player.name} to: ${tPlyr.name}`,
  );
  player.stats.passes.total++;
  return calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    closePlyPos,
    player,
  );
}

function setTargetPlyPos(
  tplyr: [number, number],
  lowX: number,
  highX: number,
  lowY: number,
  highY: number,
): [number, number] {
  const closePlyPos: [number, number] = [0, 0];
  const [targetPlayerXPos, targetPlayerYPos] = tplyr;
  closePlyPos[0] = common.round(
    targetPlayerXPos + common.getRandomNumber(lowX, highX),
    0,
  );
  closePlyPos[1] = common.round(
    targetPlayerYPos + common.getRandomNumber(lowY, highY),
    0,
  );
  return closePlyPos;
}

function getTargetPlayer(
  playersArray: {
    position: [number, number];
    proximity: number;
    name: string;
  }[],
  side: string,
  pitchHeight: number = 1050,
): { position: [number, number]; proximity: number; name: string } {
  return resolveBestPassOption(playersArray, side, pitchHeight);
}

function ballCrossed(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
): [number, number] {
  if (player.currentPOS[0] === 'NP') {
    throw new Error('Player no position!');
  }
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const ballIntended = [];
  if (player.originPOS[1] > pitchHeight / 2) {
    ballIntended[1] = common.getRandomNumber(0, pitchHeight / 5);
    if (player.currentPOS[0] < pitchWidth / 2) {
      ballIntended[0] = common.getRandomNumber(pitchWidth / 3, pitchWidth);
    } else {
      ballIntended[0] = common.getRandomNumber(0, pitchWidth - pitchWidth / 3);
    }
  } else {
    ballIntended[1] = common.getRandomNumber(
      pitchHeight - pitchHeight / 5,
      pitchHeight,
    );
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
  strength: unknown,
  nextPosition: number[],
  player: Player,
): [number, number] | MatchDetails {
  const { kickOffTeam, secondTeam } = matchDetails;
  const { position } = matchDetails.ball;
  const power: number = common.calculatePower(strength);
  const changeInX = nextPosition[0] - position[0];
  const changeInY = nextPosition[1] - position[1];
  const totalChange = Math.max(Math.abs(changeInX), Math.abs(changeInY));
  let movementIterations = common.round(
    totalChange / common.getRandomNumber(2, 3),
    0,
  );
  if (movementIterations < 1) {
    movementIterations = 1;
  }
  const powerArray = splitNumberIntoN(power, movementIterations);
  const xArray = splitNumberIntoN(changeInX, movementIterations);
  const yArray = splitNumberIntoN(changeInY, movementIterations);
  const BOIts = mergeArrays(
    powerArray.length,
    position,
    nextPosition,
    xArray,
    yArray,
    powerArray,
  );
  matchDetails.ball.ballOverIterations = BOIts;
  const endPos = resolveBallMovement(
    player,
    position,
    BOIts[0],
    power,
    kickOffTeam,
    secondTeam,
    matchDetails,
  );
  if (matchDetails.endIteration === true) {
    return matchDetails;
  }
  matchDetails.ball.ballOverIterations.shift();
  matchDetails.iterationLog.push(`resolving ball movement`);
  return endPos;
}

function splitNumberIntoN(num: unknown, n: number) {
  const arrayN = Array.from(Array(n).keys());
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

function mergeArrays(
  arrayLength: number,
  oldPos: number[],
  newPos: number[],
  array1: number[],
  array2: number[],
  array3: number[],
) {
  let tempPos = [oldPos[0], oldPos[1]];
  const arrayN = Array.from(Array(arrayLength - 1).keys());
  const newArray = [];
  for (const thisn of arrayN) {
    newArray.push([
      tempPos[0] + array1[thisn],
      tempPos[1] + array2[thisn],
      array3[thisn],
    ]);
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
  getBottomKickedPosition,
  getTargetPlayer,
  getTopKickedPosition,
  mergeArrays,
  moveBall,
  penaltyTaken,
  resolveDeflection,
  setBallMovementMatchDetails,
  setBPlayer,
  setDeflectionDirectionPos,
  setDeflectionPlayerHasBall,
  setDeflectionPlayerOffside,
  setTargetPlyPos,
  shotMade,
  splitNumberIntoN,
  throughBall,
  resolveBallMovement,
  getPlayersInDistance,
  thisPlayerIsInProximity,
  createPlayer,
};
