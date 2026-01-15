import * as common from './common.js';
import type { MatchDetails, Player, TeamStatistics } from './types.js';

/**
 * Updates both team and player shot statistics
 */
function recordShotStats(
  matchDetails: MatchDetails,
  player: Player,
  isOnTarget: boolean,
): void {
  const getStats = (half: number): TeamStatistics => {
    if (half === 0) {
      throw new Error(`You cannot supply 0 as a half`);
    }

    return common.isEven(half)
      ? matchDetails.kickOffTeamStatistics
      : matchDetails.secondTeamStatistics;
  };

  const teamStats = getStats(matchDetails.half);

  const entities = [teamStats, player.stats];

  entities.forEach((entity) => {
    if (typeof entity.shots !== 'number') {
      // Increment Total
      entity.shots.total = (entity.shots.total || 0) + 1;

      // Increment On/Off Target
      if (isOnTarget) {
        entity.shots.on = (entity.shots.on || 0) + 1;
      } else {
        entity.shots.off = (entity.shots.off || 0) + 1;
      }
    }
  });
}

export { recordShotStats };
