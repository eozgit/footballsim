import { calcBallMovementOverTime, checkGoalScored } from './ballMovement.js';
import * as common from './common.js';
import { calculatePenaltyTarget } from './setPositions.js';
import { recordShotStats } from './stats.js';
import type { MatchDetails, Player, Team } from './types.js';

function executePenaltyShot(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
) {
  // 1. Initialize State
  player.action = `none`;
  matchDetails.iterationLog.push(`Penalty Taken by: ${player.name}`);

  Object.assign(matchDetails.ball.lastTouch, {
    playerName: player.name,
    playerID: player.playerID,
    teamID: team.teamID,
  });

  // 2. Determine Outcome and Record Stats
  const isOnTarget =
    player.skill.penalty_taking > common.getRandomNumber(0, 100);
  recordShotStats(matchDetails, team, player, isOnTarget);

  // 3. Calculate Target Position
  const shotPosition = calculatePenaltyTarget(
    matchDetails.pitchSize,
    player,
    isOnTarget,
  );
  matchDetails.iterationLog.push(
    `Shot ${isOnTarget ? 'On' : 'Off'} Target at X: ${shotPosition[0]}`,
  );

  // 4. Execution & Physics
  const endPos = calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    shotPosition,
    player,
  );

  checkGoalScored(matchDetails);
  return endPos;
}

export { executePenaltyShot };
