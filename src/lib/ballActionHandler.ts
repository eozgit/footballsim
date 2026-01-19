import { calculateShotTarget } from './actions/ballTrajectory.js';
import { ballKicked, penaltyTaken, throughBall } from './actions/triggers.js';
import * as ballMovement from './ballMovement.js';
import * as common from './common.js';
import { getBallDirection } from './physics.js';
import { ballMoved, updateInformation } from './playerMovement.js';
import type { Ball, MatchDetails, Player, Team } from './types.js';
/**
 * Internal registry for ball actions.
 * Consolidates logging and standardizes return expectations.
 */
const ACTION_STRATEGIES: Record<string, (m: MatchDetails, t: Team, p: Player) => [number, number]> =
  {
    cleared: ballKicked,
    boot: ballKicked,
    throughBall: throughBall,
    shoot: shotMade,
    penalty: penaltyTaken,
    pass: (m: MatchDetails, t: Team, p: Player): [number, number] => {
      const pos = ballMovement.ballPassed(m, t, p);

      m.iterationLog.push(`passed to new position: ${JSON.stringify(pos)}`);

      if (!Array.isArray(pos)) {
        throw new Error('No position');
      }

      return pos;
    },
    cross: (m: MatchDetails, t: Team, p: Player): [number, number] => {
      const pos = ballCrossed(m, t, p);

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

  getBallDirection(matchDetails, [posX, posY]);
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

export function shotMade(matchDetails: MatchDetails, team: Team, player: Player): [number, number] {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  // 1. Setup & Physics
  updateLastTouchAndLog(matchDetails, team, player);
  const shotPower = common.calculatePower(player.skill.strength);

  // 2. Logic Resolution
  const isOnTarget = checkShotAccuracy(player, pitchHeight, shotPower);

  recordShotStatistics(matchDetails, player, isOnTarget);

  // 3. Coordinate Resolution
  const targetCoord = calculateShotTarget({
    player: player,
    onTarget: isOnTarget,
    width: pitchWidth,
    height: pitchHeight,
    power: shotPower,
  });

  // 4. Execution
  const endPos = ballMovement.calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    targetCoord,
    player,
  );

  ballMovement.checkGoalScored(matchDetails);

  return endPos;
}

function checkShotAccuracy(player: Player, pitchHeight: number, power: number): boolean {
  const [, playerY] = player.currentPOS;

  const isTopTeam = player.originPOS[1] < pitchHeight / 2; // Fixed logic for top/bottom

  const shotReachGoal = isTopTeam ? playerY + power >= pitchHeight : playerY - power <= 0;

  return shotReachGoal && player.skill.shooting > common.getRandomNumber(0, 40);
}

function recordShotStatistics(
  matchDetails: MatchDetails,
  player: Player,
  isOnTarget: boolean,
): void {
  const { half } = matchDetails;

  if (half === 0) {
    throw new Error(`You cannot supply 0 as a half`);
  }

  const teamStats = common.isEven(half)
    ? matchDetails.kickOffTeamStatistics
    : matchDetails.secondTeamStatistics;

  // 1. Increment Total Shots
  if (typeof teamStats.shots === 'number') {
    teamStats.shots++;
  } else {
    teamStats.shots.total++;
  }

  player.stats.shots.total++;

  // 2. Increment On/Off Target
  const status = isOnTarget ? 'on' : 'off';

  if (typeof teamStats.shots !== 'number') {
    teamStats.shots[status] = (teamStats.shots[status] || 0) + 1;
  }

  if (typeof player.stats.shots !== 'number') {
    player.stats.shots[status] = (player.stats.shots[status] || 0) + 1;
  }
}

function updateLastTouchAndLog(matchDetails: MatchDetails, team: Team, player: Player): void {
  matchDetails.iterationLog.push(`Shot Made by: ${player.name}`);
  updateLastTouch(matchDetails.ball, player, team);
}

export function updateLastTouch(ball: Ball, player: Player, team: Team): void {
  ball.lastTouch.playerName = player.name;
  ball.lastTouch.playerID = player.playerID;
  ball.lastTouch.teamID = team.teamID;
}

export function ballCrossed(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
): [number, number] {
  if (player.currentPOS[0] === 'NP') {
    throw new Error('Player no position!');
  }

  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const ballIntended: [number, number] = [0, 0];

  if (player.originPOS[1] > pitchHeight / 2) {
    ballIntended[1] = common.getRandomNumber(0, pitchHeight / 5);

    if (player.currentPOS[0] < pitchWidth / 2) {
      ballIntended[0] = common.getRandomNumber(pitchWidth / 3, pitchWidth);
    } else {
      ballIntended[0] = common.getRandomNumber(0, pitchWidth - pitchWidth / 3);
    }
  } else {
    ballIntended[1] = common.getRandomNumber(pitchHeight - pitchHeight / 5, pitchHeight);

    if (player.currentPOS[0] < pitchWidth / 2) {
      ballIntended[0] = common.getRandomNumber(pitchWidth / 3, pitchWidth);
    } else {
      ballIntended[0] = common.getRandomNumber(0, pitchWidth - pitchWidth / 3);
    }
  }

  matchDetails.iterationLog.push(`ball crossed by: ${player.name}`);
  player.stats.passes.total++;
  const result = ballMovement.calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    ballIntended,
    player,
  );

  if (!Array.isArray(result)) {
    throw new Error('No coordinates!');
  }

  return result;
}

export { executeActiveBallAction };
