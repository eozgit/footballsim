import { executeActiveBallAction } from './ballActionHandler.js';
import * as common from './common.js';
import { getInterceptTrajectory } from './position/trajectory.js';
import * as setPositions from './setPositions.js';
import { processTeamTactics } from './teamAi.js';
import type { ActionContext, BallPosition, MatchDetails, Player, Team } from './types.js';

function decideMovement(
  closestPlayer: { name: string; position: number },
  team: Team,
  opp: Team,
  matchDetails: MatchDetails,
): Team {
  return processTeamTactics(closestPlayer, team, opp, matchDetails);
}

function handleBallPlayerActions(ctx: ActionContext, action: string): void {
  const { matchDetails, player: thisPlayer, team, opp } = ctx;

  return executeActiveBallAction({
    matchDetails: matchDetails,
    player: thisPlayer,
    team: team,
    opp: opp,
    action: action,
  });
}

function getMovement(moveConfig: {
  player: Player;
  action: string;
  opposition: Team;
  ballX: number;
  ballY: number;
  matchDetails: MatchDetails;
}): [number, number] {
  const { player, action, opposition, ballX, ballY, matchDetails } = moveConfig;

  const { position } = matchDetails.ball;

  const ballActions = [`shoot`, `throughBall`, `pass`, `cross`, `cleared`, `boot`, `penalty`];

  if (action === `wait` || ballActions.includes(action)) {
    return [0, 0];
  } else if (action === `tackle` || action === `slide`) {
    return getTackleMovement(ballX, ballY);
  } else if (action === `intercept`) {
    return getInterceptMovement(player, opposition, position, matchDetails.pitchSize);
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
  const [x, y] = common.destructPos(player.currentPOS);

  // 2. Determine the target coordinates for interception
  const [targetX, targetY] = getInterceptPosition([x, y], opposition, ballPosition, pitchSize);

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

  return [Math.sign(deltaX), Math.sign(deltaY)];
}

function getInterceptPosition(
  currentPOS: BallPosition,
  opposition: Team,
  ballPosition: BallPosition,
  pitchSize: [number, number, number],
): BallPosition {
  const ballPlyTraj = getInterceptTrajectory(opposition, ballPosition, pitchSize);

  let closestPos: BallPosition = ballPlyTraj[0] || [0, 0];

  let shortestDiff = Infinity;

  let closestIndex = 0;

  // Single loop to find both the closest position and its index
  for (let i = 0; i < ballPlyTraj.length; i++) {
    const thisPos = ballPlyTraj[i];

    const xDiff = Math.abs(currentPOS[0] - thisPos[0]);

    const yDiff = Math.abs(currentPOS[1] - thisPos[1]);

    const totalDiff = xDiff + yDiff;

    if (totalDiff < shortestDiff) {
      shortestDiff = totalDiff;
      closestPos = thisPos;
      closestIndex = i;
    }
  }

  // Exact same logic: if already at intercept, step back one in the trajectory
  const isAtIntercept = closestPos[0] === currentPOS[0] && closestPos[1] === currentPOS[1];

  if (isAtIntercept && closestIndex > 0) {
    return ballPlyTraj[closestIndex - 1];
  }

  return closestPos;
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
  const side = player.originPOS[1] > matchDetails.pitchSize[1] / 2 ? 'bottom' : 'top';

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
function calculateFormationMovement(player: Player, runOptions: number[]): [number, number] {
  const [x, y] = player.currentPOS;

  if (x === 'NP') {
    throw new Error('No player position!');
  }

  const direction = setPositions.formationCheck(player.intentPOS, [Number(x), Number(y)]);

  const getMove = (dir: number): number => {
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
  const side = player.originPOS[1] > matchDetails.pitchSize[1] / 2 ? 'bottom' : 'top';

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
  /**
   * Helper to determine sprint intensity based on position.
   * Extracts nested logic to satisfy sonarjs/no-nested-conditional.
   */
  const getSprintValue = (pos: number): number => {
    if (common.isBetween(pos, -60, 0)) {
      return sprintOptions[common.getRandomNumber(3, 4)];
    }

    if (common.isBetween(pos, 0, 60)) {
      return sprintOptions[common.getRandomNumber(0, 1)];
    }

    return sprintOptions[2];
  };

  const move: [number, number] = [getSprintValue(ballX), getSprintValue(ballY)];

  return move;
}

// Helper: Sprinting toward formation intent
function calculateSprintFormation(player: Player, sprintOptions: number[]): [number, number] {
  const [x, y] = player.currentPOS;

  if (x === 'NP') {
    throw new Error('No player position!');
  }

  const direction = setPositions.formationCheck(player.intentPOS, [Number(x), Number(y)]);

  const getMove = (dir: number): number => {
    if (dir === 0) {
      return sprintOptions[2];
    }

    return dir < 0
      ? sprintOptions[common.getRandomNumber(0, 2)]
      : sprintOptions[common.getRandomNumber(2, 4)];
  };

  return [getMove(direction[0]), getMove(direction[1])];
}

export {
  decideMovement,
  getMovement,
  getRunMovement,
  getSprintMovement,
  handleBallPlayerActions,
  getInterceptTrajectory,
};

export { setClosePlayerTakesBall, closestPlayerToBall } from './position/proximity.js';

export { completeMovement } from './position/movement.js';

export { completeTackleWhenCloseNoBall, completeSlide } from './actions/defensiveActions.js';

export { updateInformation } from './position/ball.js';

export { closestPlayerActionBallX, closestPlayerActionBallY } from './position/proximity.js';

export { checkProvidedAction } from './validation/action.js';

export { ballMoved } from './actions/ball.js';

export { checkOffside } from './position/offside.js';
