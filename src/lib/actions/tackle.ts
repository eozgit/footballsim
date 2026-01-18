import * as common from '../common.js';
import type { MatchDetails, Player } from '../types.js';

export function setPostTacklePosition(postTackleConfig: {
  matchDetails: MatchDetails;
  winningPlayer: Player;
  losingPlayer: Player;
  increment: number;
}): void {
  const {
    matchDetails,
    winningPlayer: winningPlyr,
    losingPlayer: losePlayer,
    increment,
  } = postTackleConfig;

  const [, pitchHeight] = matchDetails.pitchSize;

  if (losePlayer.originPOS[1] > pitchHeight / 2) {
    common.setPlayerXY(
      losePlayer,
      losePlayer.currentPOS[0],
      common.upToMin(losePlayer.currentPOS[1] - increment, 0),
    );
    const { ball } = matchDetails;

    const [bx, , bz] = ball.position;

    const by = common.upToMin(matchDetails.ball.position[1] - increment, 0);

    common.setBallPosition(ball, bx, by, bz);
    common.setPlayerXY(
      winningPlyr,
      winningPlyr.currentPOS[0],
      common.upToMax(winningPlyr.currentPOS[1] + increment, pitchHeight),
    );
  } else {
    common.setPlayerXY(
      losePlayer,
      losePlayer.currentPOS[0],
      common.upToMax(losePlayer.currentPOS[1] + increment, pitchHeight),
    );
    const { ball } = matchDetails;

    const [bx, , bz] = ball.position;

    const by = common.upToMax(matchDetails.ball.position[1] + increment, pitchHeight);

    common.setBallPosition(ball, bx, by, bz);
    common.setPlayerXY(
      winningPlyr,
      winningPlyr.currentPOS[0],
      common.upToMin(winningPlyr.currentPOS[1] - increment, 0),
    );
  }
}
