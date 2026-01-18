import * as common from './common.js';
import {
  getAttackingIntentWeights,
  getAttackingThreatWeights,
  handleBottomAttackingThirdIntent,
  handleBottomDefensiveThirdIntent,
  handleBottomGKIntent,
} from './intentLogic.js';
import * as setPositions from './setPositions.js';
import type {
  BallPosition,
  PlayerProximityDetails,
  MatchDetails,
  MatchEventWeights,
  Player,
  ProximityContext,
  Skill,
  Team,
  AreaBounds,
  TacticalWeighting,
} from './types.js';

function selectAction(possibleActions: { name: string; points: number }[]): string {
  let goodActions: string[] = [];

  for (const thisAction of possibleActions) {
    const tempArray = new Array(thisAction.points).fill(thisAction.name);

    goodActions = goodActions.concat(tempArray);
  }

  // If the linter knows it can't be null, simplify to a truthiness check
  // or check specifically for undefined.
  if (!goodActions[0]) {
    return 'run';
  }

  return goodActions[common.getRandomNumber(0, goodActions.length - 1)];
}

function topTeamPlayerHasBallInBottomPenaltyBox(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  return getAttackingIntentWeights({ matchDetails, player, team, opp: opposition });
}

function bottomTeamPlayerHasBall(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  const { position, currentPOS, skill } = player;

  const pos = common.destructPos(currentPOS);

  const [, posY] = pos;

  const playerInformation = setPositions.closestPlayerToPosition(player, opposition, pos);

  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Specialized Position / Boundary Logic
  if (position === 'GK') {
    return handleBottomGKIntent(playerInformation);
  }

  if (onTopCornerBoundary(pos, pitchWidth)) {
    return [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0];
  }

  if (checkPositionInTopPenaltyBox(pos, pitchWidth, pitchHeight)) {
    return getAttackingThreatWeights(matchDetails, player, team, opposition);
  }

  // 2. Zone-based Delegation (Bottom Team specific Y-coordinates)
  // Attacking Third
  if (common.isBetween(posY, pitchHeight / 6 - 5, pitchHeight / 3)) {
    return handleBottomAttackingThirdIntent(playerInformation);
  }

  // Middle Third
  if (common.isBetween(posY, pitchHeight / 3, 2 * (pitchHeight / 3))) {
    return bottomTeamPlayerHasBallInMiddle(playerInformation, position, skill);
  }

  // 3. Defensive Third (Fallback)
  return handleBottomDefensiveThirdIntent(playerInformation, position);
}

function bottomTeamPlayerHasBallInMiddle(
  playerInformation: PlayerProximityDetails,
  position: string,
  skill: Skill,
): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 10)) {
    return [0, 20, 30, 20, 0, 0, 0, 20, 0, 0, 10];
  } else if (skill.shooting > 85) {
    return [10, 10, 30, 0, 0, 0, 0, 50, 0, 0, 0];
  } else if (position === 'LM' || position === 'CM' || position === 'RM') {
    return [0, 10, 10, 10, 0, 0, 0, 30, 40, 0, 0];
  } else if (position === 'ST') {
    return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
  }

  return [0, 0, 10, 0, 0, 0, 0, 60, 20, 0, 10];
}

function bottomTeamPlayerHasBallInTopPenaltyBox(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  return getAttackingThreatWeights(matchDetails, player, team, opposition);
}

function oppositionNearPlayer(
  oppositionPlayer: { proxPOS: [number, number] },
  spaceX: number,
  spaceY: number,
): boolean {
  const oppositionProximity = [
    Math.abs(oppositionPlayer.proxPOS[0]),
    Math.abs(oppositionPlayer.proxPOS[1]),
  ];

  return oppositionProximity[0] < spaceX && oppositionProximity[1] < spaceY;
}

function oppositionNearContext(context: ProximityContext, distX: number, distY: number): boolean {
  return Math.abs(context.proxPOS[0]) < distX && Math.abs(context.proxPOS[1]) < distY;
}

function checkTeamMateSpaceClose(spaceConfig: AreaBounds & { tmateProximity: number[] }): boolean {
  const { tmateProximity, lowX, highX, lowY, highY } = spaceConfig;

  return (
    common.isBetween(tmateProximity[0], lowX, highX) &&
    common.isBetween(tmateProximity[1], lowY, highY)
  );
}

