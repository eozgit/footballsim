import {
  checkPositionInBottomPenaltyBox,
  checkPositionInBottomPenaltyBoxClose,
  onBottomCornerBoundary,
} from './actions.js';
import * as common from './common.js';
import { handleInPenaltyBox, handleOutsidePenaltyBox } from './intent/penaltyBox.js';
import { analyzePlayerSurroundings, calculateShootingThresholds } from './intent/utils.js';
import {
  handleGKIntent,
  handleAttackingThirdIntent,
  handleMiddleThirdIntent,
  handleDefensiveThirdIntent,
} from './intent/zones.js';
import { closestPlayerToPosition } from './position/proximity.js';
import type { ActionContext, MatchEventWeights } from './types.js';

/**
 * Calculates match event weights based on attacking intent, considering
 * player position, skill, and proximity to teammates and opposition.
 * * Logic preserved: Validates positions, checks for penalty box proximity,
 * and delegates to specific handlers for penalty box vs open play.
 */
function getAttackingIntentWeights(ctx: ActionContext): MatchEventWeights {
  const { matchDetails, player, team, opp: opposition } = ctx;

  const playerPos = common.destructPos(player.currentPOS);

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Surroundings Analysis (Extracted to prevent "Canyon" growth)
  const { oppInfo, tmateProximity, oppPos } = analyzePlayerSurroundings(
    player,
    playerPos,
    team,
    opposition,
  );

  // 2. Shooting Range Calculation
  const { halfRange, fullRange } = calculateShootingThresholds(player.skill.shooting, pitchHeight);

  // 3. Delegation based on Pitch Context
  if (
    checkPositionInBottomPenaltyBoxClose({
      position: playerPos,
      pitchWidth: pitchWidth,
      pitchHeight: pitchHeight,
    })
  ) {
    const [curX, curY] = player.currentPOS;

    if (curX === 'NP') {
      throw new Error('Not playing');
    }

    return handleInPenaltyBox({
      playerInformation: oppInfo,
      tmateProximity: tmateProximity,
      currentPOS: [curX, curY],
      pos: playerPos,
      oppCurPos: oppPos,
      halfRange: halfRange,
      shotRange: fullRange,
      pitchHeight: pitchHeight,
    });
  }

  return handleOutsidePenaltyBox(oppInfo, player.currentPOS, fullRange, pitchHeight);
}

/**
 * Helper to analyze proximity of teammates and opponents.
 */

/**
 * Helper to determine shooting range thresholds based on player skill.
 */

/**
 * Utility to guard against 'NP' (No Position) states during simulation logic.
 */

/**
 * Resolves weight based on vertical pitch position (Half, Shot, or Default range).
 */

/**
 * Shared logic for choosing between "Pass to Teammate" or "Positional" weights.
 */

// Shared configuration for standard box intentions

function getPlayerActionWeights(ctx: ActionContext): MatchEventWeights {
  const { matchDetails, player, team, opp: opposition } = ctx;

  const { position, currentPOS, skill } = player;

  const pos = common.destructPos(currentPOS);

  const [, playerY] = pos;

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const playerInformation = closestPlayerToPosition(player, opposition, pos);

  // 1. Special Cases
  if (position === 'GK') {
    return handleGKIntent({ playerInfo: playerInformation });
  }

  if (onBottomCornerBoundary(pos, pitchWidth, pitchHeight)) {
    return [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0];
  }

  if (checkPositionInBottomPenaltyBox(pos, pitchWidth, pitchHeight)) {
    return getAttackingIntentWeights({ matchDetails, player, team, opp: opposition });
  }

  // 2. Vertical Zone Delegation
  // Attacking Third
  if (common.isBetween(playerY, pitchHeight * (2 / 3), pitchHeight * (5 / 6) + 5)) {
    return handleAttackingThirdIntent(playerInformation, currentPOS);
  }

  // Middle Third
  if (common.isBetween(playerY, pitchHeight / 3, pitchHeight * (2 / 3))) {
    return handleMiddleThirdIntent(playerInformation, position, skill);
  }

  // Defensive Third (Fallback)
  return handleDefensiveThirdIntent(playerInformation, position);
}

// Utility to handle the "Opposition Close vs Open Space" pattern seen in all zones

/**
 * Resolves intent weights when a player is outside the penalty box.
 * Prioritizes shooting range, then defensive pressure, then open play.
 */

/**
 * Shared logic for defensive third intentions.
 * Returns weight arrays based on pressure and player position.
 */

export { getAttackingIntentWeights, getPlayerActionWeights };
