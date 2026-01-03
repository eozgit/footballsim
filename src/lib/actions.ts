import * as common from './common.js';
import { isInjured } from './injury.js';
import * as setPositions from './setPositions.js';
import {
  BallPosition,
  MatchDetails,
  MatchEventWeights,
  Player,
  Skill,
  Team,
} from './types.js';

function selectAction(
  possibleActions: { name: string; points: number }[],
): string {
  let goodActions: string[] = [];
  for (const thisAction of possibleActions) {
    const tempArray = Array(thisAction.points).fill(thisAction.name);
    goodActions = goodActions.concat(tempArray);
  }
  if (goodActions[0] === null || goodActions[0] === undefined) {
    return 'wait';
  }
  return goodActions[common.getRandomNumber(0, goodActions.length - 1)];
}

function findPossActions(
  player: Player,
  team: Team,
  opposition: Team,
  ballX: number, // Changed from any
  ballY: number, // Changed from any
  matchDetails: MatchDetails,
) {
  const possibleActions: object[] = populateActionsJSON();
  const [, pitchHeight] = matchDetails.pitchSize;
  let params: unknown[] = [];
  const { hasBall, originPOS } = player;

  if (hasBall === false) {
    params = playerDoesNotHaveBall(player, ballX, ballY, matchDetails);
  } else if (originPOS[1] > pitchHeight / 2) {
    params = bottomTeamPlayerHasBall(matchDetails, player, team, opposition);
  } else {
    params = topTeamPlayerHasBall(matchDetails, player, team, opposition);
  }

  // Cast params to a tuple of 11 'any' elements to satisfy the spread requirement
  return populatePossibleActions(
    possibleActions,
    ...(params as [
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
      unknown,
    ]),
  );
}

function topTeamPlayerHasBall(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  if (player.currentPOS[0] === 'NP') {
    throw new Error('No player position!');
  }
  const playerInformation = setPositions.closestPlayerToPosition(
    player,
    opposition,
    player.currentPOS as [number, number],
  );
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const { position, currentPOS, skill } = player;
  const [playerX, playerY] = currentPOS;
  if (playerX === 'NP') {
    throw new Error('No player position!');
  }
  const pos: [number, number] = [playerX, playerY];
  if (position === 'GK' && oppositionNearContext(playerInformation, 10, 25)) {
    return [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40];
  } else if (position === 'GK') {
    return [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20];
  } else if (onBottomCornerBoundary(pos, pitchWidth, pitchHeight)) {
    return [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0];
  } else if (checkPositionInBottomPenaltyBox(pos, pitchWidth, pitchHeight)) {
    return topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
  } else if (
    common.isBetween(
      currentPOS[1],
      pitchHeight - pitchHeight / 3,
      pitchHeight - pitchHeight / 6 + 5,
    )
  ) {
    if (oppositionNearContext(playerInformation, 10, 10)) {
      return [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0];
    }
    return [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0];
  } else if (
    common.isBetween(
      currentPOS[1],
      pitchHeight / 3,
      pitchHeight - pitchHeight / 3,
    )
  ) {
    if (oppositionNearContext(playerInformation, 10, 10)) {
      return [0, 20, 30, 20, 0, 0, 20, 0, 0, 0, 10];
    } else if (skill.shooting > 85) {
      return [10, 10, 30, 0, 0, 0, 50, 0, 0, 0, 0];
    } else if (position === 'LM' || position === 'CM' || position === 'RM') {
      return [0, 10, 10, 10, 0, 0, 0, 30, 40, 0, 0];
    } else if (position === 'ST') {
      return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
    }
    return [0, 0, 10, 0, 0, 0, 0, 60, 20, 0, 10];
  } else if (oppositionNearContext(playerInformation, 10, 10)) {
    return [0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20];
  } else if (position === 'LM' || position === 'CM' || position === 'RM') {
    return [0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0];
  } else if (position === 'ST') {
    return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
  }
  return [0, 0, 40, 0, 0, 0, 0, 30, 0, 20, 10];
}