function checkOppositionAhead(
  closePlayerPosition: readonly [number | 'NP', number],
  currentPOS: readonly [number | 'NP', number],
): boolean {
  const [closeX, closeY] = common.destructPos(closePlayerPosition);

  const [currentX, currentY] = common.destructPos(currentPOS);

  const closePlyX = common.isBetween(closeX, currentX - 4, currentX + 4);

  return closePlyX && closeY < currentY;
}

function checkOppositionBelow(
  closePlayerPosition: BallPosition,
  currentPOS: BallPosition,
): boolean {
  const closePlyX = common.isBetween(closePlayerPosition[0], currentPOS[0] - 4, currentPOS[0] + 4);

  return closePlyX && closePlayerPosition[1] > currentPOS[1];
}

function noBallNotGK4CloseBallBottomTeam(
  matchDetails: MatchDetails,
  currentPOS: [number | 'NP', number],
  pitchWidth: number,
  pitchHeight: number,
): MatchEventWeights {
  const curPos = common.destructPos(currentPOS);

  return resolveNoBallNotGKIntent({
    matchDetails: matchDetails,
    currentPOS: curPos,
    pitchWidth: pitchWidth,
    pitchHeight: pitchHeight,
    isBottomTeam: true,
    weights: {
      inBox: [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0],
      fallback: [0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0],
    },
  });
}

function noBallNotGK2CloseBallBottomTeam(
  matchDetails: MatchDetails,
  currentPOS: [number, number],
  pitchWidth: number,
  pitchHeight: number,
): MatchEventWeights {
  return resolveNoBallNotGKIntent({
    matchDetails: matchDetails,
    currentPOS: currentPOS,
    pitchWidth: pitchWidth,
    pitchHeight: pitchHeight,
    isBottomTeam: true,
    weights: {
      inBox: [0, 0, 0, 0, 50, 0, 10, 20, 20, 0, 0],
      fallback: [0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0],
    },
  });
}

/**
 * Shared logic for non-goalkeeper players near the ball.
 * Handles both proximity ranges and team-specific penalty box checks.
 */
function resolveNoBallNotGKIntent(intentConfig: {
  matchDetails: MatchDetails;
  currentPOS: [number, number];
  pitchWidth: number;
  pitchHeight: number;
  isBottomTeam: boolean;
  weights: TacticalWeighting;
}): MatchEventWeights {
  const { matchDetails, currentPOS, pitchWidth, pitchHeight, isBottomTeam, weights } = intentConfig;

  const curPos = common.destructPos(currentPOS);

  const inPenaltyBox = isBottomTeam
    ? checkPositionInBottomPenaltyBox(curPos, pitchWidth, pitchHeight)
    : checkPositionInTopPenaltyBox(curPos, pitchWidth, pitchHeight);

  // 1. Ball is loose
  if (matchDetails.ball.withPlayer === false) {
    return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
  }

  // 2. Ball is with a player - In Penalty Box
  if (inPenaltyBox) {
    return weights.inBox;
  }

  // 3. Ball is with a player - Outside Box
  return weights.fallback;
}

function noBallNotGK4CloseBall(positionConfig: {
  matchDetails: MatchDetails;
  currentPOS: [number, number];
  originPOS: [number, number];
  pitchWidth: number;
  pitchHeight: number;
}): MatchEventWeights {
  const { matchDetails, currentPOS, originPOS, pitchWidth, pitchHeight } = positionConfig;

  const isBottomTeam = originPOS[1] > pitchHeight / 2;

  return resolveNoBallNotGKIntent({
    matchDetails: matchDetails,
    currentPOS: currentPOS,
    pitchWidth: pitchWidth,
    pitchHeight: pitchHeight,
    isBottomTeam: isBottomTeam,
    weights: {
      inBox: [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0],
      fallback: [0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0],
    },
  });
}

function noBallNotGK2CloseBall(positionConfig: {
  matchDetails: MatchDetails;
  currentPOS: [number, number];
  originPOS: [number, number];
  pitchWidth: number;
  pitchHeight: number;
}): MatchEventWeights {
  const { matchDetails, currentPOS, originPOS, pitchWidth, pitchHeight } = positionConfig;

  const isBottomTeam = originPOS[1] > pitchHeight / 2;

  const [curX, curY] = currentPOS;

  // Note: GK2 Bottom Team had a slightly different weight for 'inBox' in your original logic.
  // We preserve that unique branching here.
  const inBoxWeights: MatchEventWeights = isBottomTeam
    ? [0, 0, 0, 0, 50, 0, 10, 20, 20, 0, 0] // Original unique value for GK2 Bottom Team
    : [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0];

  return resolveNoBallNotGKIntent({
    matchDetails: matchDetails,
    currentPOS: [curX, curY],
    pitchWidth: pitchWidth,
    pitchHeight: pitchHeight,
    isBottomTeam: isBottomTeam,
    weights: {
      inBox: inBoxWeights,
      fallback: [0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0],
    },
  });
}

