import { describe, expect, it } from 'vitest';

import * as bMovement from '../lib/ballMovement.js';
import * as common from '../lib/common.js';
import { readFile } from '../lib/fileReader.js';

import { readMatchDetails } from './lib/utils.js';

import {
  resolveDeflection,
  setDeflectionDirectionPos,
  setDeflectionPlayerHasBall,
  setDeflectionPlayerOffside,
} from '@/lib/actions/deflections.js';
import { ballKicked, penaltyTaken, throughBall } from '@/lib/actions/triggers.js';
import { moveBall } from '@/lib/ballState.js';
import { createPlayer, setBPlayer } from '@/lib/factories/playerFactory.js';
import { getBallDirection } from '@/lib/physics.js';

describe('ArrayStuffs()', function () {
  it('merging arrays', async () => {
    const xArray = [-10, -10, -10, -10, -10, -10, -10, -10, -10, -10];

    const yArray = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

    const pArray = [2, 2, 2, 2, 1, 1, 1, 1, 1, 1];

    const newArray = bMovement.mergeArrays({
      arrayLength: 10,
      oldPos: [337, 527, 0],
      newPos: [237, 557],
      array1: xArray,
      array2: yArray,
      array3: pArray,
    });

    expect(newArray[0]).to.eql([327, 532, 2]);

    expect(newArray[5]).to.eql([277, 557, 1]);

    expect(newArray[8]).to.eql([247, 572, 1]);

    expect(newArray[9]).to.eql([237, 557, 1]);
  });

  it('split numbers', async () => {
    const array = bMovement.splitNumberIntoN(24, 8);

    expect(array).to.eql([5, 5, 4, 3, 3, 2, 1, 1]);
  });

  it('calcBallMovementOverTime', async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.kickOffTeam.players[9];

    const newPosition = bMovement.calcBallMovementOverTime(matchDetails, 30, [200, 300], player);

    try {
      expect(newPosition).to.eql([335, 523]);
    } catch {
      expect(newPosition).to.eql([333, 521]);
    }
  });

  it('ball crossed 1', async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.kickOffTeam.players[9];

    const newPosition = bMovement.ballCrossed(matchDetails, matchDetails.kickOffTeam, player);

    const xBetween = common.isBetween(newPosition[0], 334, 345);

    const yBetween = common.isBetween(newPosition[1], 530, 534);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it('ball crossed 2', async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[9];

    const newPosition = bMovement.ballCrossed(matchDetails, matchDetails.secondTeam, player);

    const xBetween = common.isBetween(newPosition[0], 334, 345);

    const yBetween = common.isBetween(newPosition[1], 520, 524);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it('ball crossed 3', async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[4];

    const newPosition = bMovement.ballCrossed(matchDetails, matchDetails.secondTeam, player);

    const xBetween = common.isBetween(newPosition[0], 330, 340);

    const yBetween = common.isBetween(newPosition[1], 520, 524);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it('ball crossed 4', async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.kickOffTeam.players[4];

    const newPosition = bMovement.ballCrossed(matchDetails, matchDetails.kickOffTeam, player);

    const xBetween = common.isBetween(newPosition[0], 330, 345);

    const yBetween = common.isBetween(newPosition[1], 528, 534);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });
});

describe('targetPlayers()', function () {
  for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) {
    it(`target Players top ${i}`, async () => {
      const playersArray = await readFile('./src/test/input/ballMovements/targetPlayersArray.json');

      const thisPlayer = bMovement.getTargetPlayer(playersArray.thisArray, `top`);

      const { name, currentPOS } = thisPlayer;

      const [tx, ty] = currentPOS;

      const playerValid = playersArray.thisArray.some((p) => p.name === name);

      const positionValid = playersArray.thisArray.some(
        ({ currentPOS: [x, y] }) => x === tx && y === ty,
      );

      expect(playerValid).toBe(true);

      expect(positionValid).toBe(true);
    });
  }

  for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) {
    it(`target Players bottom ${i}`, async () => {
      const playersArray = await readFile('./src/test/input/ballMovements/targetPlayersArray.json');

      const thisPlayer = bMovement.getTargetPlayer(playersArray.thisArray, `bottom`);

      const { name, currentPOS } = thisPlayer;

      const [tx, ty] = currentPOS;

      const playerValid = playersArray.thisArray.some((p) => p.name === name);

      const positionValid = playersArray.thisArray.some(
        ({ currentPOS: [x, y] }) => x === tx && y === ty,
      );

      expect(playerValid).toBe(true);

      expect(positionValid).toBe(true);
    });
  }

  it('set target player position', async () => {
    const output = bMovement.setTargetPlyPos({
      tplyr: [3, 4],
      lowX: 1,
      highX: 1,
      lowY: 2,
      highY: 2,
    });

    expect(output).to.eql([4, 6]);
  });

  it('set target player position - negative', async () => {
    const output = bMovement.setTargetPlyPos({
      tplyr: [3, 4],
      lowX: -1,
      highX: -1,
      lowY: -2,
      highY: -2,
    });

    expect(output).to.eql([2, 2]);
  });

  it('set B Player', async () => {
    const player = createPlayer('CM');

    const bPlayer = await readFile('./src/test/input/ballMovements/bPlayer.json');

    const thisPlayer = setBPlayer([0, 200]);

    expect(thisPlayer).to.eql({ ...player, ...bPlayer });
  });
});

