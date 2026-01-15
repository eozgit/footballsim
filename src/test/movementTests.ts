import { expect, it, describe } from 'vitest';

import * as common from '../lib/common.js';
import * as pMovement from '../lib/playerMovement.js';

import { readMatchDetails } from './lib/utils.js';

describe('getMovement()', function () {
  it('Has Ball - runs', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[9];
    const opposition = matchDetails.secondTeam;
    const movement = pMovement.getMovement(
      player,
      'run',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(true).to.eql(common.isBetween(movement[0], -3, 1));

    expect(true).to.eql(common.isBetween(movement[1], -3, 1));
  });

  it('Has Ball - sprint', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[9];
    const opposition = matchDetails.secondTeam;
    const movement = pMovement.getMovement(
      player,
      'sprint',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(true).to.eql(common.isBetween(movement[0], -5, 5));

    expect(true).to.eql(common.isBetween(movement[1], 1, 5));
  });

  it('Has Ball - shoot', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[9];
    const opposition = matchDetails.secondTeam;
    const movement = pMovement.getMovement(
      player,
      'shoot',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });

  it('Has Ball - throughball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[9];
    const opposition = matchDetails.secondTeam;
    const movement = pMovement.getMovement(
      player,
      'throughBall',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });

  it('Has Ball - pass', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[9];
    const opposition = matchDetails.secondTeam;
    const movement = pMovement.getMovement(
      player,
      'pass',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });

  it('Has Ball - cross', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[9];
    const opposition = matchDetails.secondTeam;
    const movement = pMovement.getMovement(
      player,
      'cross',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });

  it('Has Ball - cleared', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[9];
    const opposition = matchDetails.secondTeam;
    const movement = pMovement.getMovement(
      player,
      'cleared',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });

  it('Has Ball - boot', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[9];
    const opposition = matchDetails.secondTeam;
    const movement = pMovement.getMovement(
      player,
      'boot',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });

  it('Has Ball - penalty', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[9];
    const opposition = matchDetails.secondTeam;
    const movement = pMovement.getMovement(
      player,
      'penalty',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });

  it('No Ball - tackle +/+', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.secondTeam.players[4];
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'tackle',
      opposition,
      265,
      444,
      matchDetails,
    );
    expect(movement).to.eql([-1, -1]);
  });

  it('No Ball - tackle 0/0', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.secondTeam.players[4];
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'tackle',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });

  it('No Ball - tackle -/-', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.secondTeam.players[4];
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'tackle',
      opposition,
      -10,
      -10,
      matchDetails,
    );
    expect(movement).to.eql([1, 1]);
  });

  it('No Ball - tackle +/-', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.secondTeam.players[4];
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'tackle',
      opposition,
      10,
      -10,
      matchDetails,
    );
    expect(movement).to.eql([-1, 1]);
  });

  it('No Ball - slide', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.secondTeam.players[4];
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'slide',
      opposition,
      265,
      444,
      matchDetails,
    );
    expect(movement).to.eql([-1, -1]);
  });

  it('No Ball - intercept +/0', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.secondTeam.players[4];
    player.currentPOS[1] += 2;
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'intercept',
      opposition,
      265,
      448,
      matchDetails,
    );
    expect(movement).to.eql([-1, 0]);
  });

  it('No Ball - intercept -/-', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails2.json',
    );
    const player = matchDetails.secondTeam.players[4];
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'intercept',
      opposition,
      -327,
      -522,
      matchDetails,
    );
    expect(movement).to.eql([1, 1]);
  });

  it('No Ball - intercept 0/-', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[5];
    common.setPlayerXY(player, 337, player.currentPOS[1]);
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'intercept',
      opposition,
      0,
      -255,
      matchDetails,
    );
    expect(movement).to.eql([0, 1]);
  });

  it('No Ball - intercept 0/0', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[5];
    common.setPlayerXY(player, 337, player.currentPOS[1]);

    common.setPlayerXY(player, player.currentPOS[0], 527);
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'intercept',
      opposition,
      0,
      0,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });

  it('No Ball - intercept 0/+', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[5];
    common.setPlayerXY(player, 337, player.currentPOS[1]);

    common.setPlayerXY(player, player.currentPOS[0], 957);
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'intercept',
      opposition,
      0,
      430,
      matchDetails,
    );
    expect(movement).to.eql([0, -1]);
  });

  it('No Ball - intercept +/+', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[5];
    common.setPlayerXY(player, 537, player.currentPOS[1]);

    common.setPlayerXY(player, player.currentPOS[0], 1357);
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'intercept',
      opposition,
      0,
      430,
      matchDetails,
    );
    expect(movement).to.eql([-1, -1]);
  });

  it('No Ball - intercept +/-', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[5];
    common.setPlayerXY(player, 537, player.currentPOS[1]);

    common.setPlayerXY(player, player.currentPOS[0], 1);
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'intercept',
      opposition,
      0,
      430,
      matchDetails,
    );
    expect(movement).to.eql([-1, 1]);
  });

  it('No Ball - intercept -/+', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.kickOffTeam.players[5];
    common.setPlayerXY(player, 1, player.currentPOS[1]);

    common.setPlayerXY(player, player.currentPOS[0], 1357);
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'intercept',
      opposition,
      0,
      430,
      matchDetails,
    );
    expect(movement).to.eql([1, -1]);
  });

  it('No Ball - run', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.secondTeam.players[4];
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'run',
      opposition,
      265,
      444,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });

  it('No Ball - sprint', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const player = matchDetails.secondTeam.players[4];
    const opposition = matchDetails.kickOffTeam;
    const movement = pMovement.getMovement(
      player,
      'sprint',
      opposition,
      265,
      444,
      matchDetails,
    );
    expect(movement).to.eql([0, 0]);
  });
});

