import type { PlayerWithProximity } from './ballMovement.js';
import * as common from './common.js';
import type { Player, MatchDetails, Team } from './types.js';



/**
 * Selects the best pass option by filtering for advanced players
 * and performing weighted random sampling.
 */
function resolveBestPassOption(
  playersArray: PlayerWithProximity[],
  side: string,
  pitchHeight: number = 1050,
): PlayerWithProximity {
  // 1. Filter candidates (favoring those in the attacking half)
  const attackingHalfCandidates = playersArray.filter(
    (p) => p.proximity < pitchHeight / 2,
  );

  const tempArray =
    attackingHalfCandidates.length > 0 ? attackingHalfCandidates : playersArray;

  // 2. Initial selection
  let currentRand = common.getRandomNumber(0, tempArray.length - 1);

  let bestPlayer = tempArray[currentRand];

  /**
   * Helper to preserve the specific "best-of" logic:
   * Re-rolls the random index if the previous roll was > 5,
   * then updates the best player if the new candidate is "better" based on side.
   */
  function compareAndRefreshSelection(): void {
    if (currentRand > 5) {
      currentRand = common.getRandomNumber(0, tempArray.length - 1);
      const challenger = tempArray[currentRand];

      const isBetter =
        side === 'top'
          ? challenger.proximity > bestPlayer.proximity
          : challenger.proximity < bestPlayer.proximity;

      if (isBetter) {
        bestPlayer = challenger;
      }
    }
  }

  // The original logic performs this comparison sequence exactly twice
  compareAndRefreshSelection();
  compareAndRefreshSelection();

  return bestPlayer;
}

export function getPlayerTeam(player: Player, matchDetails: MatchDetails): { team: Team; opp: Team } {
  const isKickOff = matchDetails.kickOffTeam.players.some(p => p.playerID === player.playerID);

  return {
    team: isKickOff ? matchDetails.kickOffTeam : matchDetails.secondTeam,
    opp: isKickOff ? matchDetails.secondTeam : matchDetails.kickOffTeam
  };
}

export { resolveBestPassOption };