describe('ballPassed()', function () {
  it(`ball passed defender`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const teammates = matchDetails.kickOffTeam;

    const player = matchDetails.kickOffTeam.players[1];

    player.skill.passing = 1;
    const newPosition = bMovement.ballPassed(matchDetails, teammates, player);

    if (!Array.isArray(newPosition)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(newPosition[0], 330, 355);

    const yBetween = common.isBetween(newPosition[1], 520, 540);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`ball passed midfielder`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const teammates = matchDetails.kickOffTeam;

    const player = matchDetails.kickOffTeam.players[6];

    player.skill.passing = 1;

    matchDetails.ball.position = [200, 995];
    const newPosition = bMovement.ballPassed(matchDetails, teammates, player);

    if (!Array.isArray(newPosition)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(newPosition[0], 195, 225);

    const yBetween = common.isBetween(newPosition[1], 985, 995);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`ball passed forward`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const teammates = matchDetails.kickOffTeam;

    const player = matchDetails.kickOffTeam.players[9];

    player.skill.passing = 1;

    matchDetails.ball.position = [200, 105];
    const newPosition = bMovement.ballPassed(matchDetails, teammates, player);

    if (!Array.isArray(newPosition)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(newPosition[0], 190, 220);

    const yBetween = common.isBetween(newPosition[1], 99, 120);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`ball passed defender - second team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const teammates = matchDetails.secondTeam;

    const player = matchDetails.secondTeam.players[1];

    player.skill.passing = 1;
    const newPosition = bMovement.ballPassed(matchDetails, teammates, player);

    if (!Array.isArray(newPosition)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(newPosition[0], 328, 347);

    const yBetween = common.isBetween(newPosition[1], 523, 542);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`ball passed midfielder - second team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const teammates = matchDetails.secondTeam;

    const player = matchDetails.secondTeam.players[6];

    player.skill.passing = 1;

    matchDetails.ball.position = [200, 105];
    const newPosition = bMovement.ballPassed(matchDetails, teammates, player);

    if (!Array.isArray(newPosition)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(newPosition[0], 195, 210);

    const yBetween = common.isBetween(newPosition[1], 100, 115);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`ball passed forward - second team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const teammates = matchDetails.secondTeam;

    const player = matchDetails.secondTeam.players[9];

    player.skill.passing = 1;

    matchDetails.ball.position = [200, 995];
    const newPosition = bMovement.ballPassed(matchDetails, teammates, player);

    if (!Array.isArray(newPosition)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(newPosition[0], 191, 222);

    const yBetween = common.isBetween(newPosition[1], 983, 999);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`ball passed forward - second team - high shooting`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const teammates = matchDetails.secondTeam;

    const player = matchDetails.secondTeam.players[9];

    const newPosition = bMovement.ballPassed(matchDetails, teammates, player);

    if (!Array.isArray(newPosition)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(newPosition[0], 330, 345);

    const yBetween = common.isBetween(newPosition[1], 525, 540);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });
});

describe('direction()', function () {
  it(`south`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    getBallDirection(matchDetails, [337, 530]);

    expect(matchDetails.ball.direction).to.eql('south');
  });

  it(`north`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    getBallDirection(matchDetails, [337, 520]);

    expect(matchDetails.ball.direction).to.eql('north');
  });

  it(`east`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    getBallDirection(matchDetails, [340, 527]);

    expect(matchDetails.ball.direction).to.eql('east');
  });

  it(`west`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    getBallDirection(matchDetails, [320, 527]);

    expect(matchDetails.ball.direction).to.eql('west');
  });

  it(`wait`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    getBallDirection(matchDetails, [337, 527]);

    expect(matchDetails.ball.direction).to.eql('wait');
  });

  it(`northeast`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    getBallDirection(matchDetails, [340, 520]);

    expect(matchDetails.ball.direction).to.eql('northeast');
  });

  it(`northwest`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    getBallDirection(matchDetails, [320, 520]);

    expect(matchDetails.ball.direction).to.eql('northwest');
  });

  it(`southeast`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    getBallDirection(matchDetails, [340, 530]);

    expect(matchDetails.ball.direction).to.eql('southeast');
  });

  it(`southwest`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    getBallDirection(matchDetails, [320, 530]);

    expect(matchDetails.ball.direction).to.eql('southwest');
  });
});

describe('setDeflectionDirectionPos()', function () {
  it(`east`, async () => {
    const position = setDeflectionDirectionPos(`east`, [200, 300], 75);

    const yBetween = common.isBetween(position[1], 296, 304);

    expect(position[0]).to.eql(162.5);

    expect(yBetween).to.eql(true);
  });

  it(`west`, async () => {
    const position = setDeflectionDirectionPos(`west`, [200, 300], 75);

    const yBetween = common.isBetween(position[1], 296, 304);

    expect(position[0]).to.eql(237.5);

    expect(yBetween).to.eql(true);
  });

  it(`north`, async () => {
    const position = setDeflectionDirectionPos(`north`, [200, 300], 75);

    const xBetween = common.isBetween(position[0], 196, 204);

    expect(position[1]).to.eql(337.5);

    expect(xBetween).to.eql(true);
  });

  it(`south`, async () => {
    const position = setDeflectionDirectionPos(`south`, [200, 300], 75);

    const xBetween = common.isBetween(position[0], 196, 204);

    expect(position[1]).to.eql(262.5);

    expect(xBetween).to.eql(true);
  });

  it(`wait`, async () => {
    const position = setDeflectionDirectionPos(`wait`, [200, 300], 75);

    const xBetween = common.isBetween(position[0], -38, 38);

    const yBetween = common.isBetween(position[1], -38, 38);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });
});

describe('setDeflectionDirectionPos()', function () {
  it(`deflected kickoff team`, async () => {
    let matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const defPlayer = matchDetails.kickOffTeam.players[9];

    const defTeam = matchDetails.kickOffTeam;

    matchDetails = setDeflectionPlayerOffside(matchDetails, defTeam, defPlayer);

    expect(defPlayer.offside).to.eql(false);

    expect(defPlayer.hasBall).to.eql(false);

    expect(matchDetails.ball.Player).to.eql('78883930303030203');

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.withTeam).to.eql('78883930303030003');
  });

  it(`tesdeflected second teamt1`, async () => {
    let matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const defPlayer = matchDetails.secondTeam.players[9];

    const defTeam = matchDetails.secondTeam;

    matchDetails = setDeflectionPlayerOffside(matchDetails, defTeam, defPlayer);

    expect(defPlayer.offside).to.eql(false);

    expect(defPlayer.hasBall).to.eql(false);

    expect(matchDetails.ball.Player).to.eql('78883930303030105');

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.withTeam).to.eql('78883930303030002');
  });
});

describe('setDeflectionPlayerHasBall()', function () {
  it(`not offside`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const defPlayer = matchDetails.secondTeam.players[1];

    const defTeam = matchDetails.secondTeam;

    setDeflectionPlayerHasBall(matchDetails, defPlayer, defTeam);

    expect(matchDetails.ball.Player).to.eql('78883930303030201');

    expect(matchDetails.ball.withTeam).to.eql('78883930303030003');

    expect(matchDetails.ball.position).to.eql([80, 970]);
  });

  it(`offside - second team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const defPlayer = matchDetails.secondTeam.players[1];

    defPlayer.offside = true;
    const defTeam = matchDetails.secondTeam;

    setDeflectionPlayerHasBall(matchDetails, defPlayer, defTeam);

    expect(matchDetails.ball.Player).to.eql('78883930303030105');

    expect(matchDetails.ball.withTeam).to.eql('78883930303030002');

    expect(matchDetails.ball.position).to.eql([337, 527, 0]);
  });
});

describe('resolveDeflection()', function () {
  it(`less than 75 new power`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const defPlayer = matchDetails.secondTeam.players[7];

    const defTeam = matchDetails.secondTeam;

    resolveDeflection({
      power: 120,
      startPos: [120, 300],
      defPosition: [200, 350],
      player: defPlayer,
      team: defTeam,
      matchDetails: matchDetails,
    });

    expect(matchDetails.ball.Player).to.eql('78883930303030207');

    expect(matchDetails.ball.withTeam).to.eql('78883930303030003');

    expect(matchDetails.ball.position).to.eql([420, 780]);
  });

  it(`over than 75 new power`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const defPlayer = matchDetails.secondTeam.players[7];

    const defTeam = matchDetails.secondTeam;

    const pos = resolveDeflection({
      power: 220,
      startPos: [120, 300],
      defPosition: [200, 350],
      player: defPlayer,
      team: defTeam,
      matchDetails: matchDetails,
    });

    expect(pos).to.eql([262.830094339717, 287.169905660283]);

    expect(matchDetails.ballIntended).to.eql(undefined);

    expect(defPlayer.hasBall).to.eql(false);

    expect(matchDetails.ball.Player).to.eql('');

    expect(matchDetails.ball.withPlayer).to.eql(false);

    expect(matchDetails.ball.withTeam).to.eql('');
  });
});

describe('setBallMovementMatchDetails()', function () {
  it(`test1 - Ball Movement`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const thisPlayer = matchDetails.secondTeam.players[7];

    const thisPos: [number, number] = [40, 100];

    const thisTeam = matchDetails.secondTeam;

    bMovement.setBallMovementMatchDetails({
      matchDetails: matchDetails,
      player: thisPlayer,
      startPos: thisPos,
      team: thisTeam,
    });

    expect(matchDetails.ball.ballOverIterations).to.eql([]);

    expect(matchDetails.ball.Player).to.eql(thisPlayer.playerID);

    expect(matchDetails.ball.withPlayer).to.eql(true);

    expect(matchDetails.ball.lastTouch.playerName).to.eql(thisPlayer.name);

    expect(matchDetails.ball.position).to.eql([40, 100]);
  });
});