function topTeamPlayerHasBallInBottomPenaltyBox(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  if (player.currentPOS[0] === 'NP') {
    throw new Error('No player position!');
  }
  const curPOS = player.currentPOS as [number, number];
  const playerInformation = setPositions.closestPlayerToPosition(
    player,
    opposition,
    curPOS,
  );
  const ownPlayerInformation = setPositions.closestPlayerToPosition(
    player,
    team,
    curPOS,
  );
  const tmateProximity: [number, number] = [
    Math.abs(ownPlayerInformation.proxPOS[0]),
    Math.abs(ownPlayerInformation.proxPOS[1]),
  ];
  const [curX, curY] = playerInformation.thePlayer.currentPOS;
  if (curX == 'NP') {
    throw new Error('No player position!');
  }
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const { currentPOS, skill } = player;
  const [playerX, playerY] = currentPOS;
  if (playerX === 'NP') {
    throw new Error('No player position!');
  }
  const pos: [number, number] = [playerX, playerY];
  const halfRange = pitchHeight - skill.shooting / 2;
  const shotRange = pitchHeight - skill.shooting;
  if (checkPositionInBottomPenaltyBoxClose(pos, pitchWidth, pitchHeight)) {
    if (oppositionNearContext(playerInformation, 6, 6)) {
      if (checkOppositionBelow([curX, curY], pos)) {
        if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -10, 10)) {
          return [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0];
        } else if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) {
          return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        } else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
          return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
        }
        return [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0];
      } else if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
        if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) {
          return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
        } else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
          return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
        }
        return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
      } else if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) {
        return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
      } else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
        return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
      }
      return [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0];
    } else if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
      if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) {
        return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
      } else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
        return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
      }
      return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
    } else if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) {
      return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    } else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
      return [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0];
    }
    return [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0];
  } else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) {
    return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
  } else if (oppositionNearContext(playerInformation, 6, 6)) {
    return [10, 0, 70, 0, 0, 0, 0, 20, 0, 0, 0];
  }
  return [70, 0, 20, 0, 0, 0, 0, 10, 0, 0, 0];
}

function bottomTeamPlayerHasBall(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  if (player.currentPOS[0] === 'NP') {
    throw new Error('No player position!');
  }
  const curPOS = player.currentPOS as [number, number];
  const playerInformation = setPositions.closestPlayerToPosition(
    player,
    opposition,
    curPOS,
  );
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const { position, currentPOS, skill } = player;
  const [playerX, playerY] = currentPOS;
  if (playerX === 'NP') {
    throw new Error('No player position!');
  }
  const pos: [number, number] = [playerX, playerY];
  if (position === 'GK' && oppositionNearContext(playerInformation, 10, 25)) {
    return [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40];
  } else if (position === 'GK') {
    return [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20];
  } else if (onTopCornerBoundary(pos, pitchWidth)) {
    return [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0];
  } else if (checkPositionInTopPenaltyBox(pos, pitchWidth, pitchHeight)) {
    return bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
  } else if (
    common.isBetween(currentPOS[1], pitchHeight / 6 - 5, pitchHeight / 3)
  ) {
    if (oppositionNearContext(playerInformation, 10, 10)) {
      return [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0];
    }
    return [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0];
  } else if (
    common.isBetween(currentPOS[1], pitchHeight / 3, 2 * (pitchHeight / 3))
  ) {
    return bottomTeamPlayerHasBallInMiddle(playerInformation, position, skill);
  } else if (oppositionNearContext(playerInformation, 10, 10)) {
    return [0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20];
  } else if (position === 'LM' || position === 'CM' || position === 'RM') {
    return [0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0];
  } else if (position === 'ST') {
    return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
  }
  return [0, 0, 30, 0, 0, 0, 0, 50, 0, 10, 10];
}