describe('misc()', function () {
  it('updateInformation', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const newPosition: [number, number] = [12, 32];
    pMovement.updateInformation(matchDetails, newPosition);

    expect(matchDetails.ball.position).to.eql([12, 32, 0]);
  });

  it('ballMoved', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.secondTeam.players[4];
    thisPlayer.hasBall = true;
    const team = matchDetails.secondTeam;
    const opp = matchDetails.kickOffTeam;
    pMovement.ballMoved(matchDetails, thisPlayer, team, opp);

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.Player).to.eql(``);

    expect(matchDetails.ball.withTeam).to.eql(``);

    expect(matchDetails.secondTeam.players[4].hasBall).to.eql(false);

    expect(matchDetails.secondTeam.intent).to.eql(`attack`);

    expect(matchDetails.kickOffTeam.intent).to.eql(`attack`);
  });

  it('ballPlayerActions - cleared', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    pMovement.handleBallPlayerActions(
      matchDetails,
      thisPlayer,
      team,
      opp,
      `cleared`,
    );

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.Player).to.eql(``);

    expect(matchDetails.ball.withTeam).to.eql(``);

    expect(matchDetails.kickOffTeam.players[9].hasBall).to.eql(false);

    expect(matchDetails.ball.position).to.not.eql(thisPlayer.currentPOS);
  });

  it('ballPlayerActions - boot', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    pMovement.handleBallPlayerActions(
      matchDetails,
      thisPlayer,
      team,
      opp,
      `boot`,
    );

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.Player).to.eql(``);

    expect(matchDetails.ball.withTeam).to.eql(``);

    expect(matchDetails.kickOffTeam.players[9].hasBall).to.eql(false);

    expect(matchDetails.ball.position).to.not.eql(thisPlayer.currentPOS);
  });

  it('ballPlayerActions - pass', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    pMovement.handleBallPlayerActions(
      matchDetails,
      thisPlayer,
      team,
      opp,
      `pass`,
    );

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.Player).to.eql(``);

    expect(matchDetails.ball.withTeam).to.eql(``);

    expect(matchDetails.kickOffTeam.players[9].hasBall).to.eql(false);

    expect(matchDetails.ball.position).to.not.eql(thisPlayer.currentPOS);
    const ballLog = matchDetails.iterationLog[4].indexOf(
      `passed to new position:`,
    );
    expect(ballLog).to.be.greaterThan(-1);
  });

  it('ballPlayerActions - cross', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    pMovement.handleBallPlayerActions(
      matchDetails,
      thisPlayer,
      team,
      opp,
      `cross`,
    );

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.Player).to.eql(``);

    expect(matchDetails.ball.withTeam).to.eql(``);

    expect(matchDetails.kickOffTeam.players[9].hasBall).to.eql(false);

    expect(matchDetails.ball.position).to.not.eql(thisPlayer.currentPOS);
    const ballLog = matchDetails.iterationLog[4].indexOf(
      `crossed to new position:`,
    );
    expect(ballLog).to.be.greaterThan(-1);
  });

  it('ballPlayerActions - throughball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    pMovement.handleBallPlayerActions(
      matchDetails,
      thisPlayer,
      team,
      opp,
      `throughBall`,
    );

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.Player).to.eql(``);

    expect(matchDetails.ball.withTeam).to.eql(``);

    expect(matchDetails.kickOffTeam.players[9].hasBall).to.eql(false);

    expect(matchDetails.ball.position).to.not.eql(thisPlayer.currentPOS);
  });

  it('ballPlayerActions - shoot', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    pMovement.handleBallPlayerActions(
      matchDetails,
      thisPlayer,
      team,
      opp,
      `shoot`,
    );

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.Player).to.eql(``);

    expect(matchDetails.ball.withTeam).to.eql(``);

    expect(matchDetails.kickOffTeam.players[9].hasBall).to.eql(false);

    expect(matchDetails.ball.position).to.not.eql(thisPlayer.currentPOS);
  });

  it('ballPlayerActions - penalty', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    pMovement.handleBallPlayerActions(
      matchDetails,
      thisPlayer,
      team,
      opp,
      `penalty`,
    );

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.Player).to.eql(``);

    expect(matchDetails.ball.withTeam).to.eql(``);

    expect(matchDetails.kickOffTeam.players[9].hasBall).to.eql(false);

    expect(matchDetails.ball.position).to.not.eql(thisPlayer.currentPOS);
  });

  it('checkProvidedAction - no ball, valid provided action', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    thisPlayer.action = `tackle`;
    let action = `run`;
    action = pMovement.checkProvidedAction(matchDetails, thisPlayer, action);

    expect(action).to.eql(`tackle`);
  });

  it('checkProvidedAction - no ball, provided ball action', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    let action = `run`;
    thisPlayer.action = `pass`;

    action = pMovement.checkProvidedAction(matchDetails, thisPlayer, action);

    expect(action).to.eql(`run`);
  });

  it('checkProvidedAction - has ball, provided none ball action', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    let action = `run`;
    thisPlayer.action = `slide`;

    action = pMovement.checkProvidedAction(matchDetails, thisPlayer, action);

    expect(action).to.not.eql(`slide`);
  });

  it('checkProvidedAction - has ball, provided none ball action intercept', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    let action = `run`;
    thisPlayer.action = `intercept`;

    action = pMovement.checkProvidedAction(matchDetails, thisPlayer, action);

    expect(action).to.not.eql(`intercept`);
  });

  it('checkProvidedAction - has ball, provided ball action', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    let action = `run`;
    thisPlayer.action = `shoot`;

    action = pMovement.checkProvidedAction(matchDetails, thisPlayer, action);

    expect(action).to.eql(`shoot`);
  });

  it('checkProvidedAction - none', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    let action = `run`;
    thisPlayer.action = `none`;

    action = pMovement.checkProvidedAction(matchDetails, thisPlayer, action);

    expect(action).to.eql(`run`);
  });

  it('checkProvidedAction - nothing', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    let action = `run`;
    thisPlayer.action = ``;
    try {
      action = pMovement.checkProvidedAction(matchDetails, thisPlayer, action);

      common.debug('action', action);
    } catch (err) {
      expect(err).to.be.an('Error');

      expect(String(err)).to.have.string(
        'Invalid player action for Cameron Johnson',
      );
    }
  });

  it('checkProvidedAction - invalid action', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    let action = `run`;
    thisPlayer.action = `megs`;
    try {
      action = pMovement.checkProvidedAction(matchDetails, thisPlayer, action);

      common.debug('action', action);
    } catch (err) {
      expect(err).to.be.an('Error');

      expect(String(err)).to.have.string(
        'Invalid player action for Cameron Johnson',
      );
    }
  });
});

