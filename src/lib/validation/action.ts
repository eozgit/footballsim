import * as common from '../common.js';
import { logger } from '../logger.js';
import type { MatchDetails, Player } from '../types.js';
const BALL_ACTIONS = ['shoot', 'throughBall', 'pass', 'cross', 'cleared', 'boot', 'penalty'];

const DEFENSIVE_ACTIONS = ['tackle', 'intercept', 'slide'];

const MOVEMENT_ACTIONS = ['run', 'sprint'];

const VALID_ACTIONS = [...BALL_ACTIONS, ...DEFENSIVE_ACTIONS, ...MOVEMENT_ACTIONS];

export function validateAndResolvePlayerAction(actionConfig: {
  matchDetails: MatchDetails;
  player: Player;
  fallbackAction: string;
}): string {
  const { matchDetails, player: thisPlayer, fallbackAction } = actionConfig;

  const providedAction = thisPlayer.action || 'unassigned';

  // 1. Handle 'none' or 'unassigned'
  if (providedAction === 'none') {
    return fallbackAction;
  }

  // 2. Validate that the action exists in our known list
  if (!VALID_ACTIONS.includes(providedAction)) {
    throw new Error(`Invalid player action for ${thisPlayer.name}: ${providedAction}`);
  }

  const hasBall = thisPlayer.playerID === matchDetails.ball.Player;

  // 3. Logic: Player DOES NOT have the ball
  if (!hasBall) {
    if (BALL_ACTIONS.includes(providedAction)) {
      logger.error(
        `${thisPlayer.name} doesnt have the ball so cannot ${providedAction} -action: run`,
      );

      return 'run';
    }

    return providedAction;
  }

  // 4. Logic: Player DOES have the ball
  // If they try to do a defensive action while holding the ball, pick a random ball action
  if (DEFENSIVE_ACTIONS.includes(providedAction)) {
    const randomBallAction = BALL_ACTIONS[common.getRandomNumber(0, 5)];

    logger.error(
      `${thisPlayer.name} has the ball so cannot ${providedAction} -action: ${randomBallAction}`,
    );

    return randomBallAction;
  }

  return providedAction;
}

export function checkProvidedAction(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  action: string,
): string {
  return validateAndResolvePlayerAction({
    matchDetails: matchDetails,
    player: thisPlayer,
    fallbackAction: action,
  });
}