function bottomTeamPlayerHasBallInMiddle(
  playerInformation: {
    proxPOS: number[];
    proxToBall?: number;
    thePlayer?: unknown;
  },
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
  if (player.currentPOS[0] === 'NP') {
    throw new Error('No player position!');
  }
  const curPOS = player.currentPOS as [number, number];

  const playerInformation = setPositions.closestPlayerToPosition(
    player,
    opposition,
    curPOS,
  );
  const ownPlayerInformation = setPositions.closestPlayerToPosition(
    player,
    team,
    curPOS,
  );
  const tmateProximity: [number, number] = [
    Math.abs(ownPlayerInformation.proxPOS[0]),
    Math.abs(ownPlayerInformation.proxPOS[1]),
  ];
  const closePlayerPosition = playerInformation.thePlayer.currentPOS;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const { currentPOS, skill } = player;
  const [playerX, playerY] = currentPOS;
  if (playerX === 'NP') {
    throw new Error('No player position!');
  }
  const pos: [number, number] = [playerX, playerY];
  if (checkPositionInTopPenaltyBoxClose(pos, pitchWidth, pitchHeight)) {
    if (oppositionNearContext(playerInformation, 20, 20)) {
      if (checkOppositionAhead(closePlayerPosition, currentPOS)) {
        if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -10, 10)) {
          return [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0];
        } else if (common.isBetween(currentPOS[1], 0, skill.shooting / 2)) {
          return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        } else if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
          return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
        }
        return [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0];
      } else if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
        if (common.isBetween(currentPOS[1], 0, skill.shooting / 2)) {
          return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
        } else if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
          return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
        }
        return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
      } else if (common.isBetween(currentPOS[1], 0, skill.shooting / 2)) {
        return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
      } else if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
        return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
      }
      return [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0];
    } else if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
      if (common.isBetween(currentPOS[1], 0, skill.shooting / 2)) {
        return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
      } else if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
        return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
      }
      return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
    } else if (common.isBetween(currentPOS[1], 0, skill.shooting / 2)) {
      return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    } else if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
      return [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0];
    }
    return [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0];
  } else if (common.isBetween(currentPOS[1], 0, skill.shooting)) {
    return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
  } else if (checkOppositionAhead(closePlayerPosition, currentPOS)) {
    return [20, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0];
  }
  return [50, 0, 20, 20, 0, 0, 0, 10, 0, 0, 0];
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
function oppositionNearContext(
  context: { proxPOS: number[] },
  distX: number,
  distY: number,
) {
  return (
    Math.abs(context.proxPOS[0]) < distX && Math.abs(context.proxPOS[1]) < distY
  );
}
function checkTeamMateSpaceClose(
  tmateProximity: [number, number],
  lowX: number,
  highX: number,
  lowY: number,
  highY: number,
): boolean {
  return (
    common.isBetween(tmateProximity[0], lowX, highX) &&
    common.isBetween(tmateProximity[1], lowY, highY)
  );
}

function checkOppositionAhead(
  closePlayerPosition: [number | 'NP', number],
  currentPOS: [number | 'NP', number],
): boolean {
  const [closeX, closeY] = closePlayerPosition;
  const [currentX, currentY] = currentPOS;
  if (closeX === 'NP' || currentX === 'NP') {
    throw new Error('No player position!');
  }
  const closePlyX = common.isBetween(closeX, currentX - 4, currentX + 4);
  return closePlyX && closeY < currentY;
}

function checkOppositionBelow(
  closePlayerPosition: BallPosition,
  currentPOS: BallPosition,
) {
  const closePlyX = common.isBetween(
    closePlayerPosition[0],
    currentPOS[0] - 4,
    currentPOS[0] + 4,
  );
  if (closePlyX && closePlayerPosition[1] > currentPOS[1]) {
    return true;
  }
  return false;
}

function playerDoesNotHaveBall(
  player: Player,
  ballX: number,
  ballY: number,
  matchDetails: MatchDetails,
) {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const { position, currentPOS, originPOS } = player;
  if (position === 'GK') {
    return [0, 0, 0, 0, 0, 0, 0, 60, 40, 0, 0];
  } else if (
    common.isBetween(ballX, -20, 20) &&
    common.isBetween(ballY, -20, 20)
  ) {
    return noBallNotGK2CloseBall(
      matchDetails,
      currentPOS,
      originPOS,
      pitchWidth,
      pitchHeight,
    );
  } else if (
    common.isBetween(ballX, -40, 40) &&
    common.isBetween(ballY, -40, 40)
  ) {
    return noBallNotGK4CloseBall(
      matchDetails,
      currentPOS,
      originPOS,
      pitchWidth,
      pitchHeight,
    );
  } else if (
    common.isBetween(ballX, -80, 80) &&
    common.isBetween(ballY, -80, 80)
  ) {
    if (matchDetails.ball.withPlayer === false) {
      return [0, 0, 0, 0, 0, 0, 0, 60, 40, 0, 0];
    }
    return [0, 0, 0, 0, 0, 40, 0, 30, 30, 0, 0];
  }
  return [0, 0, 0, 0, 0, 10, 0, 50, 30, 0, 0];
}