describe('getSprintMovement()', function () {
  it('Move NorthEast - close to ball ', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    const move = pMovement.getSprintMovement(matchDetails, thisPlayer, 20, 20);
    const betweenX = common.isBetween(move[0], -3, 1);
    const betweenY = common.isBetween(move[1], -3, 1);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(99.98);
  });

  it('Move SouthWest - close to ball ', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    const move = pMovement.getSprintMovement(
      matchDetails,
      thisPlayer,
      -20,
      -20,
    );
    const betweenX = common.isBetween(move[0], -1, 3);
    const betweenY = common.isBetween(move[1], -1, 3);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(99.98);
  });

  it('Move Wait - close to ball ', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    thisPlayer.fitness = 29;
    const move = pMovement.getSprintMovement(matchDetails, thisPlayer, 0, 0);
    const betweenX = common.isBetween(move[0], -1, 1);
    const betweenY = common.isBetween(move[1], -1, 1);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(29);
  });

  it('Top player with ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    thisPlayer.fitness = 29;
    const move = pMovement.getSprintMovement(matchDetails, thisPlayer, -20, 10);
    const betweenX = common.isBetween(move[0], -5, 5);
    const betweenY = common.isBetween(move[1], 1, 5);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(29);
  });

  it('Bottom player with ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    thisPlayer.fitness = 31;

    thisPlayer.originPOS[1] = 720;
    const move = pMovement.getSprintMovement(matchDetails, thisPlayer, -20, 10);
    const betweenX = common.isBetween(move[0], -5, 5);
    const betweenY = common.isBetween(move[1], -5, -1);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(30.99);
  });

  it('Move SouthEast - keep in formation', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[6];
    common.setPlayerXY(thisPlayer, 10, 100);
    const move = pMovement.getSprintMovement(matchDetails, thisPlayer, 40, 40);
    const betweenX = common.isBetween(move[0], -3, 0);
    const betweenY = common.isBetween(move[1], -3, 0);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(99.985);
  });

  it('Move NorthWest - keep in formation', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[6];
    common.setPlayerXY(thisPlayer, 600, 1000);
    const move = pMovement.getSprintMovement(matchDetails, thisPlayer, 40, 40);
    const betweenX = common.isBetween(move[0], -3, 1);
    const betweenY = common.isBetween(move[1], -3, 1);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(99.985);
  });

  it('Wait - keep in formation', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[6];
    common.setPlayerXY(thisPlayer, 230, 290);
    const move = pMovement.getSprintMovement(matchDetails, thisPlayer, 40, 40);
    const betweenX = common.isBetween(move[0], -3, 0);
    const betweenY = common.isBetween(move[1], -3, 0);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(99.985);
  });
});

