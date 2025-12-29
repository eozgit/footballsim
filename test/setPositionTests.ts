import { expect, it, describe } from 'vitest';

import setpieces from './lib/set_pieces.js';

describe('testBoundariesForBottomGoal()', function () {
  it('expected Bottom Goal', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.setBottomGoalKick(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const goalKick = nextJSON.iterationLog.indexOf('Goal Kick to - ThatTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[0].currentPOS[1]).to.be.lessThan(
      insideHalf,
    );
    expect(goalKick).to.be.greaterThan(-1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    for (const player of nextJSON.secondTeam.players) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      if (player.playerID !== nextJSON.secondTeam.players[0].playerID) {
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] - 80,
        ]);
      }
    }
  });
});
describe('testBoundariesForTopGoal()', function () {
  it('expected Top Goal', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.setTopGoalKick(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const goalKick = nextJSON.iterationLog.indexOf('Goal Kick to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[0].currentPOS[1]).to.be.gt(insideHalf);
    expect(goalKick).to.be.greaterThan(-1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    for (const player of nextJSON.kickOffTeam.players) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      if (player.playerID !== nextJSON.kickOffTeam.players[0].playerID) {
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] + 80,
        ]);
      }
    }
  });
});
describe('testBoundariesForBottomGoalSecondHalf()', function () {
  it('expected Bottom Goal', async () => {
    const itlocation = './test/input/boundaryPositions/secondHalfGoalKick.json';
    const nextJSON = await setpieces.setBottomGoalKick(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const goalKick = nextJSON.iterationLog.indexOf('Goal Kick to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[0].currentPOS[1]).to.be.lessThan(
      insideHalf,
    );
    expect(goalKick).to.be.greaterThan(-1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    for (const player of nextJSON.kickOffTeam.players) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      if (player.playerID !== nextJSON.kickOffTeam.players[0].playerID) {
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] - 80,
        ]);
      }
    }
  });
});
describe('testBoundariesForTopGoalSecondHalf()', function () {
  it('expected Top Goal', async () => {
    const itlocation = './test/input/boundaryPositions/secondHalfGoalKick.json';
    const nextJSON = await setpieces.setTopGoalKick(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const goalKick = nextJSON.iterationLog.indexOf('Goal Kick to - ThatTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[0].currentPOS[1]).to.be.gt(insideHalf);
    expect(goalKick).to.be.greaterThan(-1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    for (const player of nextJSON.secondTeam.players) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      if (player.playerID !== nextJSON.secondTeam.players[0].playerID) {
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] + 80,
        ]);
      }
    }
  });
});
describe('setKickOffTeamGoalScored()', function () {
  it('kickOff team in same position', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.setKickOffTeamGoalScored(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeamStatistics.goals).to.eql(1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    for (const player of nextJSON.kickOffTeam.players) {
      expect(player.currentPOS).to.eql(player.originPOS);
    }
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    for (const player of nextJSON.secondTeam.players) {
      if (player.name === 'Aiden Smith') {
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        expect(player.currentPOS[1]).to.eql(nextJSON.ball.position[1]);
        expect(player.currentPOS[0]).to.within(
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          nextJSON.ball.position[0],
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          nextJSON.ball.position[0] + 20,
        );
      } else if (player.name === 'Wayne Smith') {
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        expect(player.currentPOS[1]).to.eql(nextJSON.ball.position[1]);
        expect(player.currentPOS[0]).to.within(
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          nextJSON.ball.position[0],
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          nextJSON.ball.position[0] + 20,
        );
      } else {
        expect(player.currentPOS).to.eql(player.originPOS);
      }
    }
  });
});
describe('setSecondTeamGoalScored()', function () {
  it('second team in same position', async () => {
    const itlocation = './init_config/iteration2.json';
    const nextJSON = await setpieces.setSecondTeamGoalScored(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeamStatistics.goals).to.eql(1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    for (const player of nextJSON.secondTeam.players) {
      expect(player.currentPOS).to.eql(player.originPOS);
    }
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    for (const player of nextJSON.secondTeam.players) {
      if (player.name === 'Peter Johnson') {
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        expect(player.currentPOS[1]).to.eql(nextJSON.ball.position[1]);
        expect(player.currentPOS[0]).to.within(
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          nextJSON.ball.position[0],
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          nextJSON.ball.position[0] + 20,
        );
      } else if (player.name === 'Louise Johnson') {
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        expect(player.currentPOS[1]).to.eql(nextJSON.ball.position[1]);
        expect(player.currentPOS[0]).to.within(
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          nextJSON.ball.position[0],
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          nextJSON.ball.position[0] + 20,
        );
      } else {
        expect(player.currentPOS).to.eql(player.originPOS);
      }
    }
  });
});
describe('setFreekick()', function () {
  it('kickoff team assigned a freekick', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.setSetpieceKickOffTeam(itlocation);

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeamStatistics.freekicks).to.eql(1);
  });
  it('second team assigned a freekick', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.setSetpieceSecondTeam(itlocation);

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeamStatistics.freekicks).to.eql(1);
  });
});
describe('setPenalties()', function () {
  it('kickoff team assigned a bottom penalty', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteambottompenalty.json';
    const nextJSON = await setpieces.setSetpieceKickOffTeam(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const penaltyLog = nextJSON.iterationLog.indexOf('penalty to: ThisTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeamStatistics.penalties).to.eql(1);
    expect(penaltyLog).to.be.greaterThan(-1);
  });
  it('second team assigned a bottom penalty', async () => {
    const itlocation =
      './test/input/boundaryPositions/secondteambottompenalty.json';
    const nextJSON = await setpieces.setSetpieceSecondTeam(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const penaltyLog = nextJSON.iterationLog.indexOf('penalty to: ThatTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeamStatistics.penalties).to.eql(1);
    expect(penaltyLog).to.be.greaterThan(-1);
  });
  it('kickoff team assigned a top penalty', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteamtoppenalty.json';
    const nextJSON = await setpieces.setSetpieceKickOffTeam(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const penaltyLog = nextJSON.iterationLog.indexOf('penalty to: ThisTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeamStatistics.penalties).to.eql(1);
    expect(penaltyLog).to.be.greaterThan(-1);
  });
  it('second team assigned a top penalty', async () => {
    const itlocation =
      './test/input/boundaryPositions/secondteamtoppenalty.json';
    const nextJSON = await setpieces.setSetpieceSecondTeam(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const penaltyLog = nextJSON.iterationLog.indexOf('penalty to: ThatTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeamStatistics.penalties).to.eql(1);
    expect(penaltyLog).to.be.greaterThan(-1);
  });
});
describe('testPenalties()', function () {
  it('top penalty returns kick off team players in the positions', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteamtoppenalty.json';
    const nextJSON = await setpieces.setupTopPenalty(itlocation);
    const pitchWidth = nextJSON.pitchSize[0];

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.kickOffTeam.teamID).to.eql(nextJSON.ball.withTeam);
    expect(nextJSON.ball.position).to.eql([pitchWidth / 2, 60]);
    expect(nextJSON.ball.direction).to.eql('north');
    expect(nextJSON.kickOffTeam.players[10].currentPOS).to.eql([
      pitchWidth / 2,
      60,
    ]);
    for (const player of nextJSON.kickOffTeam.players) {
      if (player.playerID !== nextJSON.kickOffTeam.players[10].playerID) {
        expect(player.currentPOS[1]).to.be.gt(
          nextJSON.kickOffTeam.players[10].currentPOS[1],
        );
      }
    }
    for (const player of nextJSON.secondTeam.players) {
      if (player.playerID !== nextJSON.secondTeam.players[0].playerID) {
        expect(player.currentPOS[1]).to.be.gt(
          nextJSON.kickOffTeam.players[10].currentPOS[1],
        );
      }
    }
  });
  it('bottom penalty returns kick off team players in the correct positions', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteambottompenalty.json';
    const nextJSON = await setpieces.setupBottomPenalty(itlocation);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.kickOffTeam.teamID).to.eql(nextJSON.ball.withTeam);
    expect(nextJSON.ball.position).to.eql([pitchWidth / 2, pitchHeight - 60]);
    expect(nextJSON.ball.direction).to.eql('south');
    expect(nextJSON.kickOffTeam.players[10].currentPOS).to.eql([
      pitchWidth / 2,
      pitchHeight - 60,
    ]);
    for (const player of nextJSON.kickOffTeam.players) {
      if (player.playerID !== nextJSON.kickOffTeam.players[10].playerID) {
        expect(player.currentPOS[1]).to.be.lt(
          nextJSON.kickOffTeam.players[10].currentPOS[1],
        );
      }
    }
    for (const player of nextJSON.secondTeam.players) {
      if (player.playerID !== nextJSON.secondTeam.players[0].playerID) {
        expect(player.currentPOS[1]).to.be.lt(
          nextJSON.kickOffTeam.players[10].currentPOS[1],
        );
      }
    }
  });
  it('top penalty returns second team players in the correct positions', async () => {
    const itlocation =
      './test/input/boundaryPositions/secondteamtoppenalty.json';
    const nextJSON = await setpieces.setupTopPenalty(itlocation);
    const pitchWidth = nextJSON.pitchSize[0];

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.secondTeam.teamID).to.eql(nextJSON.ball.withTeam);
    expect(nextJSON.ball.position).to.eql([pitchWidth / 2, 60]);
    expect(nextJSON.ball.direction).to.eql('north');
    expect(nextJSON.secondTeam.players[10].currentPOS).to.eql([
      pitchWidth / 2,
      60,
    ]);
    for (const player of nextJSON.secondTeam.players) {
      if (player.playerID !== nextJSON.secondTeam.players[10].playerID) {
        expect(player.currentPOS[1]).to.be.gt(
          nextJSON.secondTeam.players[10].currentPOS[1],
        );
      }
    }
    for (const player of nextJSON.kickOffTeam.players) {
      if (player.playerID !== nextJSON.kickOffTeam.players[0].playerID) {
        expect(player.currentPOS[1]).to.be.gt(
          nextJSON.secondTeam.players[10].currentPOS[1],
        );
      }
    }
  });
  it('bottom penalty returns second team players in the correct positions', async () => {
    const itlocation =
      './test/input/boundaryPositions/secondteambottompenalty.json';
    const nextJSON = await setpieces.setupBottomPenalty(itlocation);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.secondTeam.teamID).to.eql(nextJSON.ball.withTeam);
    expect(nextJSON.ball.position).to.eql([pitchWidth / 2, pitchHeight - 60]);
    expect(nextJSON.ball.direction).to.eql('south');
    expect(nextJSON.secondTeam.players[10].currentPOS).to.eql([
      pitchWidth / 2,
      pitchHeight - 60,
    ]);
    for (const player of nextJSON.secondTeam.players) {
      if (player.playerID !== nextJSON.secondTeam.players[10].playerID) {
        expect(player.currentPOS[1]).to.be.lt(
          nextJSON.secondTeam.players[10].currentPOS[1],
        );
      }
    }
    for (const player of nextJSON.kickOffTeam.players) {
      if (player.playerID !== nextJSON.kickOffTeam.players[0].playerID) {
        expect(player.currentPOS[1]).to.be.lt(
          nextJSON.secondTeam.players[10].currentPOS[1],
        );
      }
    }
  });
});

