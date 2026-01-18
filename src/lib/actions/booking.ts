import type { MatchDetails, Team, Player } from '../types.js';

export function setFoul(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
  thatPlayer: Player,
): void {
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
