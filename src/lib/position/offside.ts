import * as common from '../common.js'
import type { MatchDetails, Player, Team } from '../types.js';

export function offsideYPOS(
  team: Team,
  side: unknown,
  pitchHeight: number,
): { pos1: number; pos2: number } {
  const offsideYPOS = {
    pos1: 0,
    pos2: pitchHeight / 2,
  };

  for (const thisPlayer of team.players) {
    if (thisPlayer.position === `GK`) {
      const [, position1] = thisPlayer.currentPOS;

      offsideYPOS.pos1 = position1;

      if (thisPlayer.hasBall) {
        offsideYPOS.pos2 = position1;

        return offsideYPOS;
      }
    } else if (side === `top`) {
      if (thisPlayer.currentPOS[1] < offsideYPOS.pos2) {
        const [, position2] = thisPlayer.currentPOS;

        offsideYPOS.pos2 = position2;
      }
    } else if (thisPlayer.currentPOS[1] > offsideYPOS.pos2) {
      const [, position2] = thisPlayer.currentPOS;

      offsideYPOS.pos2 = position2;
    }
  }

  return offsideYPOS;
}

type Side = 'top' | 'bottom';

export function checkOffside(
  team1: Team,
  team2: Team,
  matchDetails: MatchDetails,
): MatchDetails | undefined {
  const { ball } = matchDetails;

  const { pitchSize } = matchDetails;

  const team1side = team1.players[0].originPOS[1] < pitchSize[1] / 2 ? `top` : `bottom`;

  if (!ball.withTeam) {
    return matchDetails;
  }

  if (team1side === `bottom`) {
    team1atBottom(team1, team2, pitchSize[1]);
  } else {
    team1atTop(team1, team2, pitchSize[1]);
  }
}



function team1atBottom(team1: Team, team2: Team, pitchHeight: number): void {
  if (updateOffside(team1, team2, 'top', pitchHeight)) {
    return;
  }

  updateOffside(team2, team1, 'bottom', pitchHeight);
}

function team1atTop(team1: Team, team2: Team, pitchHeight: number): void {
  if (updateOffside(team1, team2, 'bottom', pitchHeight)) {
    return;
  }

  updateOffside(team2, team1, 'top', pitchHeight);
}

function updateOffside(team: Team, opponent: Team, attackSide: Side, pitchHeight: number): boolean {
  const offsideLines = offsideYPOS(opponent, attackSide, pitchHeight);

  // Original logic uses pos1/pos2 vs pos2/pos1 based on side
  const [min, max] =
    attackSide === 'top'
      ? [offsideLines.pos1, offsideLines.pos2]
      : [offsideLines.pos2, offsideLines.pos1];

  const leadPlayer =
    attackSide === 'top' ? getTopMostPlayer(team, pitchHeight) : getBottomMostPlayer(team);

  if (!leadPlayer) {
    throw new Error(`${attackSide === 'top' ? 'Top' : 'Bottom'} player is undefined`);
  }

  // Early return: If the player furthest forward is in an offside position AND has the ball
  if (common.isBetween(leadPlayer.currentPOS[1], min, max) && leadPlayer.hasBall) {
    return true;
  }

  for (const p of team.players) {
    p.offside = !p.hasBall && common.isBetween(p.currentPOS[1], min, max);
  }

  return false;
}



function getTopMostPlayer(team: Team, pitchHeight: number): Player | undefined {
  let player;

  for (const thisPlayer of team.players) {
    let topMostPosition: number = pitchHeight;

    const [, plyrX] = thisPlayer.currentPOS;

    if (thisPlayer.currentPOS[1] < topMostPosition) {
      topMostPosition = plyrX;
      player = thisPlayer;
    }
  }

  return player;
}

function getBottomMostPlayer(team: Team): Player | undefined {
  let player;

  for (const thisPlayer of team.players) {
    let topMostPosition = 0;

    const [, plyrX] = thisPlayer.currentPOS;

    if (thisPlayer.currentPOS[1] > topMostPosition) {
      topMostPosition = plyrX;
      player = thisPlayer;
    }
  }

  return player;
}