describe('testCorners()', function () {
  it('attacking team players are in relevant halves top left corner', async () => {
    const itlocation = './init_config/iteration.json';

    const nextJSON = await setpieces.setupTopLeftCorner(itlocation);
    // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;
    expect(nextJSON).to.be.an('object');
    for (const player of nextJSON.secondTeam.players) {
      if (player.position === 'GK' || player.position === 'CB') {
        expect(player.currentPOS[1]).to.be.greaterThan(insideHalf);
      } else if (player.position !== 'LB' && player.position !== 'RB') {
        expect(player.currentPOS[0]).to.be.greaterThan(pitchWidth / 4 + 5);
        expect(player.currentPOS[0]).to.be.lessThan(
          pitchWidth - pitchWidth / 4 - 5,
        );
        expect(player.currentPOS[1]).to.be.greaterThan(-1);
        expect(player.currentPOS[1]).to.be.lessThan(pitchHeight / 6 + 7);
      }
    }
  });
  it('attacking team players are in relevant halves bottom Left corner', async () => {
    const itlocation = './init_config/iteration.json';

    const nextJSON = await setpieces.setupBottomLeftCorner(itlocation);
    // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;
    expect(nextJSON).to.be.an('object');
    for (const player of nextJSON.kickOffTeam.players) {
      if (player.position === 'GK' || player.position === 'CB') {
        expect(player.currentPOS[1]).to.be.lessThan(insideHalf);
      } else if (player.position !== 'LB' && player.position !== 'RB') {
        expect(player.currentPOS[0]).to.be.greaterThan(pitchWidth / 4 + 5);
        expect(player.currentPOS[0]).to.be.lessThan(
          pitchWidth - pitchWidth / 4 - 5,
        );
        expect(player.currentPOS[1]).to.be.greaterThan(
          pitchHeight - pitchHeight / 6 + 5,
        );
        expect(player.currentPOS[1]).to.be.lessThan(pitchHeight + 1);
      }
    }
  });
  it('attacking team players are in relevant halves bottom right corner', async () => {
    const itlocation = './test/input/boundaryPositions/setCorners2.json';

    const nextJSON = await setpieces.setupBottomRightCorner(itlocation);
    // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;
    expect(nextJSON).to.be.an('object');
    for (const player of nextJSON.secondTeam.players) {
      if (player.position === 'GK' || player.position === 'CB') {
        expect(player.currentPOS[1]).to.be.lessThan(insideHalf);
      } else if (player.position !== 'LB' && player.position !== 'RB') {
        expect(player.currentPOS[0]).to.be.greaterThan(pitchWidth / 4 + 5);
        expect(player.currentPOS[0]).to.be.lessThan(
          pitchWidth - pitchWidth / 4 - 5,
        );
        expect(player.currentPOS[1]).to.be.greaterThan(
          pitchHeight - pitchHeight / 6 + 5,
        );
        expect(player.currentPOS[1]).to.be.lessThan(pitchHeight + 1);
      }
    }
  });
  it('attacking team players are in relevant halves top right corner', async () => {
    const itlocation = './test/input/boundaryPositions/setCorners2.json';

    const nextJSON = await setpieces.setupTopRightCorner(itlocation);
    // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;
    expect(nextJSON).to.be.an('object');
    for (const player of nextJSON.kickOffTeam.players) {
      if (player.position === 'GK' || player.position === 'CB') {
        expect(player.currentPOS[1]).to.be.greaterThan(insideHalf);
      } else if (player.position !== 'LB' && player.position !== 'RB') {
        expect(player.currentPOS[0]).to.be.greaterThan(pitchWidth / 4 + 5);
        expect(player.currentPOS[0]).to.be.lessThan(
          pitchWidth - pitchWidth / 4 - 5,
        );
        expect(player.currentPOS[1]).to.be.greaterThan(-1);
        expect(player.currentPOS[1]).to.be.lessThan(pitchHeight / 6 + 7);
      }
    }
  });
});
describe('testThrowIns()', function () {
  it('kick off team left throw in', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.setLeftKickOffTeamThrowIn(
      itlocation,
      [-5, 120],
    );

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[0].currentPOS).to.eql([340, 0]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[1].currentPOS).to.eql([80, 230]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[2].currentPOS).to.eql([230, 230]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[3].currentPOS).to.eql([420, 230]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[4].currentPOS).to.eql([600, 230]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[5].currentPOS).to.eql([0, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[6].currentPOS).to.eql([230, 420]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[7].currentPOS).to.eql([10, 130]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[8].currentPOS).to.eql([15, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[9].currentPOS).to.eql([10, 110]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[10].currentPOS).to.eql([440, 650]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[0].currentPOS).to.eql([340, 1050]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[1].currentPOS).to.eql([80, 820]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[2].currentPOS).to.eql([230, 820]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[3].currentPOS).to.eql([420, 820]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[4].currentPOS).to.eql([600, 820]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[5].currentPOS).to.eql([20, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[6].currentPOS).to.eql([230, 630]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[7].currentPOS).to.eql([30, 125]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[8].currentPOS).to.eql([25, 105]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[9].currentPOS).to.eql([10, 90]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[10].currentPOS).to.eql([440, 400]);
  });
  it('second off team left throw in', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.setLeftSecondTeamThrowIn(
      itlocation,
      [-5, 120],
    );

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[0].currentPOS).to.eql([340, 0]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[1].currentPOS).to.eql([80, 80]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[2].currentPOS).to.eql([230, 80]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[3].currentPOS).to.eql([420, 80]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[4].currentPOS).to.eql([600, 80]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[5].currentPOS).to.eql([20, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[6].currentPOS).to.eql([230, 270]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[7].currentPOS).to.eql([30, 125]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[8].currentPOS).to.eql([25, 105]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[9].currentPOS).to.eql([10, 90]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[10].currentPOS).to.eql([440, 500]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[0].currentPOS).to.eql([340, 1050]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[1].currentPOS).to.eql([80, 970]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[2].currentPOS).to.eql([230, 970]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[3].currentPOS).to.eql([420, 970]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[4].currentPOS).to.eql([600, 970]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[5].currentPOS).to.eql([0, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[6].currentPOS).to.eql([230, 780]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[7].currentPOS).to.eql([10, 130]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[8].currentPOS).to.eql([15, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[9].currentPOS).to.eql([10, 110]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[10].currentPOS).to.eql([440, 550]);
  });
  it('kick off team right throw in', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.setRightKickOffTeamThrowIn(
      itlocation,
      [1200, 120],
    );

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[0].currentPOS).to.eql([340, 0]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[1].currentPOS).to.eql([80, 230]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[2].currentPOS).to.eql([230, 230]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[3].currentPOS).to.eql([420, 230]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[4].currentPOS).to.eql([600, 230]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[5].currentPOS).to.eql([680, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[6].currentPOS).to.eql([230, 420]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[7].currentPOS).to.eql([670, 130]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[8].currentPOS).to.eql([665, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[9].currentPOS).to.eql([670, 110]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[10].currentPOS).to.eql([440, 650]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[0].currentPOS).to.eql([340, 1050]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[1].currentPOS).to.eql([80, 820]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[2].currentPOS).to.eql([230, 820]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[3].currentPOS).to.eql([420, 820]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[4].currentPOS).to.eql([600, 820]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[5].currentPOS).to.eql([660, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[6].currentPOS).to.eql([230, 630]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[7].currentPOS).to.eql([650, 125]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[8].currentPOS).to.eql([655, 105]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[9].currentPOS).to.eql([670, 90]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[10].currentPOS).to.eql([440, 400]);
  });
  it('second off team right throw in', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.setRightSecondTeamThrowIn(
      itlocation,
      [1200, 120],
    );

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[0].currentPOS).to.eql([340, 0]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[1].currentPOS).to.eql([80, 80]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[2].currentPOS).to.eql([230, 80]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[3].currentPOS).to.eql([420, 80]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[4].currentPOS).to.eql([600, 80]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[5].currentPOS).to.eql([660, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[6].currentPOS).to.eql([230, 270]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[7].currentPOS).to.eql([650, 125]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[8].currentPOS).to.eql([655, 105]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[9].currentPOS).to.eql([670, 90]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[10].currentPOS).to.eql([440, 500]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[0].currentPOS).to.eql([340, 1050]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[1].currentPOS).to.eql([80, 970]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[2].currentPOS).to.eql([230, 970]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[3].currentPOS).to.eql([420, 970]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[4].currentPOS).to.eql([600, 970]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[5].currentPOS).to.eql([680, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[6].currentPOS).to.eql([230, 780]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[7].currentPOS).to.eql([670, 130]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[8].currentPOS).to.eql([665, 120]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[9].currentPOS).to.eql([670, 110]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[10].currentPOS).to.eql([440, 550]);
  });
});
describe('setPenalties()', function () {
  it('in bottom penalty area', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteambottompenalty.json';
    const isInBottomPenaltyArea = await setpieces.inBottomPenalty(itlocation);
    expect(isInBottomPenaltyArea).to.eql(true);
  });
  it('in top penalty area', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteamtoppenalty.json';
    const isInBottomPenaltyArea = await setpieces.inTopPenalty(itlocation);
    expect(isInBottomPenaltyArea).to.eql(true);
  });
  it('not in bottom penalty area', async () => {
    const itlocation =
      './test/input/boundaryPositions/intentPositionATTinOwnHalf.json';
    const isInBottomPenaltyArea = await setpieces.inBottomPenalty(itlocation);
    expect(isInBottomPenaltyArea).to.eql(false);
  });
  it('not in top penalty area', async () => {
    const itlocation =
      './test/input/boundaryPositions/intentPositionATTinOwnHalf.json';
    const isInBottomPenaltyArea = await setpieces.inTopPenalty(itlocation);
    expect(isInBottomPenaltyArea).to.eql(false);
  });
});

describe('setGoalieHasBall()', function () {
  it('checkGoalieHasBall', async () => {
    const itlocation = './init_config/iteration.json';
    const goalieHasBallSetup = await setpieces.goalieHasBall(itlocation);
    expect(goalieHasBallSetup.kickOffTeam.players[0].hasBall).to.eql(true);
    expect(goalieHasBallSetup.ball.withPlayer).to.eql(true);
    expect(goalieHasBallSetup.ball.withTeam).to.eql('78883930303030002');
    expect(goalieHasBallSetup.kickOffTeam.players[0].currentPOS).to.be.eql(
      goalieHasBallSetup.ball.position,
    );
  });
});
