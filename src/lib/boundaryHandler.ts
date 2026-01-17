import * as common from './common.js';
import {
  setBottomGoalKick,
  setBottomLeftCornerPositions,
  setBottomRightCornerPositions,
  setKickOffTeamGoalScored,
  setLeftKickOffTeamThrowIn,
  setLeftSecondTeamThrowIn,
  setRightKickOffTeamThrowIn,
  setRightSecondTeamThrowIn,
  setSecondTeamGoalScored,
  setTopGoalKick,
  setTopLeftCornerPositions,
  setTopRightCornerPositions,
} from './setPositions.js';
import type { BallContext, BallPosition, MatchDetails } from './types.js';

/**
 * Resolves the ball's location by checking against pitch boundaries.
 * Refactored to comply with the 50-line limit by simplifying state evaluation.
 */
function resolveBallLocation(
  matchDetails: MatchDetails,
  kickteamID: string | number,
  ballIntended: BallPosition,
): MatchDetails {
  const [bXPOS, bYPOS] = ballIntended;

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Setup Environment and Team Context (Extracted to keep under 50 lines)
  const context = getBallResolutionContext(matchDetails, kickteamID);

  const { isKOT, kickOffTeamSide, goalInfo } = context;

  // 2. Delegate to boundary handlers
  if (isOutOfBoundsX(bXPOS, pitchWidth)) {
    return handleTouchline(matchDetails, ballIntended, bXPOS, isKOT);
  }

  if (bYPOS < 0) {
    return handleTopByline({
      matchDetails: matchDetails,
      ballX: bXPOS,
      pitchWidth: goalInfo.halfMWidth,
      leftGoalPost: goalInfo.leftPost,
      rightGoalPost: goalInfo.rightPost,
      isKOT: isKOT,
      side: kickOffTeamSide,
      ball: {} as BallPosition,
    });
  }

  if (bYPOS > pitchHeight) {
    return handleBottomByline({
      matchDetails: matchDetails,
      ballX: bXPOS,
      pitchWidth: goalInfo.halfMWidth,
      leftGoalPost: goalInfo.leftPost,
      rightGoalPost: goalInfo.rightPost,
      isKOT: isKOT,
      side: kickOffTeamSide,
      ball: {} as BallPosition,
    });
  }

  // 3. In-play: Finalize movement
  matchDetails.ballIntended = ballIntended;

  return matchDetails;
}

/**
 * Helper to calculate goal posts and determine team side context.
 */
function getBallResolutionContext(
  matchDetails: MatchDetails,
  kickteamID: string | number,
): {
  isKOT: boolean;
  kickOffTeamSide: string;
  goalInfo: { halfMWidth: number; leftPost: number; rightPost: number };
} {
  const { pitchSize, kickOffTeam } = matchDetails;

  const [pitchWidth, pitchHeight, goalWidth] = pitchSize;

  const halfMWidth = pitchWidth / 2;

  return {
    isKOT: String(kickteamID) === String(kickOffTeam.teamID),
    kickOffTeamSide: kickOffTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom',
    goalInfo: {
      halfMWidth,
      leftPost: halfMWidth - goalWidth / 2,
      rightPost: halfMWidth + goalWidth / 2,
    },
  };
}

/**
 * Simple helper to check horizontal boundaries.
 */
function isOutOfBoundsX(x: number, width: number): boolean {
  return x < 0 || x > width;
}

// --- EXTRACTED HELPERS (Exact logic preserved) ---

function handleTouchline(
  matchDetails: MatchDetails,
  ballIntended: BallPosition,
  bXPOS: number,
  isKOT: boolean,
): MatchDetails {
  if (bXPOS < 0) {
    return isKOT
      ? setLeftSecondTeamThrowIn(matchDetails, ballIntended)
      : setLeftKickOffTeamThrowIn(matchDetails, ballIntended);
  }

  return isKOT
    ? setRightSecondTeamThrowIn(matchDetails, ballIntended)
    : setRightKickOffTeamThrowIn(matchDetails, ballIntended);
}

