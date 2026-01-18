import type { PlayerWithProximity } from '../ballMovement.js';
import * as common from '../common.js';
import { setIntentPosition } from '../setPositions.js';
import type { Team, Player, MatchDetails } from '../types.js';

export function getPlayersInDistance(
  team: Team,
  player: Player,
  pitchSize: [number, number, number?],
): PlayerWithProximity[] {
  const [curX, curY] = player.currentPOS;

  if (curX === 'NP') {
    throw new Error('Player no position!');
  }

  const [pitchWidth, pitchHeight] = pitchSize;

  const playersInDistance: PlayerWithProximity[] = [];

  for (const teamPlayer of team.players) {
    const [tpX, tpY] = teamPlayer.currentPOS;

    if (teamPlayer.name !== player.name) {
      if (tpX === 'NP') {
        throw new Error('Team player no position!');
      }

      const onPitchX = common.isBetween(tpX, -1, pitchWidth + 1);

      const onPitchY = common.isBetween(tpY, -1, pitchHeight + 1);

      if (onPitchX && onPitchY) {
        const playerToPlayerX = curX - tpX;

        const playerToPlayerY = curY - tpY;

        const proximityToBall = Math.abs(playerToPlayerX + playerToPlayerY);

        playersInDistance.push({
          // position: [tpX, tpY] as [number, number],
          currentPOS: [tpX, tpY] as [number, number],
          proximity: proximityToBall,
          name: teamPlayer.name,
        });
      }
    }
  }

  playersInDistance.sort(function (a, b) {
    return a.proximity - b.proximity;
  });

  return playersInDistance;
}

export function closestPlayerToBall(
  closestPlayer: { name: string; position: number },
  team: Team,
  matchDetails: MatchDetails,
): void {
  let closestPlayerDetails;

  const { position } = matchDetails.ball;

  for (const thisPlayer of team.players) {
    if (thisPlayer.currentPOS[0] === 'NP') {
      throw new Error(
        `Player ${thisPlayer.name} (ID: ${thisPlayer.playerID}) is 'NP' at an active logic gate!`,
      );
    }

    const ballToPlayerX: number = Math.abs(thisPlayer.currentPOS[0] - position[0]);

    const ballToPlayerY = Math.abs(thisPlayer.currentPOS[1] - position[1]);

    const proximityToBall = ballToPlayerX + ballToPlayerY;

    if (proximityToBall < closestPlayer.position) {
      closestPlayer.name = thisPlayer.name;
      closestPlayer.position = proximityToBall;
      closestPlayerDetails = thisPlayer;
    }
  }

  if (closestPlayerDetails === undefined) {
    throw new Error('Player undefined!');
  }

  setIntentPosition(matchDetails, closestPlayerDetails);

  matchDetails.iterationLog.push(`Closest Player to ball: ${closestPlayerDetails.name}`);
}
