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
  const { position: ballPos, withPlayer, withTeam } = matchDetails.ball;

  for (const player of team.players) {
    if (player.currentPOS[0] === 'NP') continue;

    // 1. Determine Intent and Action
    const tacticalContext = getPlayerTacticalContext(player, ballPos);
    let action = determinePlayerAction(
      player,
      team,
      opp,
      matchDetails,
      tacticalContext,
      closestPlayer,
    );

    // 2. Execute Movement
    player.currentPOS = executePlayerMovement(
      player,
      action,
      opp,
      matchDetails,
      tacticalContext,
    );

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
  ctx: any,
  closest: any,
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
  ctx: any,
): number[] {
  const move = getMovement(player, action, opp, ctx.x, ctx.y, matchDetails);
  const newPos = completeMovement(matchDetails, player.currentPOS, move);

  if (newPos[0] === 'NP') throw new Error('No player position!');
  return newPos;
}

/**
 * Stage 3: Ball Proximity & Combat Logic
 */
function resolveBallInteractions(
  player: Player,
  team: Team,
  opp: Team,
  matchDetails: MatchDetails,
  action: string,
) {
  const { position: ballPos, withPlayer, withTeam } = matchDetails.ball;
  const isCloseX = common.isBetween(
    player.currentPOS[0],
    ballPos[0] - 3,
    ballPos[0] + 3,
  );
  const isCloseY = common.isBetween(
    player.currentPOS[1],
    ballPos[1] - 3,
    ballPos[1] + 3,
  );
  const isAtBall =
    player.currentPOS[0] === ballPos[0] && player.currentPOS[1] === ballPos[1];

  if (isCloseX && isCloseY && withTeam !== team.teamID) {
    if (withPlayer && !player.hasBall) {
      if (action === 'tackle')
        completeTackleWhenCloseNoBall(matchDetails, player, team, opp);
      if (action === 'slide') completeSlide(matchDetails, player, team, opp);
    } else {
      setClosePlayerTakesBall(matchDetails, player, team, opp);
    }
  } else if (isCloseX && isCloseY && !withPlayer) {
    setClosePlayerTakesBall(matchDetails, player, team, opp);
  }
}

function getPlayerTacticalContext(player: Player, ballPos: number[]) {
  return {
    x: player.currentPOS[0] - ballPos[0],
    y: player.currentPOS[1] - ballPos[1],
  };
}
export { processTeamTactics };
