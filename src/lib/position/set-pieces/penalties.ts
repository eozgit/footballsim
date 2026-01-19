import type { MatchDetails, Team } from '@/engine.js';
import * as common from '@/lib/common.js';
import { setBottomFreekick } from '@/lib/setBottomFreekicks.js';
import { setBottomPenalty } from '@/lib/setPositions.js';
import { setTopFreekick } from '@/lib/setTopFreekicks.js';

export function setSetpieceKickOffTeam(matchDetails: MatchDetails): MatchDetails {
  const [, pitchHeight] = matchDetails.pitchSize;

  const ballPosition = matchDetails.ball.position;

  const attackingTowardsTop = matchDetails.kickOffTeam.players[0].currentPOS[1] > pitchHeight / 2;

  if (
    attackingTowardsTop &&
    common.inTopPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.kickOffTeamStatistics.penalties++;
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.kickOffTeam.name}`);

    return setTopPenalty(matchDetails);
  } else if (
    attackingTowardsTop === false &&
    common.inBottomPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.kickOffTeamStatistics.penalties++;
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.kickOffTeam.name}`);

    return setBottomPenalty(matchDetails);
  } else if (attackingTowardsTop) {
    matchDetails.kickOffTeamStatistics.freekicks++;
    const [bx, by] = matchDetails.ball.position;

    matchDetails.iterationLog.push(`freekick to: ${matchDetails.kickOffTeam.name} [${bx} ${by}]`);

    return setBottomFreekick(matchDetails);
  }

  matchDetails.kickOffTeamStatistics.freekicks++;
  const [bx, by] = matchDetails.ball.position;

  matchDetails.iterationLog.push(`freekick to: ${matchDetails.kickOffTeam.name} [${bx} ${by}]`);

  return setTopFreekick(matchDetails);
}

export function setSetpieceSecondTeam(matchDetails: MatchDetails): MatchDetails {
  const [, pitchHeight] = matchDetails.pitchSize;

  const ballPosition = matchDetails.ball.position;

  const attackingTowardsTop = matchDetails.secondTeam.players[0].currentPOS[1] > pitchHeight / 2;

  if (
    attackingTowardsTop &&
    common.inTopPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.secondTeamStatistics.penalties++;
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.secondTeam.name}`);

    return setTopPenalty(matchDetails);
  } else if (
    attackingTowardsTop === false &&
    common.inBottomPenalty(matchDetails, [ballPosition[0], ballPosition[1]])
  ) {
    matchDetails.secondTeamStatistics.penalties++;
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.secondTeam.name}`);

    return setBottomPenalty(matchDetails);
  } else if (attackingTowardsTop) {
    matchDetails.secondTeamStatistics.freekicks++;
    const [bx, by] = matchDetails.ball.position;

    matchDetails.iterationLog.push(`freekick to: ${matchDetails.secondTeam.name} [${bx} ${by}]`);

    return setBottomFreekick(matchDetails);
  }

  matchDetails.secondTeamStatistics.freekicks++;
  const [bx, by] = matchDetails.ball.position;

  matchDetails.iterationLog.push(`freekick to: ${matchDetails.secondTeam.name} [${bx} ${by}]`);

  return setTopFreekicks.setTopFreekick(matchDetails);
}

export function setTopPenalty(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];

  const halfPitchSize = matchDetails.pitchSize[1] / 2;

  const attack =
    kickOffTeamKeepYPos > halfPitchSize ? matchDetails.kickOffTeam : matchDetails.secondTeam;

  const defence =
    kickOffTeamKeepYPos > halfPitchSize ? matchDetails.secondTeam : matchDetails.kickOffTeam;

  const tempArray: [number, number] = [pitchWidth / 2, pitchHeight / 6];

  const shootArray: [number, number] = [pitchWidth / 2, common.round(pitchHeight / 17.5, 0)];

  common.setPlayerPos(defence.players[0], [...defence.players[0].originPOS]);
  setPlayerPenaltyPositions(tempArray, attack, defence);
  setBallSpecificPenaltyValue(matchDetails, shootArray, attack);
  matchDetails.ball.direction = `north`;
  attack.intent = `attack`;
  defence.intent = `defend`;
  matchDetails.endIteration = true;

  return matchDetails;
}

export function setBottomPenalty(matchDetails: MatchDetails): MatchDetails {
  common.removeBallFromAllPlayers(matchDetails);
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;

  const kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1];

  const halfPitchSize = matchDetails.pitchSize[1] / 2;

  const attack =
    kickOffTeamKeepYPos > halfPitchSize ? matchDetails.secondTeam : matchDetails.kickOffTeam;

  const defence =
    kickOffTeamKeepYPos > halfPitchSize ? matchDetails.kickOffTeam : matchDetails.secondTeam;

  const tempArray: [number, number] = [pitchWidth / 2, pitchHeight - pitchHeight / 6];

  const shootArray: [number, number] = [
    pitchWidth / 2,
    pitchHeight - common.round(pitchHeight / 17.5, 0),
  ];

  common.setPlayerPos(defence.players[0], [...defence.players[0].originPOS]);
  setPlayerPenaltyPositions(tempArray, attack, defence);
  setBallSpecificPenaltyValue(matchDetails, shootArray, attack);
  matchDetails.ball.direction = `south`;
  attack.intent = `attack`;
  defence.intent = `defend`;
  matchDetails.endIteration = true;

  return matchDetails;
}

function setPlayerPenaltyPositions(tempArray: [number, number], attack: Team, defence: Team): void {
  let oppxpos = -10;

  let teamxpos = -9;

  for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    if (num !== 10) {
      if (attack.players[num].currentPOS[0] !== 'NP') {
        common.setPlayerXY(attack.players[num], tempArray[0] + teamxpos, tempArray[1]);
      }
    }

    if (defence.players[num].currentPOS[0] !== 'NP') {
      common.setPlayerXY(defence.players[num], tempArray[0] + oppxpos, tempArray[1]);
    }

    oppxpos += 2;
    teamxpos += 2;
  }
}

function setBallSpecificPenaltyValue(
  matchDetails: MatchDetails,
  shootArray: [number, number],
  attack: Team,
): void {
  common.setPlayerPos(attack.players[0], [...attack.players[0].originPOS]);
  common.setPlayerPos(attack.players[10], [...shootArray]);
  attack.players[10].hasBall = true;
  attack.players[10].action = `penalty`;
  matchDetails.ball.lastTouch.playerName = attack.players[10].name;
  matchDetails.ball.lastTouch.playerID = attack.players[10].playerID;
  matchDetails.ball.lastTouch.teamID = attack.teamID;

  // Tests expect 2D array in certain assertions even though Ball is 3D
  matchDetails.ball.position = [shootArray[0], shootArray[1]];

  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.Player = attack.players[10].playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = attack.teamID;
}
