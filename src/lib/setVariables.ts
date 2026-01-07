import * as common from './common.js';
import type { MatchDetails, PitchDetails, Player, Team } from './types.js';

function resetPlayerPositions(matchDetails: MatchDetails) {
  for (const player of matchDetails.kickOffTeam.players) {
    if (player.currentPOS[0] !== 'NP') {
      player.currentPOS = [...player.originPOS];
      player.intentPOS = [...player.originPOS];
    }
  }
  for (const player of matchDetails.secondTeam.players) {
    if (player.currentPOS[0] !== 'NP') {
      player.currentPOS = [...player.originPOS];
      player.intentPOS = [...player.originPOS];
    }
  }
}
function initializePlayerState(player: Player) {
  player.playerID = common.getRandomNumber(1000000000000, 999999999999999);
  if (player.currentPOS[0] === 'NP') {
    throw new Error('No player position!');
  }
  player.originPOS = [player.currentPOS[0], player.currentPOS[1]];
  player.intentPOS = [player.currentPOS[0], player.currentPOS[1]];
  player.action = `none`;
  player.offside = false;
  player.hasBall = false;
  player.stats = {
    goals: 0,
    shots: {
      total: 0,
      on: 0,
      off: 0,
    },
    cards: {
      yellow: 0,
      red: 0,
    },
    passes: {
      total: 0,
      on: 0,
      off: 0,
    },
    tackles: {
      total: 0,
      on: 0,
      off: 0,
      fouls: 0,
    },
  };
  if (player.position === 'GK') {
    player.stats.saves = 0;
  }
}
function setGameVariables(team: Team): Team {
  team.players.forEach(initializePlayerState);
  team.intent = `none`;
  team.teamID = common.getRandomNumber(1000000000000, 999999999999999);
  return team;
}

function koDecider(team1: Team, matchDetails: MatchDetails): Team {
  const playerWithBall = common.getRandomNumber(9, 10);
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.Player = team1.players[playerWithBall].playerID;
  matchDetails.ball.withTeam = team1.teamID;
  team1.intent = `attack`;
  team1.players[playerWithBall].currentPOS = [
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  ];
  team1.players[playerWithBall].intentPOS = [
    matchDetails.ball.position[0],
    matchDetails.ball.position[1],
  ];
  //team1.players[playerWithBall].currentPOS.pop();
  //team1.players[playerWithBall].intentPOS.pop();
  team1.players[playerWithBall].hasBall = true;
  matchDetails.ball.lastTouch.playerName = team1.players[playerWithBall].name;
  matchDetails.ball.lastTouch.playerID = team1.players[playerWithBall].playerID;
  matchDetails.ball.lastTouch.teamID = team1.teamID;
  matchDetails.ball.ballOverIterations = [];
  const waitingPlayer = playerWithBall === 9 ? 10 : 9;
  team1.players[waitingPlayer].currentPOS = [
    matchDetails.ball.position[0] + 20,
    matchDetails.ball.position[1],
  ];
  team1.players[waitingPlayer].intentPOS = [
    matchDetails.ball.position[0] + 20,
    matchDetails.ball.position[1],
  ];
  return team1;
}

function populateMatchDetails(
  team1: Team,
  team2: Team,
  pitchDetails: PitchDetails,
): MatchDetails {
  const teamStats = {
    goals: 0,
    shots: {
      total: 0,
      on: 0,
      off: 0,
    },
    corners: 0,
    freekicks: 0,
    penalties: 0,
    fouls: 0,
  };
  return {
    matchID: common.getRandomNumber(1000000000000, 999999999999999),
    kickOffTeam: team1,
    secondTeam: team2,
    pitchSize: [
      pitchDetails.pitchWidth,
      pitchDetails.pitchHeight,
      pitchDetails.goalWidth,
    ],
    ball: {
      position: [pitchDetails.pitchWidth / 2, pitchDetails.pitchHeight / 2, 0],
      withPlayer: true,
      Player: ``,
      withTeam: ``,
      direction: `south`,
      ballOverIterations: [],
      lastTouch: {
        playerName: ``,
        playerID: -99,
        teamID: -99,
      },
    },
    half: 1,
    kickOffTeamStatistics: structuredClone(teamStats),
    secondTeamStatistics: structuredClone(teamStats),
    iterationLog: [],
  };
}

export {
  resetPlayerPositions,
  setGameVariables,
  koDecider,
  populateMatchDetails,
};
