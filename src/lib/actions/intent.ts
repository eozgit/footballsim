import { oppositionNearContext } from '../actions.js';
import type { Player, MatchEventWeights } from '../types.js';

export function handleBottomGKIntent(playerInformation: {
  thePlayer?: Player;
  proxPOS: [number, number];
  proxToBall?: number;
}): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 25)) {
    return [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40];
  }

  return [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20];
}

export function handleBottomAttackingThirdIntent(playerInformation: {
  thePlayer?: Player;
  proxPOS: [number, number];
  proxToBall?: number;
}): MatchEventWeights {
  if (oppositionNearContext(playerInformation, 10, 10)) {
    return [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0];
  }

  return [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0];
}
