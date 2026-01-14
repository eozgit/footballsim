import * as common from './common.js';
import { isInjured } from './injury.js';
import {
  getAttackingIntentWeights,
  getAttackingThreatWeights,
  getPlayerActionWeights,
  handleBottomAttackingThirdIntent,
  handleBottomDefensiveThirdIntent,
  handleBottomGKIntent,
} from './intentLogic.js';
import * as setPositions from './setPositions.js';
import type {
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
    const tempArray = new Array(thisAction.points).fill(thisAction.name);

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
  const possibleActions: { name: string; points: number }[] =
    populateActionsJSON();
  const [, pitchHeight] = matchDetails.pitchSize;
  let params: MatchEventWeights;
  const { hasBall, originPOS } = player;

  if (hasBall === false) {
    params = playerDoesNotHaveBall(player, ballX, ballY, matchDetails);
  } else if (originPOS[1] > pitchHeight / 2) {
    params = bottomTeamPlayerHasBall(matchDetails, player, team, opposition);
  } else {
    params = topTeamPlayerHasBall(matchDetails, player, team, opposition);
  }

  // Cast params to a tuple of 11 'any' elements to satisfy the spread requirement
  return populatePossibleActions(possibleActions, params);
}

function topTeamPlayerHasBall(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  return getPlayerActionWeights(matchDetails, player, team, opposition);
}

function topTeamPlayerHasBallInBottomPenaltyBox(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  return getAttackingIntentWeights(matchDetails, player, team, opposition);
}

function bottomTeamPlayerHasBall(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  const {
    position,
    currentPOS: [posX, posY],
    skill,
  } = player;

  if (posX === 'NP') {
    throw new Error('No player position!');
  }

  const pos = [posX, posY] as [number, number];

  const playerInformation = setPositions.closestPlayerToPosition(
    player,
    opposition,
    pos,
  );
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
): MatchEventWeights {
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
  currentPOS: [number | 'NP', number],
  originPOS: number[],
  pitchWidth: number,
  pitchHeight: number,
): MatchEventWeights {
  const [curX, curY] = currentPOS;

  if (curX === 'NP') {
    throw new Error('No player position!');
  }

  if (originPOS[1] > pitchHeight / 2) {
    return noBallNotGK4CloseBallBottomTeam(
      matchDetails,
      currentPOS,
      pitchWidth,
      pitchHeight,
    );
  }

  if (checkPositionInTopPenaltyBox([curX, curY], pitchWidth, pitchHeight)) {
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
  currentPOS: [number | 'NP', number],
  pitchWidth: number,
  pitchHeight: number,
): MatchEventWeights {
  const [curX, curY] = currentPOS;

  if (curX === 'NP') {
    throw new Error('No player position!');
  }

  if (checkPositionInBottomPenaltyBox([curX, curY], pitchWidth, pitchHeight)) {
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
  currentPOS: [number | 'NP', number],
  originPOS: number[],
  pitchWidth: number,
  pitchHeight: number,
): MatchEventWeights {
  const [curX, curY] = currentPOS;

  if (curX === 'NP') {
    throw new Error('No player position!');
  }

  if (originPOS[1] > pitchHeight / 2) {
    return noBallNotGK2CloseBallBottomTeam(
      matchDetails,
      [curX, curY],
      pitchWidth,
      pitchHeight,
    );
  }

  if (checkPositionInTopPenaltyBox([curX, curY], pitchWidth, pitchHeight)) {
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
  currentPOS: [number, number],
  pitchWidth: number,
  pitchHeight: number,
): MatchEventWeights {
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
  possibleActions: { name: string; points: number }[],
  weights: MatchEventWeights,
): { name: string; points: number }[] {
  // Use forEach to map weights to the corresponding action index
  weights.forEach((weight, index) => {
    if (possibleActions[index]) {
      possibleActions[index].points = weight;
    }
  });

  return possibleActions;
}

function populateActionsJSON(): { name: string; points: number }[] {
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
    calcTackleScore(player.skill, 5) > calcRetentionScore(thatPlayer.skill, 5)
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
  thatPlayer: Player,
  tackleDetails: { injuryHigh: number; injuryLow: number; increment: number },
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
  tackleDetails: { injuryHigh: number; injuryLow: number; increment: number },
): void {
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

function calcTackleScore(skill: Skill, diff: number) {
  return (
    (Math.floor(skill.tackling) + Math.floor(skill.strength)) / 2 +
    common.getRandomNumber(-diff, diff)
  );
}

function calcRetentionScore(skill: Skill, diff: number) {
  return (
    (Math.floor(skill.agility) + Math.floor(skill.strength)) / 2 +
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
  thatPlayer: Player,
  player: Player,
  tackledInjury: number,
  tacklerInjury: number,
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
  thatPlayer: Player,
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

function wasFoul(x: number, y: number) {
  const foul = common.getRandomNumber(0, x);

  if (common.isBetween(foul, 0, y / 2 - 1)) {
    return true;
  }

  return false;
}

function foulIntensity() {
  return common.getRandomNumber(1, 99);
}

const BALL_ACTIONS = [
  'shoot',
  'throughBall',
  'pass',
  'cross',
  'cleared',
  'boot',
  'penalty',
];
const DEFENSIVE_ACTIONS = ['tackle', 'intercept', 'slide'];
const MOVEMENT_ACTIONS = ['run', 'sprint'];
const VALID_ACTIONS = [
  ...BALL_ACTIONS,
  ...DEFENSIVE_ACTIONS,
  ...MOVEMENT_ACTIONS,
];

/**
 * Validates a player's intended action against the current match state (ball possession).
 * Resolves illegal actions to a logical alternative.
 */
function validateAndResolvePlayerAction(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  fallbackAction: string,
): string {
  const providedAction = thisPlayer.action || 'unassigned';

  // 1. Handle 'none' or 'unassigned'
  if (providedAction === 'none') {
    return fallbackAction;
  }

  // 2. Validate that the action exists in our known list
  if (!VALID_ACTIONS.includes(providedAction)) {
    throw new Error(
      `Invalid player action for ${thisPlayer.name}: ${providedAction}`,
    );
  }

  const hasBall = thisPlayer.playerID === matchDetails.ball.Player;

  // 3. Logic: Player DOES NOT have the ball
  if (!hasBall) {
    if (BALL_ACTIONS.includes(providedAction)) {
      console.error(
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

    console.error(
      `${thisPlayer.name} has the ball so cannot ${providedAction} -action: ${randomBallAction}`,
    );

    return randomBallAction;
  }

  return providedAction;
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
  oppositionNearContext,
  validateAndResolvePlayerAction,
};
