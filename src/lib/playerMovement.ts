import * as actions from './actions.js';
import { executeActiveBallAction } from './ballActionHandler.js';
import * as common from './common.js';
import * as setPositions from './setPositions.js';
import { processTeamTactics } from './teamAI.js';
import type { BallPosition, MatchDetails, Player, Team } from './types.js';

function decideMovement(
  closestPlayer: { name: string; position: number },
  team: Team,
  opp: Team,
  matchDetails: MatchDetails,
) {
  return processTeamTactics(closestPlayer, team, opp, matchDetails);
}

function setClosePlayerTakesBall(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  team: Team,
  opp: Team,
) {
  if (thisPlayer.offside) {
    matchDetails.iterationLog.push(`${thisPlayer.name} is offside`);
    if (team.name === matchDetails.kickOffTeam.name) {
      setPositions.setSetpieceKickOffTeam(matchDetails);
    } else {
      setPositions.setSetpieceSecondTeam(matchDetails);
    }
  } else {
    thisPlayer.hasBall = true;
    matchDetails.ball.lastTouch.playerName = thisPlayer.name;
    matchDetails.ball.lastTouch.playerID = thisPlayer.playerID;
    matchDetails.ball.lastTouch.teamID = team.teamID;
    matchDetails.ball.ballOverIterations = [];
    const [posX, posY] = thisPlayer.currentPOS;
    if (posX === 'NP') {
      throw new Error('No player position!');
    }
    matchDetails.ball.position = [posX, posY];
    matchDetails.ball.Player = thisPlayer.playerID;
    matchDetails.ball.withPlayer = true;
    matchDetails.ball.withTeam = team.teamID;
    team.intent = `attack`;
    opp.intent = `defend`;
  }
}

