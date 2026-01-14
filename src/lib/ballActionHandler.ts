import * as ballMovement from './ballMovement.js';
import { ballMoved, updateInformation } from './playerMovement.js';
import type { MatchDetails, Player, Team } from './types.js';

/**
 * Orchestrates the transition of ball state based on a specific player action.
 * syncs ball to player and calculates new trajectory.
 */
function executeActiveBallAction(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  team: Team,
  opp: Team,
  action: string,
): void {
  // 1. Validate & Sync Ball to Player Position
  const [posX, posY] = thisPlayer.currentPOS;

  if (posX === 'NP' || posY === 'NP') {
    throw new Error('No player position!');
  }

  // Sync ball direction and position to player
  ballMovement.getBallDirection(matchDetails, [posX, posY]);
  matchDetails.ball.position = [posX, posY, 0]; // Sets x, y, and z (altitude) to 0

  // 2. Define Action Strategies
  // Each function returns the new position array or throws if failed
  const actionExecutionMap: Record<string, () => unknown> = {
    cleared: () => ballMovement.ballKicked(matchDetails, team, thisPlayer),
    boot: () => ballMovement.ballKicked(matchDetails, team, thisPlayer),
    pass: () => {
      const pos = ballMovement.ballPassed(matchDetails, team, thisPlayer);

      matchDetails.iterationLog.push(`passed to new position: ${pos}`);

      return pos;
    },
    cross: () => {
      const pos = ballMovement.ballCrossed(matchDetails, team, thisPlayer);

      matchDetails.iterationLog.push(`crossed to new position: ${pos}`);

      return pos;
    },
    throughBall: () => ballMovement.throughBall(matchDetails, team, thisPlayer),
    shoot: () => ballMovement.shotMade(matchDetails, team, thisPlayer),
    penalty: () => ballMovement.penaltyTaken(matchDetails, team, thisPlayer),
  };

  // 3. Execute Action
  const executeAction = actionExecutionMap[action];

  if (executeAction) {
    // Logic: Record that the ball has officially moved
    ballMoved(matchDetails, thisPlayer, team, opp);

    const newPosition = executeAction();

    // Validation & Global State Update
    if (!Array.isArray(newPosition)) {
      throw new Error(
        `Action "${action}" failed to return a valid new position!`,
      );
    }

    updateInformation(matchDetails, newPosition);
  }
}

export { executeActiveBallAction };
