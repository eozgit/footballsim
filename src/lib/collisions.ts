import { thisPlayerIsInProximity } from './ballMovement.js';
import * as common from './common.js';
import { handleGoalieSave, handlePlayerDeflection } from './intentLogic.js';
import * as setPositions from './setPositions.js';
import type { MatchDetails, Player, Team } from './types.js';

function resolvePlayerBallInteraction(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  thisPOS: [number, number],
  thisPos: [number, number, number], // ball current 3D pos
  power: number,
  thisTeam: Team,
) {
  // 1. Validation
  if (!thisPlayer) {
    throw new Error('Player is undefined!');
  }

  if (
    !Array.isArray(thisPlayer.currentPOS) ||
    thisPlayer.currentPOS.length < 2
  ) {
    throw new Error(`Invalid player position: ${thisPlayer.currentPOS}`);
  }

  if (thisPlayer.currentPOS[0] === 'NP') {
    throw new Error('Player no position!');
  }

  const checkPos: [number, number, number] = [
    common.round(thisPos[0], 0),
    common.round(thisPos[1], 0),
    thisPos[2],
  ];

  // 2. Resolve Interaction
  if (thisPlayer.position === 'GK') {
    return handleGoalieSave(
      matchDetails,
      thisPlayer,
      checkPos,
      power,
      thisTeam,
    );
  }

  return handlePlayerDeflection(
    matchDetails,
    thisPlayer,
    thisPOS,
    checkPos,
    power,
    thisTeam,
  );
}

/**
 * Resolves ball movement by checking for player interceptions and pitch boundaries.
 * Refactored to comply with the 50-line limit by extracting the trajectory loop.
 */
function checkInterceptionsOnTrajectory(
  player: Player,
  thisPOS: [number, number],
  newPOS: [number, number],
  power: number,
  team: Team,
  opp: Team,
  matchDetails: MatchDetails,
): [number, number] {
  common.removeBallFromAllPlayers(matchDetails);

  // 1. Process Interceptions (Extracted)
  const trajectory = common.getBallTrajectory(thisPOS, newPOS, power);

  resolvePathInterceptions(
    trajectory,
    player,
    team,
    opp,
    matchDetails,
    thisPOS,
    power,
  );

  // 2. Handle Boundaries
  const lastTeam = matchDetails.ball.lastTouch.teamID;

  matchDetails = setPositions.keepInBoundaries(matchDetails, lastTeam, newPOS);

  if (matchDetails.endIteration) {
    return newPOS;
  }

  // 3. Finalize Position
  const finalPos = matchDetails.ballIntended || matchDetails.ball.position;

  delete matchDetails.ballIntended;

  return [common.round(finalPos[0], 2), common.round(finalPos[1], 2)];
}

/**
 * Iterates through the ball's path to check if any player can intercept the ball.
 */
function resolvePathInterceptions(
  trajectory: unknown[],
  originPlayer: Player,
  team: Team,
  opp: Team,
  matchDetails: MatchDetails,
  thisPOS: unknown,
  power: number,
) {
  for (const step of trajectory) {
    const checkPos: [number, number] = [
      common.round(step[0], 0),
      common.round(step[1], 0),
    ];

    const p1 = setPositions.closestPlayerToPosition(
      originPlayer,
      team,
      checkPos,
    );
    const p2 = setPositions.closestPlayerToPosition(
      originPlayer,
      opp,
      checkPos,
    );

    const useP1 = p1.proxToBall >= p2.proxToBall;
    const closestPlayer = useP1 ? p1.thePlayer : p2.thePlayer;
    const closestTeam = useP1 ? team : opp;

    if (closestPlayer) {
      thisPlayerIsInProximity(
        matchDetails,
        closestPlayer,
        thisPOS,
        step,
        power,
        closestTeam,
      );
    }
  }
}

export { checkInterceptionsOnTrajectory, resolvePlayerBallInteraction };
