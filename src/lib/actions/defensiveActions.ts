import { calcRetentionScore, setFoul, setPostTacklePosition, wasFoul } from '../actions.js';
import * as common from '../common.js';
import { isInjured } from '../injury.js';
import type {
  DefensiveActionConfig,
  MatchDetails,
  Player,
  Skill,
  TackleImpact,
  Team,
} from '../types.js';

import { setGoalieHasBall } from './possession.js';

function handleDefensiveChallenge(challengeConfig: {
  player: Player;
  team: Team;
  opp: Team;
  matchDetails: MatchDetails;
  config: DefensiveActionConfig;
}): boolean {
  const { player, team, opp: opposition, matchDetails, config } = challengeConfig;

  const { iterationLog, ball } = matchDetails;

  iterationLog.push(`${config.label} attempted by: ${player.name}`);

  // 1. Identify the ball carrier
  const opponentWithBall = opposition.players.find((p) => p.playerID === ball.Player);

  if (!opponentWithBall) {
    return false;
  }

  player.stats.tackles.total++;

  // 2. Check for foul
  if (wasFoul(...config.foulRange)) {
    setFoul(matchDetails, team, player, opponentWithBall);

    return true;
  }

  // 3. Resolve Outcome (Skill Check)
  const isSuccessful =
    calcTackleScore(player.skill, 5) > calcRetentionScore(opponentWithBall.skill, 5);

  if (isSuccessful) {
    setSuccessTackle({
      matchDetails: matchDetails,
      team: team,
      opposition: opposition,
      player: player,
      thatPlayer: opponentWithBall,
      tackleDetails: config.tackleDetails,
    });
  } else {
    setFailedTackle(matchDetails, player, opponentWithBall, config.tackleDetails);
  }

  return false;
}

export function resolveTackle(
  player: Player,
  team: Team,
  opposition: Team,
  matchDetails: MatchDetails,
): boolean {
  return handleDefensiveChallenge({
    player: player,
    team: team,
    opp: opposition,
    matchDetails: matchDetails,
    config: {
      label: 'Tackle',
      foulRange: [10, 18],
      tackleDetails: { injuryHigh: 1500, injuryLow: 1400, increment: 1 },
    },
  });
}

export function resolveSlide(tackleConfig: {
  player: Player;
  team: Team;
  opposition: Team;
  matchDetails: MatchDetails;
}): boolean {
  const { player, team, opposition, matchDetails } = tackleConfig;

  return handleDefensiveChallenge({
    player: player,
    team: team,
    opp: opposition,
    matchDetails: matchDetails,
    config: {
      label: 'Slide tackle',
      foulRange: [11, 20],
      tackleDetails: { injuryHigh: 1500, injuryLow: 1400, increment: 3 },
    },
  });
}

function setSuccessTackle(tackleConfig: {
  matchDetails: MatchDetails;
  team: Team;
  opposition: Team;
  player: Player;
  thatPlayer: Player;
  tackleDetails: TackleImpact;
}): void {
  const { matchDetails, team, opposition, player, thatPlayer, tackleDetails } = tackleConfig;

  setPostTackleBall({ matchDetails: matchDetails, team: team, opp: opposition, player: player });
  matchDetails.iterationLog.push(`Successful tackle by: ${player.name}`);

  if (player.stats.tackles.on === undefined) {
    player.stats.tackles.on = 0;
  }

  player.stats.tackles.on++;
  setInjury({
    matchDetails: matchDetails,
    thatPlayer: thatPlayer,
    player: player,
    tackledInjury: tackleDetails.injuryLow,
    tacklerInjury: tackleDetails.injuryHigh,
  });
  setPostTacklePosition({
    matchDetails: matchDetails,
    winningPlayer: player,
    losingPlayer: thatPlayer,
    increment: tackleDetails.increment,
  });
}

function setFailedTackle(
  matchDetails: MatchDetails,
  player: Player,
  thatPlayer: Player,
  tackleDetails: { injuryHigh: number; injuryLow: number; increment: number },
): void {
  matchDetails.iterationLog.push(`Failed tackle by: ${player.name}`);
  player.stats.tackles.off++;
  setInjury({
    matchDetails: matchDetails,
    thatPlayer: player,
    player: thatPlayer,
    tackledInjury: tackleDetails.injuryHigh,
    tacklerInjury: tackleDetails.injuryLow,
  });
  setPostTacklePosition({
    matchDetails: matchDetails,
    winningPlayer: thatPlayer,
    losingPlayer: player,
    increment: tackleDetails.increment,
  });
}

/** @internal - Exported for testing purposes only. Do not use in production. */
export function calcTackleScore(skill: Pick<Skill, 'tackling' | 'strength'>, diff: number): number {
  return (
    (Math.floor(skill.tackling) + Math.floor(skill.strength)) / 2 +
    common.getRandomNumber(-diff, diff)
  );
}

/** @internal - Exported for testing purposes only. Do not use in production. */
export function setPostTackleBall(tackleBallConfig: {
  matchDetails: MatchDetails;
  team: Team;
  opp: Team;
  player: Player;
}): void {
  const { matchDetails, team, opp: opposition, player } = tackleBallConfig;

  player.hasBall = true;
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;

  if (player.currentPOS[0] === 'NP') {
    throw new Error('No player position!');
  }

  matchDetails.ball.position = [player.currentPOS[0], player.currentPOS[1]];
  matchDetails.ball.Player = player.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = team.teamID;
  team.intent = 'attack';
  opposition.intent = 'defend';
}

/** @internal - Exported for testing purposes only. Do not use in production. */
export function setInjury(injuryContext: {
  matchDetails: MatchDetails;
  thatPlayer: Player;
  player: Player;
  tackledInjury: number;
  tacklerInjury: number;
}): void {
  const { matchDetails, thatPlayer, player, tackledInjury, tacklerInjury } = injuryContext;

  if (isInjured(tackledInjury)) {
    thatPlayer.injured = true;
    matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`);
  }

  if (isInjured(tacklerInjury)) {
    player.injured = true;
    matchDetails.iterationLog.push(`Player Injured - ${player.name}`);
  }
}

export function attemptGoalieSave(
  matchDetails: MatchDetails,
  goalie: Player,
  teamName: string,
): boolean {
  const [ballX, ballY] = matchDetails.ball.position;

  const ballProx = 8;

  const [goalieX, goalieY] = goalie.currentPOS;

  if (goalieX === 'NP') {
    throw new Error('No player position!');
  }

  const isNear =
    common.isBetween(ballX, goalieX - ballProx, goalieX + ballProx) &&
    common.isBetween(ballY, goalieY - ballProx, goalieY + ballProx);

  if (isNear && goalie.skill.saving > common.getRandomNumber(0, 100)) {
    setGoalieHasBall(matchDetails, goalie);

    if (
      common.inTopPenalty(matchDetails, [ballX, ballY]) ||
      common.inBottomPenalty(matchDetails, [ballX, ballY])
    ) {
      matchDetails.iterationLog.push(`ball saved by ${goalie.name} possession to ${teamName}`);
      goalie.stats.saves = (goalie.stats.saves || 0) + 1;
    }

    return true;
  }

  return false;
}
