import { expect, it, describe } from 'vitest';
import { Player } from '../lib/types.js';

import actions from '../lib/actions.js';
import { createPlayer } from '../lib/ballMovement.js';

import { readMatchDetails } from './lib/utils.js';

describe('testPositionInTopBox()', function () {
  it('Inside Top Box Test', async () => {
    let inPosition = actions.checkPositionInTopPenaltyBox([330, 10], 680, 1050);
    expect(inPosition).to.be.eql(true);
    inPosition = actions.checkPositionInTopPenaltyBox([300, 100], 680, 1050);
    expect(inPosition).to.be.eql(true);
  });
  it('Outside Top Box Left', async () => {
    const inPosition = actions.checkPositionInTopPenaltyBox(
      [10, 10],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
  it('Outside Top Box Right', async () => {
    const inPosition = actions.checkPositionInTopPenaltyBox(
      [660, 100],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
  it('Outside Top Box Below', async () => {
    const inPosition = actions.checkPositionInTopPenaltyBox(
      [300, 1000],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
});
describe('testPositionInTopClose()', function () {
  it('Inside Top Box Close Test', async () => {
    let inPosition = actions.checkPositionInTopPenaltyBoxClose(
      [330, 10],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(true);
    inPosition = actions.checkPositionInTopPenaltyBoxClose(
      [300, 50],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(true);
  });
  it('Outside Top Box Close Left', async () => {
    const inPosition = actions.checkPositionInTopPenaltyBoxClose(
      [10, 10],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
  it('Outside Top Box Close Right', async () => {
    const inPosition = actions.checkPositionInTopPenaltyBoxClose(
      [660, 100],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
  it('Outside Top Box Close Below', async () => {
    const inPosition = actions.checkPositionInTopPenaltyBoxClose(
      [300, 1000],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
});
describe('testPositionInBottomBox()', function () {
  it('Inside Bottom Box Close Test', async () => {
    let inPosition = actions.checkPositionInBottomPenaltyBox(
      [345, 1010],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(true);
    inPosition = actions.checkPositionInBottomPenaltyBox([295, 975], 680, 1050);
    expect(inPosition).to.be.eql(true);
  });
  it('Inside Bottom Box Close Left', async () => {
    const inPosition = actions.checkPositionInBottomPenaltyBox(
      [1, 1010],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
  it('Inside Bottom Box Close Right', async () => {
    const inPosition = actions.checkPositionInBottomPenaltyBox(
      [677, 1040],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
  it('Inside Bottom Box Close Above', async () => {
    const inPosition = actions.checkPositionInBottomPenaltyBox(
      [677, 500],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
});
describe('testPositionInBottomBoxClose()', function () {
  it('Inside Bottom Box Test', async () => {
    let inPosition = actions.checkPositionInBottomPenaltyBoxClose(
      [345, 1010],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(true);
    inPosition = actions.checkPositionInBottomPenaltyBoxClose(
      [295, 975],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(true);
  });
  it('Inside Bottom Box Left', async () => {
    const inPosition = actions.checkPositionInBottomPenaltyBoxClose(
      [1, 1010],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
  it('Inside Bottom Box Right', async () => {
    const inPosition = actions.checkPositionInBottomPenaltyBoxClose(
      [677, 1040],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
  it('Inside Bottom Box Above', async () => {
    const inPosition = actions.checkPositionInBottomPenaltyBoxClose(
      [677, 500],
      680,
      1050,
    );
    expect(inPosition).to.be.eql(false);
  });
});
describe('noBallNotGK2CloseBallBottomTeam()', function () {
  it('Nobody has the ball, not GK, in bottom Goal (own), run or sprint towards the ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = false;
    const parameters = actions.noBallNotGK2CloseBallBottomTeam(
      matchDetails,
      [320, 1000],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('A Player has the ball, not GK, in bottom Goal (own), tackle, slide, run or sprint', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = true;
    const parameters = actions.noBallNotGK2CloseBallBottomTeam(
      matchDetails,
      [320, 1000],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 50, 0, 10, 20, 20, 0, 0]);
  });
  it('A Player has the ball, not GK, not in bottom Goal (own), run or sprint towards the ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = false;
    const parameters = actions.noBallNotGK2CloseBallBottomTeam(
      matchDetails,
      [15, 500],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('A Player has the ball, not GK, not in bottom Goal (own), tackle, intercept and slide', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = true;
    const parameters = actions.noBallNotGK2CloseBallBottomTeam(
      matchDetails,
      [604, 485],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0]);
  });
});
describe('noBallNotGK4CloseBallBottomTeam()', function () {
  it('Nobody has the ball, not GK, in bottom Goal (own), run or sprint towards the ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = false;
    const parameters = actions.noBallNotGK4CloseBallBottomTeam(
      matchDetails,
      [320, 1000],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('A Player has the ball, not GK, in bottom Goal (own), tackle, slide, run or sprint', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = true;
    const parameters = actions.noBallNotGK4CloseBallBottomTeam(
      matchDetails,
      [320, 1000],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0]);
  });
  it('A Player has the ball, not GK, not in bottom Goal (own), run or sprint towards the ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = false;
    const parameters = actions.noBallNotGK4CloseBallBottomTeam(
      matchDetails,
      [15, 500],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('A Player has the ball, not GK, not in bottom Goal (own), tackle slide', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = true;
    const parameters = actions.noBallNotGK4CloseBallBottomTeam(
      matchDetails,
      [604, 485],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0]);
  });
});
describe('noBallNotGK2CloseBall()', function () {
  it('Nobody has the ball, not GK, in top Goal (own), run or sprint towards the ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = false;
    const parameters = actions.noBallNotGK2CloseBall(
      matchDetails,
      [320, 15],
      [320, 5],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('Player has the ball, not GK, in top Goal (own), tackle, slide, run or sprint', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = true;
    const parameters = actions.noBallNotGK2CloseBall(
      matchDetails,
      [320, 15],
      [320, 5],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0]);
  });
  it('Player has the ball, not GK, in top Goal (not own), tackle, intercept and slide', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = true;
    const parameters = actions.noBallNotGK2CloseBall(
      matchDetails,
      [320, 15],
      [320, 805],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0]);
  });
  it('Nobody has the ball, not GK, not in top Goal (own), run or sprint towards the ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = false;
    const parameters = actions.noBallNotGK2CloseBall(
      matchDetails,
      [320, 300],
      [320, 5],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('Player has the ball, not GK, not in top Goal (own), tackle, intercept and slide', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = true;
    const parameters = actions.noBallNotGK2CloseBall(
      matchDetails,
      [320, 300],
      [320, 5],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0]);
  });
});
describe('noBallNotGK4CloseBall()', function () {
  it('Nobody has the ball, not GK, in top Goal (own), run or sprint towards the ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = false;
    const parameters = actions.noBallNotGK4CloseBall(
      matchDetails,
      [320, 15],
      [320, 5],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('Player has the ball, not GK, in top Goal (own), tackle, slide, run or sprint', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = true;
    const parameters = actions.noBallNotGK4CloseBall(
      matchDetails,
      [320, 15],
      [320, 5],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0]);
  });
  it('Player has the ball, not GK, in top Goal (not own), tackle slide', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = true;
    const parameters = actions.noBallNotGK4CloseBall(
      matchDetails,
      [320, 15],
      [320, 805],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0]);
  });
  it('Nobody has the ball, not GK, not in top Goal (own), run or sprint towards the ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = false;
    const parameters = actions.noBallNotGK4CloseBall(
      matchDetails,
      [320, 300],
      [320, 5],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('Player has the ball, not GK, not in top Goal (own), tackle slide', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.ball.withPlayer = true;
    const parameters = actions.noBallNotGK4CloseBall(
      matchDetails,
      [320, 300],
      [320, 5],
      680,
      1050,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0]);
  });
});
describe('playerDoesNotHaveBall()', function () {
  it('Goalkeeper - run, sprint', async () => {
    const player: Player = createPlayer('GK');

    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.pitchSize = [680, 1050, 90];
    matchDetails.ball.withPlayer = false;

    const parameters = actions.playerDoesNotHaveBall(
      player,
      0,
      1,
      matchDetails,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 60, 40, 0, 0]);
  });
  it('Defender - within 2', async () => {
    const player = createPlayer('LB');

    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.pitchSize = [680, 1050, 90];
    matchDetails.ball.withPlayer = false;
    const parameters = actions.playerDoesNotHaveBall(
      player,
      0,
      1,
      matchDetails,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('Midfielder - within 4', async () => {
    const player = createPlayer('CM');
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.pitchSize = [680, 1050, 90];
    matchDetails.ball.withPlayer = false;
    const parameters = actions.playerDoesNotHaveBall(
      player,
      3,
      3,
      matchDetails,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('Midfielder - within 20 - No Player has ball - run sprint', async () => {
    const player = createPlayer('CM');
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.pitchSize = [680, 1050, 90];
    matchDetails.ball.withPlayer = false;
    const parameters = actions.playerDoesNotHaveBall(
      player,
      15,
      12,
      matchDetails,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]);
  });
  it('Midfielder - within 20 - No Player has ball - intercept run sprint', async () => {
    const player = createPlayer('CM');
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.pitchSize = [680, 1050, 90];
    matchDetails.ball.withPlayer = true;
    const parameters = actions.playerDoesNotHaveBall(
      player,
      15,
      12,
      matchDetails,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0]);
  });
  it('Striker - over 20 - No Player has ball - intercept run sprint', async () => {
    const player = createPlayer('ST');
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    matchDetails.pitchSize = [680, 1050, 90];
    matchDetails.ball.withPlayer = true;
    const parameters = actions.playerDoesNotHaveBall(
      player,
      105,
      88,
      matchDetails,
    );
    expect(parameters).to.be.eql([0, 0, 0, 0, 0, 10, 0, 50, 30, 0, 0]);
  });
});
describe('onTopCornerBoundary()', function () {
  it('Is on top left corner boundary', async () => {
    const isOnBoundary = actions.onTopCornerBoundary([0, 0], 680);
    expect(isOnBoundary).to.be.eql(true);
  });
  it('Is on top right corner boundary', async () => {
    const isOnBoundary = actions.onTopCornerBoundary([680, 0], 680);
    expect(isOnBoundary).to.be.eql(true);
  });
  it('Is not on any top corner boundary', async () => {
    let isOnBoundary = actions.onTopCornerBoundary([4, 680], 680);
    expect(isOnBoundary).to.be.eql(false);
    isOnBoundary = actions.onTopCornerBoundary([0, 600], 680);
    expect(isOnBoundary).to.be.eql(false);
    isOnBoundary = actions.onTopCornerBoundary([100, 600], 680);
    expect(isOnBoundary).to.be.eql(false);
  });
});
describe('onBottomCornerBoundary()', function () {
  it('Is on bottom left corner boundary', async () => {
    const isOnBoundary = actions.onBottomCornerBoundary([0, 1050], 680, 1050);
    expect(isOnBoundary).to.be.eql(true);
  });
  it('Is on bottom right corner boundary', async () => {
    const isOnBoundary = actions.onBottomCornerBoundary([680, 1050], 680, 1050);
    expect(isOnBoundary).to.be.eql(true);
  });
  it('Is not on any bottom corner boundary', async () => {
    let isOnBoundary = actions.onBottomCornerBoundary([4, 680], 680, 1050);
    expect(isOnBoundary).to.be.eql(false);
    isOnBoundary = actions.onBottomCornerBoundary([0, 600], 680, 1050);
    expect(isOnBoundary).to.be.eql(false);
    isOnBoundary = actions.onBottomCornerBoundary([100, 600], 680, 1050);
    expect(isOnBoundary).to.be.eql(false);
  });
});
describe('checkOppositionAhead()', function () {
  it('Opposition is in front left of player', async () => {
    const ahead = actions.checkOppositionAhead([335, 5], [337, 8]);
    expect(ahead).to.be.eql(true);
  });
  it('Opposition is in front right of player', async () => {
    const ahead = actions.checkOppositionAhead([340, 5], [337, 8]);
    expect(ahead).to.be.eql(true);
  });
  it('Opposition is not in front', async () => {
    let ahead = actions.checkOppositionAhead([337, 680], [337, 8]);
    expect(ahead).to.be.eql(false);
    ahead = actions.checkOppositionAhead([330, 8], [337, 8]);
    expect(ahead).to.be.eql(false);
    ahead = actions.checkOppositionAhead([342, 1], [337, 8]);
    expect(ahead).to.be.eql(false);
  });
});
describe('checkOppositionBelow()', function () {
  it('Opposition is in front left of player', async () => {
    const ahead = actions.checkOppositionBelow([335, 12], [337, 8]);
    expect(ahead).to.be.eql(true);
  });
  it('Opposition is in front right of player', async () => {
    const ahead = actions.checkOppositionBelow([340, 12], [337, 8]);
    expect(ahead).to.be.eql(true);
  });
  it('Opposition is not in front', async () => {
    let ahead = actions.checkOppositionBelow([337, 3], [337, 608]);
    expect(ahead).to.be.eql(false);
    ahead = actions.checkOppositionBelow([330, 8], [337, 608]);
    expect(ahead).to.be.eql(false);
    ahead = actions.checkOppositionBelow([342, 1], [337, 608]);
    expect(ahead).to.be.eql(false);
  });
});
describe('checkTeamMateProximity()', function () {
  it('Team mate is in proximity 1 - true', async () => {
    const close = actions.checkTeamMateSpaceClose([1, 1], -3, 3, -5, 5);
    expect(close).to.be.eql(true);
  });
  it('Team mate is in proximity 2 - true', async () => {
    const close = actions.checkTeamMateSpaceClose([-3, 3], -4, 4, -5, 5);
    expect(close).to.be.eql(true);
  });
  it('Team mate is in proximity 3 - false', async () => {
    const close = actions.checkTeamMateSpaceClose([-8, 1], -7, 3, -5, 5);
    expect(close).to.be.eql(false);
  });
  it('Team mate is in proximity 4 - false', async () => {
    const close = actions.checkTeamMateSpaceClose([1, 11], -10, 10, -10, 10);
    expect(close).to.be.eql(false);
  });
});
describe('checkPlayerIsDistanceFromPosition()', function () {
  it('Player Within Space X&Y', async () => {
    const playerInformation = { proxPOS: [7, 9] };
    const close = actions.oppositionNearPlayer(playerInformation, 10, 10);
    expect(close).to.be.eql(true);
  });
  it('Player Within Space X&Y - decimals', async () => {
    const playerInformation = { proxPOS: [7.8984, 9.666666667] };
    const close = actions.oppositionNearPlayer(playerInformation, 10, 10);
    expect(close).to.be.eql(true);
  });
  it('Player Within Space X, notY', async () => {
    const playerInformation = { proxPOS: [7, 12] };
    const close = actions.oppositionNearPlayer(playerInformation, 10, 10);
    expect(close).to.be.eql(false);
  });
  it('Player not within Space X, is for Y', async () => {
    const playerInformation = { proxPOS: [13.11, 4] };
    const close = actions.oppositionNearPlayer(playerInformation, 10, 10);
    expect(close).to.be.eql(false);
  });
  it('Player not within Space XY', async () => {
    const playerInformation = { proxPOS: [30.23, 30.23] };
    const close = actions.oppositionNearPlayer(playerInformation, 30, 30);
    expect(close).to.be.eql(false);
  });
});
describe('bottomTeamPlayerHasBallInTopPenaltyBox()', function () {
  it('Top Box Close, not within space of goal, no opposition, no team mate, half/shooting skill from goal', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0]);
  });
  it('Top Box Close, not within space of goal, no opposition, no team mate, 0/half skill from goal', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.currentPOS[1] = 23;
    matchDetails.ball.position[1] = 23;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('In Top Box Close, No opposition ahead, no close team mate, further than shooting skill distance from goal', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 3;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0]);
  });
  it('In Top Box Not close, No opposition ahead, no close team mate, further than shooting skill distance from goal', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.currentPOS[1] = 105;
    if (player.currentPOS[0] === 'NP') {
      throw new Error('PLayer no position');
    }
    matchDetails.ball.position = [player.currentPOS[0], 105];
    player.skill.shooting = 3;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([50, 0, 20, 20, 0, 0, 0, 10, 0, 0, 0]);
  });
  it('In Top Box Not close, No opposition ahead, no close team mate, within shooting skill distance from goal', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.currentPOS[1] = 105;
    if (player.currentPOS[0] === 'NP') {
      throw new Error('PLayer no position');
    }
    matchDetails.ball.position = [player.currentPOS[0], 105];
    player.skill.shooting = 300;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]);
  });
  it('In Top Box Not Close, no close team mate, player ahead', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.currentPOS[1] = 105;
    if (player.currentPOS[0] === 'NP') {
      throw new Error('PLayer no position');
    }
    matchDetails.ball.position = [player.currentPOS[0], 105];
    player.skill.shooting = 3;
    matchDetails.kickOffTeam.players[1].currentPOS = [382, 100];
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0]);
  });
  it('In Top Box Close, player ahead, no close team mate, 0/half of shooting range', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoal.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[1].currentPOS = [382, 28];
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('In Top Box Not Close, player ahead, no close team mate, half/full shooting range ', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoal.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 60;
    matchDetails.kickOffTeam.players[1].currentPOS = [382, 28];
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0]);
  });
  it('In Top Box Not Close, player ahead, close team mate', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoal.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.secondTeam.players[8].currentPOS = [379, 40];
    matchDetails.kickOffTeam.players[1].currentPOS = [382, 28];
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0]);
  });
  it('In Top Box Not Close, player ahead, no close team mate, further than shooting', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoal.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 20;
    matchDetails.kickOffTeam.players[1].currentPOS = [382, 28];
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0]);
  });
  it('In Top Box Close, not in goal space, no player ahead, close team mate, 0/half of shooting range', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoal.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.secondTeam.players[8].currentPOS = [379, 40];
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('In Top Box Close, not in goal space, no player ahead, close team mate, half/shooting range', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoal.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.secondTeam.players[8].currentPOS = [379, 40];
    player.skill.shooting = 45;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]);
  });
  it('In Top Box Close, not in goal space, no player ahead, close team mate, < shooting range', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoal.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.secondTeam.players[8].currentPOS = [379, 40];
    player.skill.shooting = 5;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0]);
  });
  it('In Top Box Close, no player ahead, close team mate, 0/half of shooting range', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoalLess25.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[0].currentPOS = [395, 8];
    matchDetails.secondTeam.players[8].currentPOS = [379, 27];
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('In Top Box Close, no player ahead, close team mate, half/shooting range', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoalLess25.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[0].currentPOS = [395, 8];
    matchDetails.secondTeam.players[8].currentPOS = [379, 27];
    player.skill.shooting = 35;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]);
  });
  it('In Top Box Close, no player ahead, close team mate, over shooting range', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoalLess25.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[0].currentPOS = [395, 8];
    matchDetails.secondTeam.players[8].currentPOS = [379, 27];
    player.skill.shooting = 2;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0]);
  });
  it('In Top Box Close, opp. near, no player ahead, no close team mate, 0/half shooting range', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoalLess25.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[0].currentPOS = [395, 8];
    player.skill.shooting = 80;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('In Top Box Close, opp. near, no player ahead, no close team mate, half/shooting range', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoalLess25.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[0].currentPOS = [395, 8];
    player.skill.shooting = 35;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0]);
  });
  it('In Top Box Close, opp. near, no player ahead, no close team mate, over shooting range', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBoxWithinGoalLess25.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[0].currentPOS = [395, 8];
    player.skill.shooting = 2;
    const parameters = actions.bottomTeamPlayerHasBallInTopPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0]);
  });
});