function noBallNotGK4CloseBall(
  matchDetails: MatchDetails,
  currentPOS: unknown,
  originPOS: number[],
  pitchWidth: unknown,
  pitchHeight: number,
) {
  if (originPOS[1] > pitchHeight / 2) {
    return noBallNotGK4CloseBallBottomTeam(
      matchDetails,
      currentPOS,
      pitchWidth,
      pitchHeight,
    );
  }
  if (checkPositionInTopPenaltyBox(currentPOS, pitchWidth, pitchHeight)) {
    if (matchDetails.ball.withPlayer === false) {
      return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
    }
    return [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0];
  } else if (matchDetails.ball.withPlayer === false) {
    return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
  }
  return [0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0];
}

function noBallNotGK4CloseBallBottomTeam(
  matchDetails: MatchDetails,
  currentPOS: unknown,
  pitchWidth: unknown,
  pitchHeight: number,
) {
  if (checkPositionInBottomPenaltyBox(currentPOS, pitchWidth, pitchHeight)) {
    if (matchDetails.ball.withPlayer === false) {
      return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
    }
    return [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0];
  } else if (matchDetails.ball.withPlayer === false) {
    return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
  }
  return [0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0];
}

function noBallNotGK2CloseBall(
  matchDetails: MatchDetails,
  currentPOS: unknown,
  originPOS: number[],
  pitchWidth: unknown,
  pitchHeight: number,
) {
  if (originPOS[1] > pitchHeight / 2) {
    return noBallNotGK2CloseBallBottomTeam(
      matchDetails,
      currentPOS,
      pitchWidth,
      pitchHeight,
    );
  }
  if (checkPositionInTopPenaltyBox(currentPOS, pitchWidth, pitchHeight)) {
    if (matchDetails.ball.withPlayer === false) {
      return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
    }
    return [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0];
  } else if (matchDetails.ball.withPlayer === false) {
    return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
  }
  return [0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0];
}

function noBallNotGK2CloseBallBottomTeam(
  matchDetails: MatchDetails,
  currentPOS: unknown,
  pitchWidth: unknown,
  pitchHeight: number,
) {
  if (checkPositionInBottomPenaltyBox(currentPOS, pitchWidth, pitchHeight)) {
    if (matchDetails.ball.withPlayer === false) {
      return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
    }
    return [0, 0, 0, 0, 50, 0, 10, 20, 20, 0, 0];
  }
  if (matchDetails.ball.withPlayer === false) {
    return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
  }
  return [0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0];
}

function checkPositionInBottomPenaltyBox(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
) {
  const yPos = common.isBetween(
    position[0],
    pitchWidth / 4 - 5,
    pitchWidth - pitchWidth / 4 + 5,
  );
  const xPos = common.isBetween(
    position[1],
    pitchHeight - pitchHeight / 6 + 5,
    pitchHeight,
  );
  if (yPos && xPos) {
    return true;
  }
  return false;
}

function checkPositionInBottomPenaltyBoxClose(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
) {
  const yPos = common.isBetween(
    position[0],
    pitchWidth / 3 - 5,
    pitchWidth - pitchWidth / 3 + 5,
  );
  const xPos = common.isBetween(
    position[1],
    pitchHeight - pitchHeight / 12 + 5,
    pitchHeight,
  );
  if (yPos && xPos) {
    return true;
  }
  return false;
}

function checkPositionInTopPenaltyBox(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
) {
  const xPos = common.isBetween(
    position[0],
    pitchWidth / 4 - 5,
    pitchWidth - pitchWidth / 4 + 5,
  );
  const yPos = common.isBetween(position[1], 0, pitchHeight / 6 - 5);
  if (yPos && xPos) {
    return true;
  }
  return false;
}

function checkPositionInTopPenaltyBoxClose(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
) {
  const xPos = common.isBetween(
    position[0],
    pitchWidth / 3 - 5,
    pitchWidth - pitchWidth / 3 + 5,
  );
  const yPos = common.isBetween(position[1], 0, pitchHeight / 12 - 5);
  if (yPos && xPos) {
    return true;
  }
  return false;
}