/** * 1. Define strict interfaces for the config
 */
type SetPieceHandler = (m: MatchDetails) => MatchDetails;
type GoalHandler = (m: MatchDetails, isT: boolean) => MatchDetails;

interface BylineSideConfig {
  goal: GoalHandler;
  left: SetPieceHandler;
  right: SetPieceHandler;
  kick: SetPieceHandler;
}

// Use a Record to allow indexing while maintaining strict values
const BYLINE_CFG: Record<'top' | 'bottom', BylineSideConfig> = {
  top: {
    goal: (m, isT) => (isT ? setSecondTeamGoalScored(m) : setKickOffTeamGoalScored(m)),
    left: setTopLeftCornerPositions,
    right: setTopRightCornerPositions,
    kick: setTopGoalKick,
  },
  bottom: {
    goal: (m, isT) => (isT ? setKickOffTeamGoalScored(m) : setSecondTeamGoalScored(m)),
    left: setBottomLeftCornerPositions,
    right: setBottomRightCornerPositions,
    kick: setBottomGoalKick,
  },
};

function handleByline(bylineConfig: {
  side: string; // Keep as string if it comes from external data
  matchDetails: MatchDetails;
  ballX: number;
  halfMW: number;
  leftGoalPost: number;
  rightGoalPost: number;
  isKOT: boolean;
  kickOffTS: string;
}): MatchDetails {
  const {
    side,
    matchDetails,
    ballX: bXPOS,
    halfMW,
    leftGoalPost: leftP,
    rightGoalPost: rightP,
    isKOT,
    kickOffTS,
  } = bylineConfig;

  /** * 2. Type Guard: Narrow 'side' to the allowed keys.
   * This removes the 'Unsafe assignment' and 'indexing' errors.
   */
  if (side !== 'top' && side !== 'bottom') {
    throw new Error(`Invalid byline side: ${side}`);
  }

  const cfg = BYLINE_CFG[side];

  const isT = kickOffTS === 'top';

  if (common.isBetween(bXPOS, leftP, rightP)) {
    return cfg.goal(matchDetails, isT);
  }

  const isL = bXPOS < halfMW;

  const isCorner = side === 'top' ? isKOT === isT : isKOT !== isT;

  if (isCorner) {
    return isL ? cfg.left(matchDetails) : cfg.right(matchDetails);
  }

  return cfg.kick(matchDetails);
}

export function handleTopByline(
  bylineConfig: BallContext & {
    ballX: number;
    pitchWidth: number;
    leftGoalPost: number;
    rightGoalPost: number;
    isKOT: boolean;
    side: string;
  },
): MatchDetails {
  const {
    matchDetails: m,
    ballX: x,
    pitchWidth: w,
    leftGoalPost: l,
    rightGoalPost: r,
    isKOT: k,
    side: s,
  } = bylineConfig;

  return handleByline({
    side: 'top',
    matchDetails: m,
    ballX: x,
    halfMW: w,
    leftGoalPost: l,
    rightGoalPost: r,
    isKOT: k,
    kickOffTS: s,
  });
}

export function handleBottomByline(
  bylineConfig: BallContext & {
    ballX: number;
    pitchWidth: number;
    leftGoalPost: number;
    rightGoalPost: number;
    isKOT: boolean;
    side: string;
  },
): MatchDetails {
  const {
    matchDetails: m,
    ballX: x,
    pitchWidth: w,
    leftGoalPost: l,
    rightGoalPost: r,
    isKOT: k,
    side: s,
  } = bylineConfig;

  return handleByline({
    side: 'bottom',
    matchDetails: m,
    ballX: x,
    halfMW: w,
    leftGoalPost: l,
    rightGoalPost: r,
    isKOT: k,
    kickOffTS: s,
  });
}

export { resolveBallLocation };