describe('throughBall()', function () {
  it(`high passing skill - top team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const team = matchDetails.kickOffTeam;

    const player = matchDetails.kickOffTeam.players[3];

    player.skill.passing = 101;
    const endPos = throughBall(matchDetails, team, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 320, 345);

    const yBetween = common.isBetween(endPos[1], 510, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`high passing skill - bottom team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const team = matchDetails.secondTeam;

    const player = matchDetails.secondTeam.players[3];

    player.skill.passing = 101;
    const endPos = throughBall(matchDetails, team, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 520, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`middle third - bottom team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const team = matchDetails.secondTeam;

    const player = matchDetails.secondTeam.players[9];

    player.skill.passing = 1;
    const endPos = throughBall(matchDetails, team, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 520, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`bottom third - bottom team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const team = matchDetails.secondTeam;

    const player = matchDetails.secondTeam.players[9];

    player.skill.passing = 1;

    const { ball } = matchDetails;

    const [bx, , bz] = ball.position;

    common.setBallPosition(ball, bx, 1000, bz);
    const endPos = throughBall(matchDetails, team, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 990, 1007);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`top third - bottom team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const team = matchDetails.secondTeam;

    const player = matchDetails.secondTeam.players[9];

    player.skill.passing = 1;

    const { ball } = matchDetails;

    const [bx, , bz] = ball.position;

    common.setBallPosition(ball, bx, 100, bz);
    const endPos = throughBall(matchDetails, team, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 90, 110);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`middle third - top team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const team = matchDetails.kickOffTeam;

    const player = matchDetails.kickOffTeam.players[9];

    player.skill.passing = 1;
    const endPos = throughBall(matchDetails, team, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 520, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`bottom third - top team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const team = matchDetails.kickOffTeam;

    const player = matchDetails.kickOffTeam.players[9];

    player.skill.passing = 1;

    const { ball } = matchDetails;

    const [bx, , bz] = ball.position;

    common.setBallPosition(ball, bx, 1000, bz);
    const endPos = throughBall(matchDetails, team, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 990, 1005);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`top third - top team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const team = matchDetails.kickOffTeam;

    const player = matchDetails.kickOffTeam.players[9];

    player.skill.passing = 1;

    const { ball } = matchDetails;

    const [bx, , bz] = ball.position;

    common.setBallPosition(ball, bx, 100, bz);
    const endPos = throughBall(matchDetails, team, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 90, 107);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });
});

describe('moveBall()', function () {
  it(`no ballOverIterations`, async () => {
    let matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    matchDetails = moveBall(matchDetails);

    expect(matchDetails.ball.direction).to.eql('wait');
  });

  it(`ballOverIterations`, async () => {
    let matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    matchDetails.ball.ballOverIterations = [
      [211, 100],
      [215, 104],
    ];

    matchDetails = moveBall(matchDetails);

    expect(matchDetails.ball.position).to.eql([211, 100]);

    expect(matchDetails.ball.ballOverIterations.length).to.eql(1);
  });
});

describe('getTopKickedPosition()', function () {
  it(`getTopKickedPosition - wait`, async () => {
    const endPos = bMovement.getTopKickedPosition(`wait`, [11, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 10, 17);

    const yBetween = common.isBetween(endPos[1], 199, 207);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`getTopKickedPosition - north`, async () => {
    const endPos = bMovement.getTopKickedPosition(`north`, [41, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 20, 62);

    const yBetween = common.isBetween(endPos[1], 189, 196);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`getTopKickedPosition - east`, async () => {
    const endPos = bMovement.getTopKickedPosition(`east`, [41, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 45, 52);

    const yBetween = common.isBetween(endPos[1], 179, 221);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`getTopKickedPosition - west`, async () => {
    const endPos = bMovement.getTopKickedPosition(`west`, [41, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 30, 37);

    const yBetween = common.isBetween(endPos[1], 179, 221);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`getTopKickedPosition - northeast`, async () => {
    const endPos = bMovement.getTopKickedPosition(`northeast`, [41, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 40, 47);

    const yBetween = common.isBetween(endPos[1], 189, 211);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`getTopKickedPosition - northwest`, async () => {
    const endPos = bMovement.getTopKickedPosition(`northwest`, [41, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 35, 42);

    const yBetween = common.isBetween(endPos[1], 189, 196);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });
});

describe('getBottomKickedPosition()', function () {
  it(`getBottomKickedPosition - wait`, async () => {
    const endPos = bMovement.getBottomKickedPosition(`wait`, [11, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 10, 17);

    const yBetween = common.isBetween(endPos[1], 199, 207);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`getBottomKickedPosition - south`, async () => {
    const endPos = bMovement.getBottomKickedPosition(`south`, [41, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 20, 62);

    const yBetween = common.isBetween(endPos[1], 189, 221);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`getBottomKickedPosition - east`, async () => {
    const endPos = bMovement.getBottomKickedPosition(`east`, [41, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 45, 52);

    const yBetween = common.isBetween(endPos[1], 179, 221);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`getBottomKickedPosition - west`, async () => {
    const endPos = bMovement.getBottomKickedPosition(`west`, [41, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 30, 37);

    const yBetween = common.isBetween(endPos[1], 179, 221);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`getBottomKickedPosition - southeast`, async () => {
    const endPos = bMovement.getBottomKickedPosition(`southeast`, [41, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 40, 47);

    const yBetween = common.isBetween(endPos[1], 204, 211);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`getBottomKickedPosition - southwest`, async () => {
    const endPos = bMovement.getBottomKickedPosition(`southwest`, [41, 200], 10);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 35, 42);

    const yBetween = common.isBetween(endPos[1], 204, 211);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });
});

describe('ballKicked()', function () {
  it(`ball kicked - top team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.kickOffTeam.players[3];

    const endPos = ballKicked(matchDetails, matchDetails.kickOffTeam, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 519, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`ball kicked - bottom team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[3];

    const endPos = ballKicked(matchDetails, matchDetails.secondTeam, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 519, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });
});

describe('shotMade()', function () {
  it(`shot made - top team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.kickOffTeam.players[3];

    const endPos = bMovement.shotMade(matchDetails, matchDetails.kickOffTeam, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 519, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`shot made - bottom team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[3];

    const endPos = bMovement.shotMade(matchDetails, matchDetails.secondTeam, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 519, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`shot made - low skill`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[3];

    player.skill.shooting = 1;
    const endPos = bMovement.shotMade(matchDetails, matchDetails.secondTeam, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 519, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`shot made - even half`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[3];

    matchDetails.half = 2;
    const endPos = bMovement.shotMade(matchDetails, matchDetails.secondTeam, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 519, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`shot made - bad half input`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[3];

    matchDetails.half = 2;
    try {
      bMovement.shotMade(matchDetails, matchDetails.secondTeam, player);
    } catch (err) {
      expect(err).to.be.an('Error');

      expect(String(err)).to.have.string('You cannot supply 0 as a half');
    }
  });
});

describe('penaltyTaken()', function () {
  it(`shot made - top team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.kickOffTeam.players[3];

    const endPos = penaltyTaken(matchDetails, matchDetails.kickOffTeam, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 519, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`shot made - bottom team`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[3];

    const endPos = penaltyTaken(matchDetails, matchDetails.secondTeam, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 519, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`shot made - low skill`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[3];

    player.skill.shooting = 1;
    const endPos = penaltyTaken(matchDetails, matchDetails.secondTeam, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 519, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`shot made - even half`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[3];

    matchDetails.half = 2;
    const endPos = penaltyTaken(matchDetails, matchDetails.secondTeam, player);

    if (!Array.isArray(endPos)) {
      throw new Error(`Expected [number, number] but received MatchDetails state update.`);
    }

    const xBetween = common.isBetween(endPos[0], 330, 345);

    const yBetween = common.isBetween(endPos[1], 519, 535);

    expect(xBetween).to.eql(true);

    expect(yBetween).to.eql(true);
  });

  it(`shot made - bad half input`, async () => {
    const matchDetails = await readMatchDetails('./src/test/input/getMovement/matchDetails1.json');

    const player = matchDetails.secondTeam.players[3];

    matchDetails.half = 22;
    try {
      penaltyTaken(matchDetails, matchDetails.secondTeam, player);
    } catch (err) {
      expect(err).to.be.an('Error');

      expect(String(err)).to.have.string('You cannot supply 0 as a half');
    }
  });
});
const checkGoalScored = './src/test/input/getMovement/checkGoalScored.json';

describe('checkGoalScored()', function () {
  it(`koteam close to ball`, async () => {
    const matchDetails = await readMatchDetails(checkGoalScored);

    matchDetails.kickOffTeam.players[0].skill.saving = 101;

    bMovement.checkGoalScored(matchDetails);

    expect(matchDetails.kickOffTeam.players[0].hasBall).to.eql(true);

    expect(matchDetails.ball.Player).to.eql('78883930303030100');

    expect(matchDetails.kickOffTeam.intent).to.eql(`attack`);

    expect(matchDetails.secondTeam.intent).to.eql(`defend`);
  });

  it(`steam close to ball`, async () => {
    const matchDetails = await readMatchDetails(checkGoalScored);

    const { ball } = matchDetails;

    const [bx, , bz] = ball.position;

    common.setBallPosition(ball, bx, 1048, bz);

    matchDetails.secondTeam.players[0].skill.saving = 101;

    bMovement.checkGoalScored(matchDetails);

    expect(matchDetails.secondTeam.players[0].hasBall).to.eql(true);

    expect(matchDetails.ball.Player).to.eql('78883930303030200');

    expect(matchDetails.secondTeam.intent).to.eql(`attack`);

    expect(matchDetails.kickOffTeam.intent).to.eql(`defend`);
  });

  it(`second team goal scored`, async () => {
    const matchDetails = await readMatchDetails(checkGoalScored);

    matchDetails.ball.position = [350, -1];

    bMovement.checkGoalScored(matchDetails);

    expect(matchDetails.ball.withTeam).to.eql('78883930303030002');

    expect(matchDetails.kickOffTeam.intent).to.eql(`attack`);

    expect(matchDetails.secondTeam.intent).to.eql(`defend`);

    expect(matchDetails.secondTeamStatistics.goals).to.eql(1);
  });

  it(`kickoff team goal scored`, async () => {
    const matchDetails = await readMatchDetails(checkGoalScored);

    matchDetails.ball.position = [350, 1051];

    bMovement.checkGoalScored(matchDetails);

    expect(matchDetails.ball.withTeam).to.eql('78883930303030003');

    expect(matchDetails.secondTeam.intent).to.eql(`attack`);

    expect(matchDetails.kickOffTeam.intent).to.eql(`defend`);

    expect(matchDetails.kickOffTeamStatistics.goals).to.eql(1);
  });

  it(`kickoff team goal scored - top`, async () => {
    const matchDetails = await readMatchDetails(checkGoalScored);

    matchDetails.ball.position = [350, -1];

    matchDetails.half = 2;

    bMovement.checkGoalScored(matchDetails);

    expect(matchDetails.ball.withTeam).to.eql('78883930303030003');

    expect(matchDetails.secondTeam.intent).to.eql(`attack`);

    expect(matchDetails.kickOffTeam.intent).to.eql(`defend`);

    expect(matchDetails.kickOffTeamStatistics.goals).to.eql(1);
  });

  it(`second team goal scored - top`, async () => {
    const matchDetails = await readMatchDetails(checkGoalScored);

    matchDetails.ball.position = [350, 1051];

    matchDetails.half = 2;

    bMovement.checkGoalScored(matchDetails);

    expect(matchDetails.ball.withTeam).to.eql('78883930303030002');

    expect(matchDetails.kickOffTeam.intent).to.eql(`attack`);

    expect(matchDetails.secondTeam.intent).to.eql(`defend`);

    expect(matchDetails.secondTeamStatistics.goals).to.eql(1);
  });

  it(`top goal scored - bad half`, async () => {
    const matchDetails = await readMatchDetails(checkGoalScored);

    matchDetails.ball.position = [350, -1];

    matchDetails.half = 0;
    try {
      bMovement.checkGoalScored(matchDetails);
    } catch (err) {
      expect(err).to.be.an('Error');

      expect(String(err)).to.have.string('cannot set half as 0');
    }
  });

  it(`bottom goal scored - bad half`, async () => {
    const matchDetails = await readMatchDetails(checkGoalScored);

    matchDetails.ball.position = [350, 1051];

    matchDetails.half = 0;
    try {
      bMovement.checkGoalScored(matchDetails);
    } catch (err) {
      expect(err).to.be.an('Error');

      expect(String(err)).to.have.string('cannot set half as 0');
    }
  });
});
