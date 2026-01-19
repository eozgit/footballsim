import { executeKickAction, resolvePassDestination } from '../kickLogic.js';
import { executePenaltyShot } from '../setPieces.js';
import type { MatchDetails, Team, Player } from '../types.js';

export function ballKicked(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
): [number, number] {
  return executeKickAction(matchDetails, team, player);
}

export function penaltyTaken(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
): [number, number] {
  return executePenaltyShot(matchDetails, team, player);
}

export function throughBall(
  matchDetails: MatchDetails,
  team: Team,
  player: Player,
): [number, number] {
  return resolvePassDestination(matchDetails, team, player);
}
