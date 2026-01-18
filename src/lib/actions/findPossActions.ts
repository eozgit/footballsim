import { bottomTeamPlayerHasBall, noBallNotGK2CloseBall, noBallNotGK4CloseBall } from "../actions.js";
import * as common from '../common.js'
import { getPlayerActionWeights } from "../intentLogic.js";
import { getPlayerTeam } from "../playerSelectors.js";
import type { Player, MatchDetails, MatchEventWeights, Team } from "../types.js";

export function findPossActions(
  player: Player,
  matchDetails: MatchDetails,
): { name: string; points: number }[] {
  const { team, opp: opposition } = getPlayerTeam(player, matchDetails);

  const [ballX, ballY] = matchDetails.ball.position;

  const possibleActions: { name: string; points: number }[] = populateActionsJSON();

  const [, pitchHeight] = matchDetails.pitchSize;

  let params: MatchEventWeights;

  const { hasBall, originPOS } = player;

  if (hasBall === false) {
    params = playerDoesNotHaveBall(player, ballX, ballY, matchDetails);
  } else if (originPOS[1] > pitchHeight / 2) {
    params = bottomTeamPlayerHasBall(matchDetails, player, team, opposition);
  } else {
    params = topTeamPlayerHasBall(matchDetails, player, team, opposition);
  }

  // Cast params to a tuple of 11 'any' elements to satisfy the spread requirement
  return populatePossibleActions(possibleActions, params);
}

/** @internal - Exported for testing purposes only. Do not use in production. */
export function topTeamPlayerHasBall(
  matchDetails: MatchDetails,
  player: Player,
  team: Team,
  opposition: Team,
): MatchEventWeights {
  return getPlayerActionWeights({ matchDetails, player, team, opp: opposition });
}

/** @internal - Exported for testing purposes only. Do not use in production. */
export function playerDoesNotHaveBall(
  player: Player,
  ballX: number,
  ballY: number,
  matchDetails: MatchDetails,
): MatchEventWeights {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const { position, currentPOS, originPOS } = player;

  const curPos = common.destructPos(currentPOS);

  if (position === 'GK') {
    return [0, 0, 0, 0, 0, 0, 0, 60, 40, 0, 0];
  } else if (common.isBetween(ballX, -20, 20) && common.isBetween(ballY, -20, 20)) {
    return noBallNotGK2CloseBall({
      matchDetails: matchDetails,
      currentPOS: curPos,
      originPOS: originPOS,
      pitchWidth: pitchWidth,
      pitchHeight: pitchHeight,
    });
  } else if (common.isBetween(ballX, -40, 40) && common.isBetween(ballY, -40, 40)) {
    return noBallNotGK4CloseBall({
      matchDetails: matchDetails,
      currentPOS: curPos,
      originPOS: originPOS,
      pitchWidth: pitchWidth,
      pitchHeight: pitchHeight,
    });
  } else if (common.isBetween(ballX, -80, 80) && common.isBetween(ballY, -80, 80)) {
    if (matchDetails.ball.withPlayer === false) {
      return [0, 0, 0, 0, 0, 0, 0, 60, 40, 0, 0];
    }

    return [0, 0, 0, 0, 0, 40, 0, 30, 30, 0, 0];
  }

  return [0, 0, 0, 0, 0, 10, 0, 50, 30, 0, 0];
}


function populatePossibleActions(
  possibleActions: { name: string; points: number }[],
  weights: MatchEventWeights,
): { name: string; points: number }[] {
  // Use forEach to map weights to the corresponding action index
  weights.forEach((weight, index) => {
    if (possibleActions[index]) {
      possibleActions[index].points = weight;
    }
  });

  return possibleActions;
}



function populateActionsJSON(): { name: string; points: number }[] {
  return [
    {
      name: 'shoot',
      points: 0,
    },
    {
      name: 'throughBall',
      points: 0,
    },
    {
      name: 'pass',
      points: 0,
    },
    {
      name: 'cross',
      points: 0,
    },
    {
      name: 'tackle',
      points: 0,
    },
    {
      name: 'intercept',
      points: 0,
    },
    {
      name: 'slide',
      points: 0,
    },
    {
      name: 'run',
      points: 0,
    },
    {
      name: 'sprint',
      points: 0,
    },
    {
      name: 'cleared',
      points: 0,
    },
    {
      name: 'boot',
      points: 0,
    },
  ];
}