describe('getRunMovement()', function () {
  it('Move NorthEast - close to ball ', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    const move = pMovement.getRunMovement(matchDetails, thisPlayer, 20, 20);
    const betweenX = common.isBetween(move[0], -2, 1);
    const betweenY = common.isBetween(move[1], -2, 1);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(99.985);
  });

  it('Move SouthWest - close to ball ', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    const move = pMovement.getRunMovement(matchDetails, thisPlayer, -20, -20);
    const betweenX = common.isBetween(move[0], -1, 2);
    const betweenY = common.isBetween(move[1], -1, 2);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(99.985);
  });

  it('Move Wait - close to ball ', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[7];
    thisPlayer.fitness = 29;
    const move = pMovement.getRunMovement(matchDetails, thisPlayer, 0, 0);
    const betweenX = common.isBetween(move[0], -1, 1);
    const betweenY = common.isBetween(move[1], -1, 1);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(28.995);
  });

  it('Top player with ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    thisPlayer.fitness = 19;
    const move = pMovement.getRunMovement(matchDetails, thisPlayer, -20, 10);
    const betweenX = common.isBetween(move[0], -3, 1);
    const betweenY = common.isBetween(move[1], -3, 1);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(19);
  });

  it('Bottom player with ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[9];
    thisPlayer.fitness = 31;

    thisPlayer.originPOS[1] = 720;
    const move = pMovement.getRunMovement(matchDetails, thisPlayer, -20, 10);
    const betweenX = common.isBetween(move[0], -1, 3);
    const betweenY = common.isBetween(move[1], -1, 3);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(30.995);
  });

  it('Move SouthEast - keep in formation', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[6];
    common.setPlayerXY(thisPlayer, 10, 100);
    const move = pMovement.getRunMovement(matchDetails, thisPlayer, 40, 40);
    const betweenX = common.isBetween(move[0], -2, 0);
    const betweenY = common.isBetween(move[1], -2, 0);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(99.99);
  });

  it('Move NorthWest - keep in formation', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[6];
    common.setPlayerXY(thisPlayer, 600, 1000);
    const move = pMovement.getRunMovement(matchDetails, thisPlayer, 40, 40);
    const betweenX = common.isBetween(move[0], -3, 1);
    const betweenY = common.isBetween(move[1], -3, 1);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(99.99);
  });

  it('Wait - keep in formation', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails1.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[6];
    common.setPlayerXY(thisPlayer, 230, 290);
    const move = pMovement.getRunMovement(matchDetails, thisPlayer, 40, 40);
    const betweenX = common.isBetween(move[0], -2, 0);
    const betweenY = common.isBetween(move[1], -2, 0);
    expect(betweenX).to.eql(true);

    expect(betweenY).to.eql(true);

    expect(thisPlayer.fitness).to.eql(99.99);
  });
});

