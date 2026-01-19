import { checkGoalScored, resolveBallMovement } from './ballMovement.js';
import { setBPlayer } from './factories/playerFactory.js';
import { getBallDirection } from './physics.js';
import type { MatchDetails } from './types.js';

/**
 * Processes the continuation of ball movement from a previous action.
 * Refactored to comply with the 50-line limit.
 */
export function moveBall(matchDetails: MatchDetails): MatchDetails {
  const { ball } = matchDetails;

  // 1. Validation & Early Exit
  if (!ball.ballOverIterations?.length) {
    ball.direction = 'wait';

    return matchDetails;
  }

  const nextBallPos = ball.ballOverIterations[0];

  const [nbX, nbY, nbZ = 0] = nextBallPos;

  if (nextBallPos.length < 2) {
    throw new Error('Invalid ball position!');
  }

  // 2. Resolve Physics and Movement
  getBallDirection(matchDetails, nextBallPos);

  const endPos = resolveBallMovement({
    player: setBPlayer([nbX, nbY]),
    startPos: [ball.position[0], ball.position[1]],
    targetPos: [nextBallPos[0], nextBallPos[1]],
    power: nbZ,
    team: matchDetails.kickOffTeam,
    opp: matchDetails.secondTeam,
    matchDetails: matchDetails,
  });

  if (matchDetails.endIteration) {
    return matchDetails;
  }

  // 3. Finalize State
  return finalizeMomentumStep(matchDetails, endPos);
}

/**
 * Helper to update match state after a successful momentum calculation.
 */
function finalizeMomentumStep(matchDetails: MatchDetails, endPos: [number, number]): MatchDetails {
  matchDetails.ball.ballOverIterations.shift();
  matchDetails.iterationLog.push(`ball still moving from previous kick: ${endPos[0]} ${endPos[1]}`);
  matchDetails.ball.position = endPos;

  checkGoalScored(matchDetails);

  return matchDetails;
}