function checkPositionInBottomPenaltyBox(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
): boolean {
  const yPos = common.isBetween(position[0], pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 5);

  const xPos = common.isBetween(position[1], pitchHeight - pitchHeight / 6 + 5, pitchHeight);

  return yPos && xPos;
}

function checkPositionInBottomPenaltyBoxClose(penaltyBoxConfig: {
  position: [number, number];
  pitchWidth: number;
  pitchHeight: number;
}): boolean {
  const { position, pitchWidth, pitchHeight } = penaltyBoxConfig;

  const yPos = common.isBetween(position[0], pitchWidth / 3 - 5, pitchWidth - pitchWidth / 3 + 5);

  const xPos = common.isBetween(position[1], pitchHeight - pitchHeight / 12 + 5, pitchHeight);

  return yPos && xPos;
}

function checkPositionInTopPenaltyBox(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
): boolean {
  const xPos = common.isBetween(position[0], pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 5);

  const yPos = common.isBetween(position[1], 0, pitchHeight / 6 - 5);

  return yPos && xPos;
}

function checkPositionInTopPenaltyBoxClose(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
): boolean {
  const xPos = common.isBetween(position[0], pitchWidth / 3 - 5, pitchWidth - pitchWidth / 3 + 5);

  const yPos = common.isBetween(position[1], 0, pitchHeight / 12 - 5);

  return yPos && xPos;
}

function onBottomCornerBoundary(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
): boolean {
  return position[1] === pitchHeight && (position[0] === 0 || position[0] === pitchWidth);
}

function onTopCornerBoundary(position: BallPosition, pitchWidth: number): boolean {
  return position[1] === 0 && (position[0] === 0 || position[0] === pitchWidth);
}

/**
 * Unified handler for all defensive challenges (Stand and Slide)
 */

function calcRetentionScore(skill: Pick<Skill, 'agility' | 'strength'>, diff: number): number {
  return (
    (Math.floor(skill.agility) + Math.floor(skill.strength)) / 2 +
    common.getRandomNumber(-diff, diff)
  );
}

function setFoul(matchDetails: MatchDetails, team: Team, player: Player, thatPlayer: Player): void {
  matchDetails.iterationLog.push(`Foul against: ${thatPlayer.name}`);

  if (player.stats.tackles.fouls === undefined) {
    player.stats.tackles.fouls = 0;
  }

  player.stats.tackles.fouls++;

  if (team.teamID === matchDetails.kickOffTeam.teamID) {
    matchDetails.kickOffTeamStatistics.fouls++;
  } else {
    matchDetails.secondTeamStatistics.fouls++;
  }
}

function wasFoul(x: number, y: number): boolean {
  const foul = common.getRandomNumber(0, x);

  return common.isBetween(foul, 0, y / 2 - 1);
}

function foulIntensity(): number {
  return common.getRandomNumber(1, 99);
}

/**
 * Validates a player's intended action against the current match state (ball possession).
 * Resolves illegal actions to a logical alternative.
 */

export {
  selectAction,
  topTeamPlayerHasBallInBottomPenaltyBox,
  bottomTeamPlayerHasBall,
  bottomTeamPlayerHasBallInMiddle,
  bottomTeamPlayerHasBallInTopPenaltyBox,
  noBallNotGK2CloseBall,
  noBallNotGK2CloseBallBottomTeam,
  noBallNotGK4CloseBall,
  noBallNotGK4CloseBallBottomTeam,
  oppositionNearPlayer,
  checkTeamMateSpaceClose,
  checkOppositionAhead,
  checkOppositionBelow,
  checkPositionInTopPenaltyBox,
  checkPositionInTopPenaltyBoxClose,
  onBottomCornerBoundary,
  onTopCornerBoundary,
  checkPositionInBottomPenaltyBox,
  checkPositionInBottomPenaltyBoxClose,
  calcRetentionScore,
  setFoul,
  wasFoul,
  foulIntensity,
  oppositionNearContext,
};
export { findPossActions } from './actions/findPossActions.js';
export { setPostTacklePosition } from './actions/tackle.js';

export { validateAndResolvePlayerAction } from './validation/action.js';
