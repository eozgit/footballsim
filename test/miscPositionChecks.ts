import { expect, it, describe } from 'vitest';

import { readFile } from '../lib/fileReader.js';

import setpieces from './lib/set_pieces.js';

describe('removeBallFromAllPlayers()', function () {
  it('check no player has the ball after its been removed from all players', async () => {
    const itlocation = './init_config/iteration.json';

    const nextJSON = await setpieces.removeBallFromAllPlayers(itlocation);

    expect(nextJSON).to.be.an('object');
    for (const player of nextJSON.kickOffTeam.players) {
      expect(player.hasBall).to.eql(false);
    }
    for (const player of nextJSON.secondTeam.players) {
      expect(player.hasBall).to.eql(false);
    }
  });
});
describe('switchTeamSides()', function () {
  it('check players sides are switched kickoff team', async () => {
    const itlocation = './init_config/iteration.json';
    const matchDetails = await readFile(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testTeam = JSON.parse(JSON.stringify(matchDetails.kickOffTeam));
    const nextJSON = await setpieces.switchSide(
      matchDetails,
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      matchDetails.kickOffTeam,
    );

    for (const playerNum of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      expect(testTeam.players[playerNum].originPOS).to.not.eql(
        nextJSON.kickOffTeam.players[playerNum].originPOS,
      );
    }
  });
  it('check players sides are switched second team', async () => {
    const itlocation = './init_config/iteration.json';
    const matchDetails = await readFile(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testTeam = JSON.parse(JSON.stringify(matchDetails.secondTeam));
    const nextJSON = await setpieces.switchSide(
      matchDetails,
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      matchDetails.secondTeam,
    );

    for (const playerNum of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      expect(testTeam.players[playerNum].originPOS).to.not.eql(
        nextJSON.secondTeam.players[playerNum].originPOS,
      );
    }
  });
  it('no origin POS set', async () => {
    const itlocation = './init_config/iteration.json';
    const matchDetails = await readFile(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    delete matchDetails.secondTeam.players[0].originPOS;

    try {
      const nextJSON = await setpieces.switchSide(
        matchDetails,
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.secondTeam,
      );
      // @ts-expect-error TS(2345): Argument of type 'ObjectConstructor' is not assign... Remove this comment to see the full error message
      expect(nextJSON).to.be.an(Object);
    } catch (err) {
      expect(err).to.be.an('Error');
      const expectedOutput = 'Each player must have an origin position set';
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      expect(err.toString()).to.have.string(expectedOutput);
    }
  });
  it('low fitness level', async () => {
    const itlocation = './init_config/iteration.json';
    const matchDetails = await readFile(itlocation);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    matchDetails.secondTeam.players[0].fitness = 10;
    const nextJSON = await setpieces.switchSide(
      matchDetails,
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      matchDetails.secondTeam,
    );

    expect(nextJSON.secondTeam.players[0].fitness).to.eql(60);
  });
});
