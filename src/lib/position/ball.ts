import * as common from '../common.js';
import type { MatchDetails, BallPosition } from '../types.js';
export function updateInformation(matchDetails: MatchDetails, newPosition: BallPosition): void {
  if (matchDetails.endIteration === true) {
    return;
  }

  const [posX, posY] = newPosition;

  matchDetails.ball.position = [posX, posY];

  const { ball } = matchDetails;

  const [bx, by] = ball.position;

  common.setBallPosition(ball, bx, by, 0);
}
