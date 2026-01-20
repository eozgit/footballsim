import { resolveDeflection } from './actions/deflections.js';
import { setBallMovementMatchDetails } from './ballMovement.js';
import * as common from './common.js';
import { closestPlayerToPosition } from './position/proximity.js';
import * as setPositions from './setPositions.js';
import type {
  ActionContext,
  BallPosition,
  MatchDetails,
  Player,
  PlayerProximityDetails,
  Team,
} from './types.js';

function handleGoalieSave(saveConfig: {
  matchDetails: MatchDetails;
  player: Player;
  ballPos: BallPosition;
  power: number;
  team: Team;
}): BallPosition | void {
  const { matchDetails, player, ballPos, power, team } = saveConfig;

  const [posX, posY] = common.destructPos(player.currentPOS);

  const inGoalieProx =
    common.isBetween(posX, ballPos[0] - 11, ballPos[0] + 11) &&
    common.isBetween(posY, ballPos[1] - 2, ballPos[1] + 2);

  if (inGoalieProx && common.isBetween(ballPos[2] ?? 0, -1, player.skill.jumping + 1)) {
    const savingSkill = player.skill.saving || 0;

    if (savingSkill > common.getRandomNumber(0, power)) {
      setBallMovementMatchDetails({
        matchDetails: matchDetails,
        player: player,
        startPos: [ballPos[0], ballPos[1]],
        team: team,
      });
      matchDetails.iterationLog.push(`Ball saved`);
      player.stats.saves = (player.stats.saves || 0) + 1;

      return ballPos;
    }
  }
}

function thisPlayerIsInProximity(proximityConfig: {
  matchDetails: MatchDetails;
  thisPlayer: Player;
  thisPOS: [number, number];
  thisPos: [number, number];
  power: number;
  thisTeam: Team;
}): BallPosition | void {
  const { matchDetails, thisPlayer, thisPOS, thisPos, power, thisTeam } = proximityConfig;

  const pos: [number, number, number] = [thisPos[0], thisPos[1], 0];

  return resolvePlayerBallInteraction({
    matchDetails: matchDetails,
    thisPlayer: thisPlayer,
    thisPOS: thisPOS,
    thisPos: pos,
    power: power,
    thisTeam: thisTeam,
  });
}

function resolvePlayerBallInteraction(interactionConfig: {
  matchDetails: MatchDetails;
  thisPlayer: Player;
  thisPOS: [number, number];
  thisPos: [number, number, number];
  power: number;
  thisTeam: Team;
}): BallPosition | void {
  const { matchDetails, thisPlayer, thisPOS, thisPos, power, thisTeam } = interactionConfig;

  // 1. Validation
  if (!thisPlayer) {
    throw new Error('Player is undefined!');
  }

  if (!Array.isArray(thisPlayer.currentPOS) || thisPlayer.currentPOS.length < 2) {
    throw new Error(
      `Invalid player position: ${thisPlayer.currentPOS[0]} ${thisPlayer.currentPOS[1]}`,
    );
  }

  if (thisPlayer.currentPOS[0] === 'NP') {
    throw new Error('Player no position!');
  }

  const checkPos: [number, number, number] = [
    common.round(thisPos[0], 0),
    common.round(thisPos[1], 0),
    thisPos[2],
  ];

  // 2. Resolve Interaction
  if (thisPlayer.position === 'GK') {
    return handleGoalieSave({
      matchDetails: matchDetails,
      player: thisPlayer,
      ballPos: checkPos,
      power: power,
      team: thisTeam,
    });
  }

  return handlePlayerDeflection({
    matchDetails: matchDetails,
    player: thisPlayer,
    thisPOS: thisPOS,
    ballPos: checkPos,
    power: power,
    team: thisTeam,
    opp: {} as Team,
  });
}

/**
 * Resolves ball movement by checking for player interceptions and pitch boundaries.
 * Refactored to comply with the 50-line limit by extracting the trajectory loop.
 */