function onBottomCornerBoundary(
  position: BallPosition,
  pitchWidth: number,
  pitchHeight: number,
) {
  if (
    position[1] === pitchHeight &&
    (position[0] === 0 || position[0] === pitchWidth)
  ) {
    return true;
  }
  return false;
}

function onTopCornerBoundary(position: BallPosition, pitchWidth: number) {
  if (position[1] === 0 && (position[0] === 0 || position[0] === pitchWidth)) {
    return true;
  }
  return false;
}

function populatePossibleActions(
  possibleActions: object[11],
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
) {
  //a-shoot, b-throughBall, c-pass, d-cross, e-tackle, f-intercept
  //g-slide, h-run, i-sprint j-cleared k-boot
  possibleActions[0].points = a;
  possibleActions[1].points = b;
  possibleActions[2].points = c;
  possibleActions[3].points = d;
  possibleActions[4].points = e;
  possibleActions[5].points = f;
  possibleActions[6].points = g;
  possibleActions[7].points = h;
  possibleActions[8].points = i;
  possibleActions[9].points = j;
  possibleActions[10].points = k;
  return possibleActions;
}

function populateActionsJSON() {
  return [
    {
      name: 'shoot',
      points: 0,
    },
    {
      name: 'throughBall',
      points: 0,
    },
    {
      name: 'pass',
      points: 0,
    },
    {
      name: 'cross',
      points: 0,
    },
    {
      name: 'tackle',
      points: 0,
    },
    {
      name: 'intercept',
      points: 0,
    },
    {
      name: 'slide',
      points: 0,
    },
    {
      name: 'run',
      points: 0,
    },
    {
      name: 'sprint',
      points: 0,
    },
    {
      name: 'cleared',
      points: 0,
    },
    {
      name: 'boot',
      points: 0,
    },
  ];
}

function resolveTackle(
  player: Player,
  team: Team,
  opposition: Team,
  matchDetails: MatchDetails,
) {
  matchDetails.iterationLog.push(`Tackle attempted by: ${player.name}`);
  const tackleDetails = {
    injuryHigh: 1500,
    injuryLow: 1400,
    increment: 1,
  };
  const index = opposition.players.findIndex(function (thisPlayer: Player) {
    return thisPlayer.playerID === matchDetails.ball.Player;
  });
  let thatPlayer;
  if (index) {
    thatPlayer = opposition.players[index];
  } else {
    return false;
  }
  player.stats.tackles.total++;
  if (wasFoul(10, 18)) {
    setFoul(matchDetails, team, player, thatPlayer);
    return true;
  }
  if (
    calcTackleScore(player.skill.tackling, 5) >
    calcRetentionScore(thatPlayer.skill.tackling, 5)
  ) {
    setSuccessTackle(
      matchDetails,
      team,
      opposition,
      player,
      thatPlayer,
      tackleDetails,
    );
    return false;
  }
  setFailedTackle(matchDetails, player, thatPlayer, tackleDetails);
  return false;
}

function resolveSlide(
  player: Player,
  team: Team,
  opposition: Team,
  matchDetails: MatchDetails,
) {
  matchDetails.iterationLog.push(`Slide tackle attempted by: ${player.name}`);
  const tackleDetails = {
    injuryHigh: 1500,
    injuryLow: 1400,
    increment: 3,
  };
  const index = opposition.players.findIndex(function (thisPlayer: Player) {
    return thisPlayer.playerID === matchDetails.ball.Player;
  });
  let thatPlayer;
  if (index) {
    thatPlayer = opposition.players[index];
  } else {
    return false;
  }
  player.stats.tackles.total++;
  if (wasFoul(11, 20)) {
    setFoul(matchDetails, team, player, thatPlayer);
    return true;
  }
  if (
    calcTackleScore(player.skill.tackling, 5) >
    calcRetentionScore(thatPlayer.skill.tackling, 5)
  ) {
    setSuccessTackle(
      matchDetails,
      team,
      opposition,
      player,
      thatPlayer,
      tackleDetails,
    );
    return false;
  }
  setFailedTackle(matchDetails, player, thatPlayer, tackleDetails);
  return false;
}

