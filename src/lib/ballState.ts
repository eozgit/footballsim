import {
  checkGoalScored,
  getBallDirection,
  resolveBallMovement,
  setBPlayer,
} from './ballMovement.js';
import type { MatchDetails } from './types.js';

/**
 * Processes the continuation of ball movement from a previous action.
 * Refactored to comply with the 50-line limit.
 */
function processBallMomentum(matchDetails: MatchDetails): MatchDetails {
  const { ball } = matchDetails;

  // 1. Validation & Early Exit
  if (!ball.ballOverIterations?.length) {
    ball.direction = 'wait';

    return matchDetails;
  }

  const nextBallPos = ball.ballOverIterations[0];

  if (nextBallPos.length < 2) {
    throw new Error('Invalid ball position!');
  }

  // 2. Resolve Physics and Movement
  getBallDirection(matchDetails, nextBallPos);

  const endPos = resolveBallMovement(
    setBPlayer([nextBallPos[0], nextBallPos[1]]),
    ball.position,
    nextBallPos,
    nextBallPos[2], // power
    matchDetails.kickOffTeam,
    matchDetails.secondTeam,
    matchDetails,
  );

  if (matchDetails.endIteration) {
    return matchDetails;
  }

  // 3. Finalize State
  return finalizeMomentumStep(matchDetails, endPos);
}

/**
 * Helper to update match state after a successful momentum calculation.
 */
function finalizeMomentumStep(
  matchDetails: MatchDetails,
  endPos: [number, number],
): MatchDetails {
  matchDetails.ball.ballOverIterations.shift();
  matchDetails.iterationLog.push(
    `ball still moving from previous kick: ${endPos}`,
  );
  matchDetails.ball.position = endPos;

  checkGoalScored(matchDetails);

  return matchDetails;
}

export { processBallMomentum };