export function checkInterceptionsOnTrajectory(trajectoryConfig: {
  player: Player;
  thisPOS: [number, number];
  newPOS: [number, number];
  power: number;
  team: Team;
  opp: Team;
  matchDetails: MatchDetails;
}): [number, number] {
  const { player, thisPOS, newPOS, power, team, opp } = trajectoryConfig;

  let { matchDetails } = trajectoryConfig;

  common.removeBallFromAllPlayers(matchDetails);

  // 1. Process Interceptions (Extracted)
  const trajectory = common.getBallTrajectory(thisPOS, newPOS, power);

  resolvePathInterceptions({
    trajectory: trajectory,
    originPlayer: player,
    team: team,
    opp: opp,
    matchDetails: matchDetails,
    thisPOS: thisPOS,
    power: power,
  });

  // 2. Handle Boundaries
  const lastTeam = matchDetails.ball.lastTouch.teamID;

  matchDetails = setPositions.keepInBoundaries(matchDetails, lastTeam, newPOS);

  if (matchDetails.endIteration) {
    return newPOS;
  }

  // 3. Finalize Position
  const finalPos = matchDetails.ballIntended || matchDetails.ball.position;

  delete matchDetails.ballIntended;

  return [common.round(finalPos[0], 2), common.round(finalPos[1], 2)];
}

/**
 * Iterates through the ball's path to check if any player can intercept the ball.
 */
function resolvePathInterceptions(pathConfig: {
  trajectory: [number, number, number][];
  originPlayer: Player;
  team: Team;
  opp: Team;
  matchDetails: MatchDetails;
  thisPOS: [number, number];
  power: number;
}): void {
  const { trajectory, originPlayer, team, opp, matchDetails, thisPOS, power } = pathConfig;

  for (const step of trajectory) {
    const checkPos: [number, number] = [common.round(step[0], 0), common.round(step[1], 0)];

    const p1 = closestPlayerToPosition(originPlayer, team, checkPos);

    const p2 = closestPlayerToPosition(originPlayer, opp, checkPos);

    const useP1 = compareProximity(p1, p2);

    const closestPlayer = useP1 ? p1.thePlayer : p2.thePlayer;

    const closestTeam = useP1 ? team : opp;

    if (closestPlayer) {
      thisPlayerIsInProximity({
        matchDetails: matchDetails,
        thisPlayer: closestPlayer,
        thisPOS: thisPOS,
        thisPos: [step[0], step[1]],
        power: power,
        thisTeam: closestTeam,
      });
    }
  }
}

function compareProximity(p1: PlayerProximityDetails, p2: PlayerProximityDetails): boolean {
  if (p2.proxToBall === undefined) {
    return true;
  }

  if (p1.proxToBall === undefined) {
    return false;
  }

  return p1.proxToBall >= p2.proxToBall;
}

function handlePlayerDeflection(
  deflectionConfig: ActionContext & {
    thisPOS: [number, number];
    ballPos: BallPosition;
    power: number;
  },
): [number, number] | void {
  const { matchDetails, player, thisPOS, ballPos, power, team } = deflectionConfig;

  const [posX, posY] = common.destructPos(player.currentPOS);

  const inProx =
    common.isBetween(posX, ballPos[0] - 3, ballPos[0] + 3) &&
    common.isBetween(posY, ballPos[1] - 3, ballPos[1] + 3);

  if (inProx && common.isBetween(ballPos[2] ?? 0, -1, player.skill.jumping + 1)) {
    const newPOS = resolveDeflection({
      power: power,
      startPos: thisPOS,
      defPosition: [posX, posY],
      player: player,
      team: team,
      matchDetails: matchDetails,
    });

    matchDetails.iterationLog.push(`Ball deflected`);

    return [common.round(newPOS[0], 2), common.round(newPOS[1], 2)];
  }
}