describe('decideMovement()', function () {
  it('completeSlide and same position as ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails3.json',
    );
    const closestPlayer = { name: 'Peter Johnson', position: 0 };
    matchDetails.kickOffTeam.players[10].action = `slide`;
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    matchDetails.kickOffTeam = pMovement.decideMovement(
      closestPlayer,
      team,
      opp,
      matchDetails,
    );
    const slideInfo = matchDetails.iterationLog[2].indexOf(
      `Slide tackle attempted by: Louise Johnson`,
    );
    expect(slideInfo).to.be.greaterThan(-1);
  });

  it('completeTackle and same position as ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails3.json',
    );
    const closestPlayer = { name: 'Peter Johnson', position: 0 };
    matchDetails.kickOffTeam.players[10].action = `tackle`;
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    matchDetails.kickOffTeam = pMovement.decideMovement(
      closestPlayer,
      team,
      opp,
      matchDetails,
    );
    const tackleInfo = matchDetails.iterationLog[2].indexOf(
      `Tackle attempted by: Louise Johnson`,
    );
    expect(tackleInfo).to.be.greaterThan(-1);
  });

  it('completeSlide and wiithin 3 of ball', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails3.json',
    );
    const closestPlayer = { name: 'Peter Johnson', position: 0 };
    matchDetails.kickOffTeam.players[10].action = `slide`;

    common.setPlayerXY(matchDetails.kickOffTeam.players[10], 402, 519);
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    matchDetails.kickOffTeam = pMovement.decideMovement(
      closestPlayer,
      team,
      opp,
      matchDetails,
    );
    const slideInfo = matchDetails.iterationLog[2].indexOf(
      `Slide tackle attempted by: Louise Johnson`,
    );
    expect(slideInfo).to.be.greaterThan(-1);
  });

  it('same position as ball not slide or tackle - setClosePlayerTakesBall', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails3.json',
    );
    const closestPlayer = { name: 'Peter Johnson', position: 0 };
    matchDetails.ball.withPlayer = false;
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    matchDetails.kickOffTeam = pMovement.decideMovement(
      closestPlayer,
      team,
      opp,
      matchDetails,
    );

    expect(matchDetails.kickOffTeam.players[10].hasBall).to.eql(true);

    expect(matchDetails.ball.lastTouch.playerName).to.eql(`Louise Johnson`);
  });

  it('within 2 of ball not slide or tackle - setClosePlayerTakesBall', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails3.json',
    );
    const closestPlayer = { name: 'Peter Johnson', position: 0 };
    common.setPlayerXY(matchDetails.kickOffTeam.players[10], 402, 519);

    matchDetails.ball.withPlayer = false;
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    matchDetails.kickOffTeam = pMovement.decideMovement(
      closestPlayer,
      team,
      opp,
      matchDetails,
    );

    expect(matchDetails.kickOffTeam.players[10].hasBall).to.eql(true);

    expect(matchDetails.ball.lastTouch.playerName).to.eql(`Louise Johnson`);
  });

  it('far from, not slide or tackle - setClosePlayerTakesBall', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails3.json',
    );
    const closestPlayer = { name: 'Louise Johnson', position: 0 };
    common.setPlayerXY(matchDetails.kickOffTeam.players[10], 402, 519);

    matchDetails.ball.withTeam = `78883930303030002`;

    matchDetails.ball.withPlayer = false;
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    matchDetails.kickOffTeam = pMovement.decideMovement(
      closestPlayer,
      team,
      opp,
      matchDetails,
    );

    expect(matchDetails.kickOffTeam.players[10].hasBall).to.eql(true);

    expect(matchDetails.ball.lastTouch.playerName).to.eql(`Louise Johnson`);
  });

  it('far from, not slide or tackle - setClosePlayerTakesBall and offside true', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails3.json',
    );
    const closestPlayer = { name: 'Louise Johnson', position: 0 };
    common.setPlayerXY(matchDetails.kickOffTeam.players[10], 402, 519);

    matchDetails.kickOffTeam.players[10].offside = true;

    matchDetails.ball.withTeam = `78883930303030002`;

    matchDetails.ball.withPlayer = false;
    const team = matchDetails.kickOffTeam;
    const opp = matchDetails.secondTeam;
    matchDetails.kickOffTeam = pMovement.decideMovement(
      closestPlayer,
      team,
      opp,
      matchDetails,
    );
    const offsideInfo = matchDetails.iterationLog[2].indexOf(
      `Louise Johnson is offside`,
    );
    expect(offsideInfo).to.be.greaterThan(-1);
  });

  it('far from, not slide or tackle - setClosePlayerTakesBall and offside true', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/getMovement/matchDetails3.json',
    );
    const thisPlayer = matchDetails.kickOffTeam.players[10];
    matchDetails.kickOffTeam.players[10].offside = true;
    const team = JSON.parse(JSON.stringify(matchDetails.kickOffTeam));
    team.name = `aaaa`;
    const opp = matchDetails.secondTeam;
    pMovement.setClosePlayerTakesBall(matchDetails, thisPlayer, team, opp);
    const offsideInfo = matchDetails.iterationLog[2].indexOf(
      `Louise Johnson is offside`,
    );
    expect(offsideInfo).to.be.greaterThan(-1);
  });
});

describe('closestPlayerAction()', function () {
  it('over 30', async () => {
    let ballX = 31;
    let ballY = 31;
    ballX = pMovement.closestPlayerActionBallX(ballX);

    ballY = pMovement.closestPlayerActionBallY(ballY);

    expect(ballX).to.eql(29);

    expect(ballY).to.eql(29);
  });

  it('under -30', async () => {
    let ballX = -33;
    let ballY = -31;
    ballX = pMovement.closestPlayerActionBallX(ballX);

    ballY = pMovement.closestPlayerActionBallY(ballY);

    expect(ballX).to.eql(-29);

    expect(ballY).to.eql(-29);
  });

  it('within 30s', async () => {
    let ballX = -15;
    let ballY = 15;
    ballX = pMovement.closestPlayerActionBallX(ballX);

    ballY = pMovement.closestPlayerActionBallY(ballY);

    expect(ballX).to.eql(-15);

    expect(ballY).to.eql(15);
  });
});
