import * as common from './common.js';
import { handleGoalieSave, handlePlayerDeflection } from './intentLogic.js';
import type { MatchDetails, Player, Team } from './types.js';

function resolvePlayerBallInteraction(
  matchDetails: MatchDetails,
  thisPlayer: Player,
  thisPOS: [number, number],
  thisPos: [number, number, number], // ball current 3D pos
  power: number,
  thisTeam: Team,
) {
  // 1. Validation
  if (!thisPlayer) throw new Error('Player is undefined!');
  if (
    !Array.isArray(thisPlayer.currentPOS) ||
    thisPlayer.currentPOS.length < 2
  ) {
    throw new Error(`Invalid player position: ${thisPlayer.currentPOS}`);
  }
  if (thisPlayer.currentPOS[0] === 'NP') throw new Error('Player no position!');

  const checkPos: [number, number, number] = [
    common.round(thisPos[0], 0),
    common.round(thisPos[1], 0),
    thisPos[2],
  ];

  // 2. Resolve Interaction
  if (thisPlayer.position === 'GK') {
    return handleGoalieSave(
      matchDetails,
      thisPlayer,
      checkPos,
      power,
      thisTeam,
    );
  }

  return handlePlayerDeflection(
    matchDetails,
    thisPlayer,
    thisPOS,
    checkPos,
    power,
    thisTeam,
  );
}

export { resolvePlayerBallInteraction };
