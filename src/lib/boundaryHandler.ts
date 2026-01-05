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

function resolveBallLocation(
  matchDetails: MatchDetails,
  kickteamID: string | number,
  ballIntended: BallPosition,
): MatchDetails {
  const { kickOffTeam } = matchDetails;
  const KOTid = kickOffTeam.teamID;
  const [pitchWidth, pitchHeight, goalWidth] = matchDetails.pitchSize;
  const halfMWidth = pitchWidth / 2;
  const leftPost = halfMWidth - goalWidth / 2;
  const rightPost = halfMWidth + goalWidth / 2;
  const [bXPOS, bYPOS] = ballIntended;
  const kickOffTeamSide =
    kickOffTeam.players[0].originPOS[1] < pitchHeight / 2 ? 'top' : 'bottom';
  const isKOT = String(kickteamID) === String(KOTid);

  // 1. Touchline Logic
  if (bXPOS < 0 || bXPOS > pitchWidth) {
    return handleTouchline(
      matchDetails,
      ballIntended,
      bXPOS,
      pitchWidth,
      isKOT,
    );
  }

  // 2. Top Byline Logic
  if (bYPOS < 0) {
    return handleTopByline(
      matchDetails,
      bXPOS,
      halfMWidth,
      leftPost,
      rightPost,
      isKOT,
      kickOffTeamSide,
    );
  }

  // 3. Bottom Byline Logic
  if (bYPOS > pitchHeight) {
    return handleBottomByline(
      matchDetails,
      bXPOS,
      halfMWidth,
      leftPost,
      rightPost,
      isKOT,
      kickOffTeamSide,
    );
  }

  matchDetails.ballIntended = ballIntended;
  return matchDetails;
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