function setFailedTackle(
  matchDetails: MatchDetails,
  player: Player,
  thatPlayer: unknown,
  tackleDetails: unknown,
) {
  matchDetails.iterationLog.push(`Failed tackle by: ${player.name}`);
  player.stats.tackles.off++;
  setInjury(
    matchDetails,
    player,
    thatPlayer,
    tackleDetails.injuryHigh,
    tackleDetails.injuryLow,
  );
  setPostTacklePosition(
    matchDetails,
    thatPlayer,
    player,
    tackleDetails.increment,
  );
}

function setSuccessTackle(
  matchDetails: MatchDetails,
  team: Team,
  opposition: Team,
  player: Player,
  thatPlayer: Player,
  tackleDetails: unknown,
): void {
  throw new Error('Unused or not covered.');
  setPostTackleBall(matchDetails, team, opposition, player);
  matchDetails.iterationLog.push(`Successful tackle by: ${player.name}`);
  if (player.stats.tackles.on === undefined) {
    player.stats.tackles.on = 0;
  }
  player.stats.tackles.on++;
  setInjury(
    matchDetails,
    thatPlayer,
    player,
    tackleDetails.injuryLow,
    tackleDetails.injuryHigh,
  );
  setPostTacklePosition(
    matchDetails,
    player,
    thatPlayer,
    tackleDetails.increment,
  );
}

function calcTackleScore(skill: unknown, diff: number) {
  return (
    (parseInt(skill.tackling, 10) + parseInt(skill.strength, 10)) / 2 +
    common.getRandomNumber(-diff, diff)
  );
}

function calcRetentionScore(skill: unknown, diff: number) {
  return (
    (parseInt(skill.agility, 10) + parseInt(skill.strength, 10)) / 2 +
    common.getRandomNumber(-diff, diff)
  );
}

function setPostTackleBall(
  matchDetails: MatchDetails,
  team: Team,
  opposition: Team,
  player: Player,
) {
  player.hasBall = true;
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  if (player.currentPOS[0] === 'NP') {
    throw new Error('No player position!');
  }
  matchDetails.ball.position = [player.currentPOS[0], player.currentPOS[1]];
  matchDetails.ball.Player = player.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = team.teamID;
  team.intent = 'attack';
  opposition.intent = 'defend';
}

function setPostTacklePosition(
  matchDetails: MatchDetails,
  winningPlyr: Player,
  losePlayer: Player,
  increment: number,
): void {
  const [, pitchHeight] = matchDetails.pitchSize;
  if (losePlayer.originPOS[1] > pitchHeight / 2) {
    losePlayer.currentPOS[1] = common.upToMin(
      losePlayer.currentPOS[1] - increment,
      0,
    );
    matchDetails.ball.position[1] = common.upToMin(
      matchDetails.ball.position[1] - increment,
      0,
    );
    winningPlyr.currentPOS[1] = common.upToMax(
      winningPlyr.currentPOS[1] + increment,
      pitchHeight,
    );
  } else {
    losePlayer.currentPOS[1] = common.upToMax(
      losePlayer.currentPOS[1] + increment,
      pitchHeight,
    );
    matchDetails.ball.position[1] = common.upToMax(
      matchDetails.ball.position[1] + increment,
      pitchHeight,
    );
    winningPlyr.currentPOS[1] = common.upToMin(
      winningPlyr.currentPOS[1] - increment,
      0,
    );
  }
}

function setInjury(
  matchDetails: MatchDetails,
  thatPlayer: unknown,
  player: Player,
  tackledInjury: unknown,
  tacklerInjury: unknown,
) {
  if (isInjured(tackledInjury)) {
    thatPlayer.injured = true;
    matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`);
  }
  if (isInjured(tacklerInjury)) {
    player.injured = true;
    matchDetails.iterationLog.push(`Player Injured - ${player.name}`);
  }
}

function setFoul(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
  thatPlayer: unknown,
) {
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

function wasFoul(x: unknown, y: number) {
  const foul = common.getRandomNumber(0, x);
  if (common.isBetween(foul, 0, y / 2 - 1)) {
    return true;
  }
  return false;
}

function foulIntensity() {
  return common.getRandomNumber(1, 99);
}

export {
  selectAction,
  findPossActions,
  playerDoesNotHaveBall,
  topTeamPlayerHasBall,
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
  resolveTackle,
  resolveSlide,
  calcTackleScore,
  calcRetentionScore,
  setPostTackleBall,
  setPostTacklePosition,
  setFoul,
  setInjury,
  wasFoul,
  foulIntensity,
};
