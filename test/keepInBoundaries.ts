import { expect, it, describe } from 'vitest';

import { readFile } from '../lib/fileReader.js';

import setpieces from './lib/set_pieces.js';

describe('testBoundariesForCorners1()', function () {
  it('expected Top Left Corner', async () => {
    const itlocation = './test/input/keepInBoundaries/topLeftCorner.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '53137486250364320',
      [25, -1],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Corner to - Dragons');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[0].currentPOS[1]).to.be.lessThan(
      insideHalf,
    );
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Top Right Corner', async () => {
    const itlocation = './test/input/keepInBoundaries/topRightCorner.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '53137486250364320',
      [558, -1],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Corner to - Dragons');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[0].currentPOS[1]).to.be.lessThan(
      insideHalf,
    );
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Bottom Left Corner', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [15, 100000],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Corner to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[0].currentPOS[1]).to.be.greaterThan(
      insideHalf,
    );
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Bottom Right Corner', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [400, 100000],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Corner to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[0].currentPOS[1]).to.be.greaterThan(
      insideHalf,
    );
    expect(cornerLog).to.be.greaterThan(-1);
  });
});
describe('testBoundariesForCorners2()', function () {
  it('expected Top Left Corner', async () => {
    const itlocation = './test/input/boundaryPositions/setCorners2.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [15, -1],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Corner to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[0].currentPOS[1]).to.be.lessThan(
      insideHalf,
    );
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Top Right Corner', async () => {
    const itlocation = './test/input/boundaryPositions/setCorners2.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [400, -1],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Corner to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.secondTeam.players[0].currentPOS[1]).to.be.lessThan(
      insideHalf,
    );
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Bottom Left Corner', async () => {
    const itlocation = './test/input/boundaryPositions/setCorners2.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030002',
      [15, 100000],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const insideHalf = parseInt(nextJSON.pitchSize[1] / 2, 10);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Corner to - ThatTeam');

    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.kickOffTeam.players[0].currentPOS[1]).to.be.greaterThan(
      insideHalf,
    );
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Bottom Right Corner', async () => {
    const itlocation = './test/input/boundaryPositions/setCorners2.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030002',
      [400, 100000],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Corner to - ThatTeam');

    expect(nextJSON).to.be.an('object');
    expect(cornerLog).to.be.greaterThan(-1);
  });
});
describe('set throw in()', function () {
  it('expected kick off team throw in left', async () => {
    const itlocation = './test/input/boundaryPositions/setCorners2.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [-1, 200],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const throwLog = nextJSON.iterationLog.indexOf('Throw in to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    expect(throwLog).to.be.greaterThan(-1);
  });
  it('expected kick off team throw in right', async () => {
    const itlocation = './test/input/boundaryPositions/setCorners2.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [8000, 200],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const throwLog = nextJSON.iterationLog.indexOf('Throw in to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    expect(throwLog).to.be.greaterThan(-1);
  });
  it('expected second team throw in left', async () => {
    const itlocation = './test/input/boundaryPositions/setCorners2.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030002',
      [-1, 200],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const throwLog = nextJSON.iterationLog.indexOf('Throw in to - ThatTeam');

    expect(nextJSON).to.be.an('object');
    expect(throwLog).to.be.greaterThan(-1);
  });
  it('expected second team throw in right', async () => {
    const itlocation = './test/input/boundaryPositions/setCorners2.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030002',
      [8000, 200],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const throwLog = nextJSON.iterationLog.indexOf('Throw in to - ThatTeam');

    expect(nextJSON).to.be.an('object');
    expect(throwLog).to.be.greaterThan(-1);
  });
});
describe('goalKicks()', function () {
  it('expected Top Goal Kick', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [10, -1],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Goal Kick to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Bottom Goal Kick', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030002',
      [10, 1500],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Goal Kick to - ThatTeam');

    expect(nextJSON).to.be.an('object');
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Top Goal Kick 2', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteamtoppenalty.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030002',
      [500, -1],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Goal Kick to - ThatTeam');

    expect(nextJSON).to.be.an('object');
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Bottom Goal Kick 2', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteamtoppenalty.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [500, 1500],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Goal Kick to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Top Goal Kick 3', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteamtoppenalty.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030002',
      [50, -1],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Goal Kick to - ThatTeam');

    expect(nextJSON).to.be.an('object');
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Top Goal Kick 4', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteambottompenalty.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [400, -1],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Goal Kick to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Bottom Goal Kick 5', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteambottompenalty.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030002',
      [500, 1500],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Goal Kick to - ThatTeam');

    expect(nextJSON).to.be.an('object');
    expect(cornerLog).to.be.greaterThan(-1);
  });
  it('expected Top Goal Kick 6', async () => {
    const itlocation =
      './test/input/boundaryPositions/secondteambottompenalty.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [40, 1100],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const cornerLog = nextJSON.iterationLog.indexOf('Goal Kick to - ThisTeam');

    expect(nextJSON).to.be.an('object');
    expect(cornerLog).to.be.greaterThan(-1);
  });
});
describe('goalScored()', function () {
  it('expected second team goal scored', async () => {
    const itlocation = './init_config/iteration2.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030002',
      [330, -1],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const goalLog = nextJSON.iterationLog.indexOf(
      'Goal Scored by - Emily Smith - (ThatTeam)',
    );

    expect(nextJSON).to.be.an('object');
    expect(goalLog).to.be.greaterThan(-1);
  });
  it('expected kick off team goal scored', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [330, 1500],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const goalLog = nextJSON.iterationLog.indexOf(
      'Goal Scored by - Peter Johnson - (ThisTeam)',
    );

    expect(nextJSON).to.be.an('object');
    expect(goalLog).to.be.greaterThan(-1);
  });
  it('expected kick off team goal scored 2', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [352, 1500],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const goalLog = nextJSON.iterationLog.indexOf(
      'Goal Scored by - Peter Johnson - (ThisTeam)',
    );

    expect(nextJSON).to.be.an('object');
    expect(goalLog).to.be.greaterThan(-1);
  });
  it('expected kick off team goal scored 3', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteamtoppenalty.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '78883930303030003',
      [330, -1],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const goalLog = nextJSON.iterationLog.indexOf(
      'Goal Scored by - Peter Johnson - (ThisTeam)',
    );

    expect(nextJSON).to.be.an('object');
    expect(goalLog).to.be.greaterThan(-1);
  });
  it('expected second team goal scored - own goal', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteamtoppenalty.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '53137486250364320',
      [349, 1500],
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const goalLog = nextJSON.iterationLog.indexOf(
      'Goal Scored by - Peter Johnson - (ThatTeam)',
    );

    expect(nextJSON).to.be.an('object');
    expect(goalLog).to.be.greaterThan(-1);
  });
});
describe('no boundary()', function () {
  it('returns unchanged matchDetails', async () => {
    const itlocation =
      './test/input/boundaryPositions/kickoffteamtoppenalty.json';
    const nextJSON = await setpieces.keepInBoundaries(
      itlocation,
      '53137486250364320',
      [349, 200],
    );
    const matchDetails = await readFile(itlocation);
    expect(nextJSON).to.be.an('object');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(nextJSON.ballIntended).to.eql([349, 200]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    delete nextJSON.ballIntended;
    expect(matchDetails).to.eql(nextJSON);
  });
});