function completeSlide(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  team: Team,
  opp: Team,
) {
  const foul = actions.resolveSlide(thisPlayer, team, opp, matchDetails);
  if (!foul) {
    if (opp.name === matchDetails.kickOffTeam.name) {
      return setPositions.setSetpieceKickOffTeam(matchDetails);
    }
    return setPositions.setSetpieceSecondTeam(matchDetails);
  }
  const intensity = actions.foulIntensity();
  if (common.isBetween(intensity, 65, 90)) {
    thisPlayer.stats.cards.yellow++;
    if (thisPlayer.stats.cards.yellow === 2) {
      thisPlayer.stats.cards.red++;
      Object.defineProperty(thisPlayer, 'currentPOS', {
        value: ['NP', 'NP'],
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }
  } else if (common.isBetween(intensity, 85, 100)) {
    thisPlayer.stats.cards.red++;
    Object.defineProperty(thisPlayer, 'currentPOS', {
      value: ['NP', 'NP'],
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }
  if (opp.name === matchDetails.kickOffTeam.name) {
    return setPositions.setSetpieceKickOffTeam(matchDetails);
  }
  return setPositions.setSetpieceSecondTeam(matchDetails);
}

function completeTackleWhenCloseNoBall(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  team: Team,
  opp: Team,
) {
  const foul = actions.resolveTackle(thisPlayer, team, opp, matchDetails);
  if (foul) {
    const intensity = actions.foulIntensity();
    if (common.isBetween(intensity, 75, 90)) {
      thisPlayer.stats.cards.yellow++;
      if (thisPlayer.stats.cards.yellow === 2) {
        thisPlayer.stats.cards.red++;
        Object.defineProperty(thisPlayer, 'currentPOS', {
          value: ['NP', 'NP'],
          writable: false,
          enumerable: true,
          configurable: false,
        });
      }
    } else if (common.isBetween(intensity, 90, 100)) {
      thisPlayer.stats.cards.red++;
      Object.defineProperty(thisPlayer, 'currentPOS', {
        value: ['NP', 'NP'],
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }
  }
  if (opp.name === matchDetails.kickOffTeam.name) {
    return setPositions.setSetpieceKickOffTeam(matchDetails);
  }
  return setPositions.setSetpieceSecondTeam(matchDetails);
}

function completeMovement(
  matchDetails: MatchDetails,
  currentPOS: [number | 'NP', number],
  move: number[],
) {
  if (currentPOS[0] !== 'NP') {
    const intendedMovementX = currentPOS[0] + move[0];
    const intendedMovementY = currentPOS[1] + move[1];
    if (
      intendedMovementX < matchDetails.pitchSize[0] + 1 &&
      intendedMovementX > -1
    ) {
      currentPOS[0] += move[0];
    }
    if (
      intendedMovementY < matchDetails.pitchSize[1] + 1 &&
      intendedMovementY > -1
    ) {
      currentPOS[1] += move[1];
    }
  }
  return currentPOS;
}

function closestPlayerActionBallX(ballToPlayerX: number) {
  if (common.isBetween(ballToPlayerX, -30, 30) === false) {
    if (ballToPlayerX > 29) {
      return 29;
    }
    return -29;
  }
  return ballToPlayerX;
}

function closestPlayerActionBallY(ballToPlayerY: number) {
  if (common.isBetween(ballToPlayerY, -30, 30) === false) {
    if (ballToPlayerY > 29) {
      return 29;
    }
    return -29;
  }
  return ballToPlayerY;
}

function checkProvidedAction(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  action: string,
): string {
  return actions.validateAndResolvePlayerAction(
    matchDetails,
    thisPlayer,
    action,
  );
}

function handleBallPlayerActions(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  team: Team,
  opp: Team,
  action: string,
) {
  return executeActiveBallAction(matchDetails, thisPlayer, team, opp, action);
}

function ballMoved(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  team: Team,
  opp: Team,
) {
  thisPlayer.hasBall = false;
  matchDetails.ball.withPlayer = false;
  team.intent = `attack`;
  opp.intent = `attack`;
  matchDetails.ball.Player = ``;
  matchDetails.ball.withTeam = ``;
}

function updateInformation(
  matchDetails: MatchDetails,
  newPosition: BallPosition,
): void {
  if (matchDetails.endIteration === true) {
    return;
  }

  const [posX, posY] = newPosition;
  matchDetails.ball.position = [posX, posY];

  matchDetails.ball.position[2] = 0;
}

function getMovement(
  player: Player,
  action: string,
  opposition: Team,
  ballX: number,
  ballY: number,
  matchDetails: MatchDetails,
): [number, number] {
  const { position } = matchDetails.ball;
  const ballActions = [
    `shoot`,
    `throughBall`,
    `pass`,
    `cross`,
    `cleared`,
    `boot`,
    `penalty`,
  ];
  if (action === `wait` || ballActions.includes(action)) {
    return [0, 0];
  } else if (action === `tackle` || action === `slide`) {
    return getTackleMovement(ballX, ballY);
  } else if (action === `intercept`) {
    return getInterceptMovement(
      player,
      opposition,
      position,
      matchDetails.pitchSize,
    );
  } else if (action === `run`) {
    return getRunMovement(matchDetails, player, ballX, ballY);
  } else if (action === `sprint`) {
    return getSprintMovement(matchDetails, player, ballX, ballY);
  }
  throw new Error('No action');
}

function getTackleMovement(ballX: number, ballY: number): [number, number] {
  const move: [number, number] = [0, 0];
  if (ballX > 0) {
    move[0] = -1;
  } else if (ballX === 0) {
    move[0] = 0;
  } else if (ballX < 0) {
    move[0] = 1;
  }
  if (ballY > 0) {
    move[1] = -1;
  } else if (ballY === 0) {
    move[1] = 0;
  } else if (ballY < 0) {
    move[1] = 1;
  }
  return move;
}

/**
 * Calculates a directional unit vector [-1|0|1, -1|0|1] to guide a player
 * toward an optimal interception point.
 */
function getInterceptMovement(
  player: Player,
  opposition: Team,
  ballPosition: BallPosition,
  pitchSize: [number, number, number],
): [number, number] {
  const [x, y] = player.currentPOS;

  // 1. Validation: Ensure player has a valid physical position on the pitch
  if (x === 'NP') {
    throw new Error(
      `Player ${player.name} (ID: ${player.playerID}) is 'NP' at an active logic gate!`,
    );
  }

  // 2. Determine the target coordinates for interception
  const [targetX, targetY] = getInterceptPosition(
    [x, y],
    opposition,
    ballPosition,
    pitchSize,
  );

  /**
   * 3. Calculate movement direction
   * Subtracting target from current gives the raw distance (delta).
   * Math.sign reduces this to:
   * 1  (if moving toward a larger coordinate)
   * -1  (if moving toward a smaller coordinate)
   * 0  (if already at the coordinate)
   */
  const deltaX = targetX - x;
  const deltaY = targetY - y;

  return [Math.sign(deltaX) as number, Math.sign(deltaY) as number];
}

function getInterceptPosition(
  currentPOS: BallPosition,
  opposition: Team,
  ballPosition: BallPosition,
  pitchSize: [number, number, number],
): BallPosition {
  const BallPlyTraj = getInterceptTrajectory(
    opposition,
    ballPosition,
    pitchSize,
  );

  let closestPos: BallPosition = BallPlyTraj[0] || [0, 0];
  let shortestDiff = Infinity;
  let closestIndex = 0;

  // Single loop to find both the closest position and its index
  for (let i = 0; i < BallPlyTraj.length; i++) {
    const thisPos = BallPlyTraj[i];
    const xDiff = Math.abs((currentPOS[0] as number) - (thisPos[0] as number));
    const yDiff = Math.abs((currentPOS[1] as number) - (thisPos[1] as number));
    const totalDiff = xDiff + yDiff;

    if (totalDiff < shortestDiff) {
      shortestDiff = totalDiff;
      closestPos = thisPos;
      closestIndex = i;
    }
  }

  // Exact same logic: if already at intercept, step back one in the trajectory
  const isAtIntercept =
    closestPos[0] === currentPOS[0] && closestPos[1] === currentPOS[1];

  if (isAtIntercept && closestIndex > 0) {
    return BallPlyTraj[closestIndex - 1];
  }

  return closestPos;
}

const mockPlayer: Player = {
  name: 'George Johnson',
  position: 'ST', // or "ST"
  rating: '85',
  skill: {
    passing: 80,
    shooting: 90,
    tackling: 50,
    saving: 10,
    agility: 85,
    strength: 75,
    penalty_taking: 80,
    jumping: 70,
  },
  currentPOS: [400, 200],
  fitness: 95,
  injured: false,
  playerID: 10,
  originPOS: [400, 200],
  intentPOS: [410, 210],
  action: 'none',
  offside: false,
  hasBall: false,
  stats: {
    goals: 0,
    shots: {
      total: 0,
      on: 0,
      off: 0,
      fouls: 0,
    },
    cards: {
      yellow: 0,
      red: 0,
    },
    passes: {
      total: 0,
      on: 0,
      off: 0,
    },
    tackles: {
      total: 0,
      on: 0,
      off: 0,
    },
  },
};
function getInterceptTrajectory(
  opposition: Team,
  ballPosition: BallPosition,
  pitchSize: [number, number, number],
): BallPosition[] {
  const [pitchWidth, pitchHeight] = pitchSize;
  const playerInformation = setPositions.closestPlayerToPosition(
    mockPlayer,
    opposition,
    ballPosition,
  );
  const interceptPlayer = playerInformation.thePlayer;
  const targetX = pitchWidth / 2;
  const targetY =
    interceptPlayer.originPOS[1] < pitchHeight / 2 ? pitchHeight : 0;
  if (interceptPlayer.currentPOS[0] === 'NP') {
    throw new Error('Player no position!');
  }
  const moveX = targetX - interceptPlayer.currentPOS[0];
  const moveY = targetY - interceptPlayer.currentPOS[1];
  const highNum =
    Math.abs(moveX) <= Math.abs(moveY) ? Math.abs(moveY) : Math.abs(moveX);
  const xDiff = moveX / highNum;
  const yDiff = moveY / highNum;
  const POI: BallPosition[] = [
    [...interceptPlayer.currentPOS] as [number, number, number?],
  ];
  for (let i = 0; i < Math.round(highNum); i++) {
    const lastArrayPOS = POI.length - 1;
    const lastXPOS = POI[lastArrayPOS][0];
    const lastYPOS = POI[lastArrayPOS][1];
    POI.push([
      common.round(lastXPOS + xDiff, 0),
      common.round(lastYPOS + yDiff, 0),
    ]);
  }
  return POI;
}

function getRunMovement(
  matchDetails: MatchDetails,
  player: Player,
  ballX: number,
  ballY: number,
): [number, number] {
  // 1. Fitness Decay (Preserved logic)
  if (player.fitness > 20) {
    player.fitness = common.round(player.fitness - 0.005, 6);
  }

  // 2. Immediate random movement if player has ball
  const side =
    player.originPOS[1] > matchDetails.pitchSize[1] / 2 ? 'bottom' : 'top';
  if (player.hasBall) {
    return side === 'bottom'
      ? [common.getRandomNumber(0, 2), common.getRandomNumber(0, 2)]
      : [common.getRandomNumber(-2, 0), common.getRandomNumber(-2, 0)];
  }

  // 3. Movement logic based on ball proximity or formation
  const movementRun = [-1, 0, 1];

  if (common.isBetween(ballX, -60, 60) && common.isBetween(ballY, -60, 60)) {
    return calculateProximityMovement(ballX, ballY, movementRun);
  }

  return calculateFormationMovement(player, movementRun);
}

// Helper: Handle movement when ball is very close
function calculateProximityMovement(
  ballX: number,
  ballY: number,
  runOptions: number[],
): [number, number] {
  const move: [number, number] = [0, 0];

  // X-axis logic
  if (common.isBetween(ballX, -60, 0)) {
    move[0] = runOptions[2];
  } else if (common.isBetween(ballX, 0, 60)) {
    move[0] = runOptions[0];
  } else {
    move[0] = runOptions[1];
  }

  // Y-axis logic
  if (common.isBetween(ballY, -60, 0)) {
    move[1] = runOptions[2];
  } else if (common.isBetween(ballY, 0, 60)) {
    move[1] = runOptions[0];
  } else {
    move[1] = runOptions[1];
  }

  return move;
}

// Helper: Handle movement toward formation position
function calculateFormationMovement(
  player: Player,
  runOptions: number[],
): [number, number] {
  const [x, y] = player.currentPOS;
  if (x === 'NP') {
    throw new Error('No player position!');
  }

  const direction = setPositions.formationCheck(player.intentPOS, [
    Number(x),
    Number(y),
  ]);

  const getMove = (dir: number) => {
    if (dir === 0) {
      return runOptions[1];
    }
    return dir < 0
      ? runOptions[common.getRandomNumber(0, 1)]
      : runOptions[common.getRandomNumber(1, 2)];
  };

  return [getMove(direction[0]), getMove(direction[1])];
}

function getSprintMovement(
  matchDetails: MatchDetails,
  player: Player,
  ballX: number,
  ballY: number,
): [number, number] {
  // 1. Fitness Decay (Higher cost for sprinting)
  if (player.fitness > 30) {
    player.fitness = common.round(player.fitness - 0.01, 6);
  }

  // 2. Ball Carrier Logic (Aggressive forward movement)
  const side =
    player.originPOS[1] > matchDetails.pitchSize[1] / 2 ? 'bottom' : 'top';
  if (player.hasBall) {
    return side === 'bottom'
      ? [common.getRandomNumber(-4, 4), common.getRandomNumber(-4, -2)]
      : [common.getRandomNumber(-4, 4), common.getRandomNumber(2, 4)];
  }

  const movementSprint = [-2, -1, 0, 1, 2];

  // 3. Proximity Logic (Closing in on ball)
  if (common.isBetween(ballX, -60, 60) && common.isBetween(ballY, -60, 60)) {
    return calculateSprintProximity(ballX, ballY, movementSprint);
  }

  // 4. Formation Logic (Sprinting back to position)
  return calculateSprintFormation(player, movementSprint);
}

// Helper: Sprinting toward ball
function calculateSprintProximity(
  ballX: number,
  ballY: number,
  sprintOptions: number[],
): [number, number] {
  const move: [number, number] = [0, 0];

  move[0] = common.isBetween(ballX, -60, 0)
    ? sprintOptions[common.getRandomNumber(3, 4)]
    : common.isBetween(ballX, 0, 60)
      ? sprintOptions[common.getRandomNumber(0, 1)]
      : sprintOptions[2];

  move[1] = common.isBetween(ballY, -60, 0)
    ? sprintOptions[common.getRandomNumber(3, 4)]
    : common.isBetween(ballY, 0, 60)
      ? sprintOptions[common.getRandomNumber(0, 1)]
      : sprintOptions[2];

  return move;
}

// Helper: Sprinting toward formation intent
function calculateSprintFormation(
  player: Player,
  sprintOptions: number[],
): [number, number] {
  const [x, y] = player.currentPOS;
  if (x === 'NP') {
    throw new Error('No player position!');
  }

  const direction = setPositions.formationCheck(player.intentPOS, [
    Number(x),
    Number(y),
  ]);

  const getMove = (dir: number) => {
    if (dir === 0) {
      return sprintOptions[2];
    }
    return dir < 0
      ? sprintOptions[common.getRandomNumber(0, 2)]
      : sprintOptions[common.getRandomNumber(2, 4)];
  };

  return [getMove(direction[0]), getMove(direction[1])];
}

function closestPlayerToBall(
  closestPlayer: { name: string; position: number },
  team: Team,
  matchDetails: MatchDetails,
): void {
  let closestPlayerDetails;
  const { position } = matchDetails.ball;
  for (const thisPlayer of team.players) {
    if (thisPlayer.currentPOS[0] === 'NP') {
      throw new Error(
        `Player ${thisPlayer.name} (ID: ${thisPlayer.playerID}) is 'NP' at an active logic gate!`,
      );
    }
    const ballToPlayerX: number = Math.abs(
      thisPlayer.currentPOS[0] - position[0],
    );
    const ballToPlayerY = Math.abs(thisPlayer.currentPOS[1] - position[1]);
    const proximityToBall = ballToPlayerX + ballToPlayerY;
    if (proximityToBall < closestPlayer.position) {
      closestPlayer.name = thisPlayer.name;
      closestPlayer.position = proximityToBall;
      closestPlayerDetails = thisPlayer;
    }
  }
  if (closestPlayerDetails === undefined) {
    throw new Error('Player undefined!');
  }
  setPositions.setIntentPosition(matchDetails, closestPlayerDetails);
  if (closestPlayerDetails === undefined) {
    throw new Error('Closest player details not found');
  }
  matchDetails.iterationLog.push(
    `Closest Player to ball: ${closestPlayerDetails.name}`,
  );
}

function checkOffside(team1: Team, team2: Team, matchDetails: MatchDetails) {
  const { ball } = matchDetails;
  const { pitchSize } = matchDetails;
  const team1side =
    team1.players[0].originPOS[1] < pitchSize[1] / 2 ? `top` : `bottom`;
  if (!ball.withTeam) {
    return matchDetails;
  }
  if (team1side === `bottom`) {
    team1atBottom(team1, team2, pitchSize[1]);
  } else {
    team1atTop(team1, team2, pitchSize[1]);
  }
}

function getTopMostPlayer(team: Team, pitchHeight: number) {
  let player;
  for (const thisPlayer of team.players) {
    let topMostPosition: number = pitchHeight;
    const [, plyrX] = thisPlayer.currentPOS;
    if (thisPlayer.currentPOS[1] < topMostPosition) {
      topMostPosition = plyrX;
      player = thisPlayer;
    }
  }
  return player;
}

function getBottomMostPlayer(team: Team) {
  let player;
  for (const thisPlayer of team.players) {
    let topMostPosition = 0;
    const [, plyrX] = thisPlayer.currentPOS;
    if (thisPlayer.currentPOS[1] > topMostPosition) {
      topMostPosition = plyrX;
      player = thisPlayer;
    }
  }
  return player;
}

function team1atBottom(team1: Team, team2: Team, pitchHeight: number) {
  const offT1Ypos = offsideYPOS(team2, `top`, pitchHeight);
  const topPlayer = getTopMostPlayer(team1, pitchHeight);
  if (topPlayer === undefined) {
    throw new Error('Top player is undefined');
  }
  const topPlayerOffsidePosition = common.isBetween(
    topPlayer.currentPOS[1],
    offT1Ypos.pos1,
    offT1Ypos.pos2,
  );
  if (topPlayerOffsidePosition && topPlayer.hasBall) {
    return;
  }
  for (const thisPlayer of team1.players) {
    thisPlayer.offside = false;
    if (
      common.isBetween(thisPlayer.currentPOS[1], offT1Ypos.pos1, offT1Ypos.pos2)
    ) {
      if (!thisPlayer.hasBall) {
        thisPlayer.offside = true;
      }
    }
  }
  const offT2Ypos = offsideYPOS(team1, `bottom`, pitchHeight);
  const btmPlayer = getBottomMostPlayer(team2);
  if (btmPlayer === undefined) {
    throw new Error('Bottom player is undefined');
  }
  const btmPlayerOffsidePosition = common.isBetween(
    btmPlayer.currentPOS[1],
    offT2Ypos.pos2,
    offT2Ypos.pos1,
  );
  if (btmPlayerOffsidePosition && btmPlayer.hasBall) {
    return;
  }
  for (const thisPlayer of team2.players) {
    thisPlayer.offside = false;
    if (
      common.isBetween(thisPlayer.currentPOS[1], offT2Ypos.pos2, offT2Ypos.pos1)
    ) {
      if (!thisPlayer.hasBall) {
        thisPlayer.offside = true;
      }
    }
  }
}

function team1atTop(team1: Team, team2: Team, pitchHeight: number) {
  const offT1Ypos = offsideYPOS(team2, `bottom`, pitchHeight);
  const btmPlayer = getBottomMostPlayer(team1);
  if (btmPlayer === undefined) {
    throw new Error('Bottom player is undefined');
  }
  const btmPlayerOffsidePosition = common.isBetween(
    btmPlayer.currentPOS[1],
    offT1Ypos.pos2,
    offT1Ypos.pos1,
  );
  if (btmPlayerOffsidePosition && btmPlayer.hasBall) {
    return;
  }
  for (const thisPlayer of team1.players) {
    thisPlayer.offside = false;
    if (
      common.isBetween(thisPlayer.currentPOS[1], offT1Ypos.pos2, offT1Ypos.pos1)
    ) {
      if (!thisPlayer.hasBall) {
        thisPlayer.offside = true;
      }
    }
  }
  const offT2Ypos = offsideYPOS(team1, `top`, pitchHeight);
  const topPlayer = getTopMostPlayer(team2, pitchHeight);
  if (topPlayer === undefined) {
    throw new Error('Top player is undefined');
  }
  const topPlayerOffsidePosition = common.isBetween(
    topPlayer.currentPOS[1],
    offT2Ypos.pos1,
    offT2Ypos.pos2,
  );
  if (topPlayerOffsidePosition && topPlayer.hasBall) {
    return;
  }
  for (const thisPlayer of team2.players) {
    thisPlayer.offside = false;
    if (
      common.isBetween(thisPlayer.currentPOS[1], offT2Ypos.pos1, offT2Ypos.pos2)
    ) {
      if (!thisPlayer.hasBall) {
        thisPlayer.offside = true;
      }
    }
  }
}

function offsideYPOS(team: Team, side: unknown, pitchHeight: number) {
  const offsideYPOS = {
    pos1: 0,
    pos2: pitchHeight / 2,
  };
  for (const thisPlayer of team.players) {
    if (thisPlayer.position === `GK`) {
      const [, position1] = thisPlayer.currentPOS;
      offsideYPOS.pos1 = position1;
      if (thisPlayer.hasBall) {
        offsideYPOS.pos2 = position1;
        return offsideYPOS;
      }
    } else if (side === `top`) {
      if (thisPlayer.currentPOS[1] < offsideYPOS.pos2) {
        const [, position2] = thisPlayer.currentPOS;
        offsideYPOS.pos2 = position2;
      }
    } else if (thisPlayer.currentPOS[1] > offsideYPOS.pos2) {
      const [, position2] = thisPlayer.currentPOS;
      offsideYPOS.pos2 = position2;
    }
  }
  return offsideYPOS;
}

export {
  ballMoved,
  checkOffside,
  checkProvidedAction,
  closestPlayerActionBallX,
  closestPlayerActionBallY,
  closestPlayerToBall,
  completeMovement,
  completeSlide,
  completeTackleWhenCloseNoBall,
  decideMovement,
  getMovement,
  getRunMovement,
  getSprintMovement,
  handleBallPlayerActions,
  setClosePlayerTakesBall,
  updateInformation,
};
