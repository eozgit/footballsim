import * as ballMovement from './ballMovement.js';
import { ballMoved, updateInformation } from './playerMovement.js';
import type { MatchDetails, Player, Team } from './types.js';

/**
 * Internal registry for ball actions.
 * Consolidates logging and standardizes return expectations.
 */
const ACTION_STRATEGIES: Record<string, (m: MatchDetails, t: Team, p: Player) => [number, number]> =
{
  cleared: ballMovement.ballKicked,
  boot: ballMovement.ballKicked,
  throughBall: ballMovement.throughBall,
  shoot: ballMovement.shotMade,
  penalty: ballMovement.penaltyTaken,
  pass: (m: MatchDetails, t: Team, p: Player): [number, number] => {
    const pos = ballMovement.ballPassed(m, t, p);

    m.iterationLog.push(`passed to new position: ${JSON.stringify(pos)}`);

    if (!Array.isArray(pos)) {
      throw new Error('No position');
    }

    return pos;
  },
  cross: (m: MatchDetails, t: Team, p: Player): [number, number] => {
    const pos = ballMovement.ballCrossed(m, t, p);

    m.iterationLog.push(`crossed to new position: ${pos[0]} ${pos[1]}`);

    return pos;
  },
};

/**
 * Validates player position and synchronizes ball state.
 */
function syncBallToPlayer(matchDetails: MatchDetails, player: Player): [number, number] {
  const [posX, posY] = player.currentPOS;

  if (posX === 'NP') {
    throw new Error('No player position!');
  }

  ballMovement.getBallDirection(matchDetails, [posX, posY]);
  matchDetails.ball.position = [posX, posY, 0];

  return [posX, posY];
}

function executeActiveBallAction(ballActionConfig: {
  matchDetails: MatchDetails;
  player: Player;
  team: Team;
  opp: Team;
  action: string;
}): void {
  const { matchDetails, player: thisPlayer, team, opp, action } = ballActionConfig;

  syncBallToPlayer(matchDetails, thisPlayer);

  const executeAction = ACTION_STRATEGIES[action];

  if (!executeAction) {
    return;
  }

  ballMoved(matchDetails, thisPlayer, team, opp);
  const newPosition = executeAction(matchDetails, team, thisPlayer);

  if (!Array.isArray(newPosition)) {
    throw new Error(`Action "${action}" failed to return a valid new position!`);
  }

  updateInformation(matchDetails, newPosition);
}

export { executeActiveBallAction };
