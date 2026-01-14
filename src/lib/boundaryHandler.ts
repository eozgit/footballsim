import * as common from './common.js';
import {
  setLeftSecondTeamThrowIn,
  setLeftKickOffTeamThrowIn,
  setRightSecondTeamThrowIn,
  setRightKickOffTeamThrowIn,
  setSecondTeamGoalScored,
  setKickOffTeamGoalScored,
  setTopLeftCornerPositions,
  setTopGoalKick,
  setTopRightCornerPositions,
  setBottomGoalKick,
  setBottomLeftCornerPositions,
  setBottomRightCornerPositions,
} from './setPositions.js';
import type { BallPosition, MatchDetails } from './types.js';

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
    return handleTouchline(
      matchDetails,
      ballIntended,
      bXPOS,
      pitchWidth,
      isKOT,
    );
  }

  if (bYPOS < 0) {
    return handleTopByline(
      matchDetails,
      bXPOS,
      goalInfo.halfMWidth,
      goalInfo.leftPost,
      goalInfo.rightPost,
      isKOT,
      kickOffTeamSide,
    );
  }

  if (bYPOS > pitchHeight) {
    return handleBottomByline(
      matchDetails,
      bXPOS,
      goalInfo.halfMWidth,
      goalInfo.leftPost,
      goalInfo.rightPost,
      isKOT,
      kickOffTeamSide,
    );
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
) {
  const { pitchSize, kickOffTeam } = matchDetails;
  const [pitchWidth, pitchHeight, goalWidth] = pitchSize;

  const halfMWidth = pitchWidth / 2;

  return {
    isKOT: String(kickteamID) === String(kickOffTeam.teamID),
    kickOffTeamSide:
      kickOffTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom',
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
  pitchWidth: number,
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

const BYLINE_CFG = {
  top: {
    goal: (m: MatchDetails, isT: boolean) =>
      isT ? setSecondTeamGoalScored(m) : setKickOffTeamGoalScored(m),
    left: setTopLeftCornerPositions,
    right: setTopRightCornerPositions,
    kick: setTopGoalKick,
  },
  bottom: {
    goal: (m: MatchDetails, isT: boolean) =>
      isT ? setKickOffTeamGoalScored(m) : setSecondTeamGoalScored(m),
    left: setBottomLeftCornerPositions,
    right: setBottomRightCornerPositions,
    kick: setBottomGoalKick,
  },
};

function handleByline(
  side: 'top' | 'bottom',
  matchDetails: MatchDetails,
  bXPOS: number,
  halfMW: number,
  leftP: number,
  rightP: number,
  isKOT: boolean,
  kickOffTS: string,
): MatchDetails {
  const cfg = BYLINE_CFG[side],
    isT = kickOffTS === 'top';

  if (common.isBetween(bXPOS, leftP, rightP)) {
    return cfg.goal(matchDetails, isT);
  }

  const isL = bXPOS < halfMW;
  const isCorner = side === 'top' ? isKOT === isT : isKOT !== isT;

  return isCorner
    ? isL
      ? cfg.left(matchDetails)
      : cfg.right(matchDetails)
    : cfg.kick(matchDetails);
}

export const handleTopByline = (
  m: MatchDetails,
  x: number,
  w: number,
  l: number,
  r: number,
  k: boolean,
  s: string,
) => handleByline('top', m, x, w, l, r, k, s);
export const handleBottomByline = (
  m: MatchDetails,
  x: number,
  w: number,
  l: number,
  r: number,
  k: boolean,
  s: string,
) => handleByline('bottom', m, x, w, l, r, k, s);

export { resolveBallLocation };
