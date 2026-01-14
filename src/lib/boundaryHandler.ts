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

function handleTopByline(
  matchDetails: MatchDetails,
  bXPOS: number,
  halfMWidth: number,
  leftPost: number,
  rightPost: number,
  isKOT: boolean,
  kickOffTeamSide: string,
): MatchDetails {
  if (common.isBetween(bXPOS, leftPost, rightPost)) {
    return kickOffTeamSide === 'top'
      ? setSecondTeamGoalScored(matchDetails)
      : setKickOffTeamGoalScored(matchDetails);
  }

  if (bXPOS < halfMWidth && isKOT) {
    return kickOffTeamSide === 'top'
      ? setTopLeftCornerPositions(matchDetails)
      : setTopGoalKick(matchDetails);
  }

  if (bXPOS > halfMWidth && isKOT) {
    return kickOffTeamSide === 'top'
      ? setTopRightCornerPositions(matchDetails)
      : setTopGoalKick(matchDetails);
  }

  if (bXPOS < halfMWidth && !isKOT) {
    return kickOffTeamSide === 'top'
      ? setTopGoalKick(matchDetails)
      : setTopLeftCornerPositions(matchDetails);
  }

  return kickOffTeamSide === 'top'
    ? setTopGoalKick(matchDetails)
    : setTopRightCornerPositions(matchDetails);
}

function handleBottomByline(
  matchDetails: MatchDetails,
  bXPOS: number,
  halfMWidth: number,
  leftPost: number,
  rightPost: number,
  isKOT: boolean,
  kickOffTeamSide: string,
): MatchDetails {
  if (common.isBetween(bXPOS, leftPost, rightPost)) {
    return kickOffTeamSide === 'top'
      ? setKickOffTeamGoalScored(matchDetails)
      : setSecondTeamGoalScored(matchDetails);
  }

  if (bXPOS < halfMWidth && isKOT) {
    return kickOffTeamSide === 'top'
      ? setBottomGoalKick(matchDetails)
      : setBottomLeftCornerPositions(matchDetails);
  }

  if (bXPOS > halfMWidth && isKOT) {
    return kickOffTeamSide === 'top'
      ? setBottomGoalKick(matchDetails)
      : setBottomRightCornerPositions(matchDetails);
  }

  if (bXPOS < halfMWidth && !isKOT) {
    return kickOffTeamSide === 'top'
      ? setBottomLeftCornerPositions(matchDetails)
      : setBottomGoalKick(matchDetails);
  }

  return kickOffTeamSide === 'top'
    ? setBottomRightCornerPositions(matchDetails)
    : setBottomGoalKick(matchDetails);
}

export { resolveBallLocation };
