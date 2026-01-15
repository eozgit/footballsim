import * as actions from './actions.js';
import * as common from './common.js';
import {
  checkProvidedAction,
  closestPlayerActionBallX,
  closestPlayerActionBallY,
  completeMovement,
  completeSlide,
  completeTackleWhenCloseNoBall,
  getMovement,
  handleBallPlayerActions,
  setClosePlayerTakesBall,
} from './playerMovement.js';
import type { MatchDetails, Player, Team } from './types.js';

/**
 * Orchestrates the tactical loop for a team.
 * Refactored to separate action selection, movement, and ball resolution.
 */
function processTeamTactics(
  closestPlayer: { name: string; position: number },
  team: Team,
  opp: Team,
  matchDetails: MatchDetails,
): Team {
  const {
    position: [ballX, ballY],
  } = matchDetails.ball;

  for (const player of team.players) {
    if (player.currentPOS[0] === 'NP') {
      continue;
    }

    // 1. Determine Intent and Action
    const tacticalContext = getPlayerTacticalContext(player, [ballX, ballY]);
    const action = determinePlayerAction(
      player,
      team,
      opp,
      matchDetails,
      tacticalContext,
      closestPlayer,
    );

    // 2. Execute Movement
    const pos = executePlayerMovement(
      player,
      action,
      opp,
      matchDetails,
      tacticalContext,
    );

    common.setPlayerXY(player, pos[0], player.currentPOS[1]);
    common.setPlayerXY(player, player.currentPOS[0], pos[1]);

    // 3. Resolve Ball Interactions (Possession/Tackles)
    resolveBallInteractions(player, team, opp, matchDetails, action);

    if (player.hasBall) {
      handleBallPlayerActions(matchDetails, player, team, opp, action);
    }
  }

  return team;
}

/**
 * Stage 1: Action Selection Logic
 */
function determinePlayerAction(
  player: Player,
  team: Team,
  opp: Team,
  matchDetails: MatchDetails,
  ctx: { x: number; y: number },
  closest: { name: string; position: number },
): string {
  const possibleActions = actions.findPossActions(
    player,
    team,
    opp,
    ctx.x,
    ctx.y,
    matchDetails,
  );
  let action = actions.selectAction(possibleActions);

  action = checkProvidedAction(matchDetails, player, action);

  const isClosestDefender =
    matchDetails.ball.withTeam &&
    matchDetails.ball.withTeam !== team.teamID &&
    closest.name === player.name;

  if (isClosestDefender) {
    if (!['tackle', 'slide', 'intercept'].includes(action)) {
      action = 'sprint';
    }

    ctx.x = closestPlayerActionBallX(ctx.x);
    ctx.y = closestPlayerActionBallY(ctx.y);
  }

  return action;
}

/**
 * Stage 2: Physical Movement
 */
function executePlayerMovement(
  player: Player,
  action: string,
  opp: Team,
  matchDetails: MatchDetails,
  ctx: { x: number; y: number },
): [number, number] {
  const move = getMovement(player, action, opp, ctx.x, ctx.y, matchDetails);
  const newPos = completeMovement(matchDetails, player, move);
  const [newX, newY] = newPos;

  if (newX === 'NP') {
    throw new Error('No player position!');
  }

  return [newX, newY];
}

/**
 * Stage 3: Ball Proximity & Combat Logic
 * Resolves physical interactions between a player and the ball.
 * Logic preserved: Checks proximity (3-unit radius), team possession,
 * and specific defensive actions (tackle/slide).
 */
export function resolveBallInteractions(
  player: Player,
  team: Team,
  opp: Team,
  matchDetails: MatchDetails,
  action: string,
): void {
  const { ball } = matchDetails;
  const [playerX, playerY] = player.currentPOS;

  // 1. Position Validation
  if (playerX === 'NP') {
    throw new Error('No player position!');
  }

  // 2. Proximity Check (3-unit square radius)
  const isNearBall =
    common.isBetween(playerX, ball.position[0] - 3, ball.position[0] + 3) &&
    common.isBetween(playerY, ball.position[1] - 3, ball.position[1] + 3);

  if (!isNearBall) {
    return;
  }

  // 3. Logic for Ball Retrieval or Defensive Action
  // Case A: Ball is loose (no player has it)
  if (!ball.withPlayer) {
    setClosePlayerTakesBall(matchDetails, player, team, opp);

    return;
  }

  // Case B: Ball is with another team
  if (ball.withTeam !== team.teamID) {
    // If player doesn't have the ball, they can attempt to steal it
    if (!player.hasBall) {
      if (action === 'tackle') {
        completeTackleWhenCloseNoBall(matchDetails, player, team, opp);

        return;
      }

      if (action === 'slide') {
        completeSlide(matchDetails, player, team, opp);

        return;
      }
    }

    // Default fallback for proximity with opposing team (e.g. general interception/take)
    setClosePlayerTakesBall(matchDetails, player, team, opp);
  }
}

function getPlayerTacticalContext(player: Player, ballPos: number[]) {
  const [curX, curY] = player.currentPOS;

  if (curX === 'NP') {
    throw new Error('No player position!');
  }

  return {
    x: curX - ballPos[0],
    y: curY - ballPos[1],
  };
}

export { processTeamTactics };
