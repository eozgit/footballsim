import { readFile } from '../lib/fileReader.js';
import setpieces from './lib/set_pieces.js';
import common from '../lib/common.js';

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
    const testTeam = JSON.parse(JSON.stringify(matchDetails.kickOffTeam));
    const nextJSON = await setpieces.switchSide(
      matchDetails,
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
    const testTeam = JSON.parse(JSON.stringify(matchDetails.secondTeam));
    const nextJSON = await setpieces.switchSide(
      matchDetails,
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
    delete matchDetails.secondTeam.players[0].originPOS;

    try {
      const nextJSON = await setpieces.switchSide(
        matchDetails,
        matchDetails.secondTeam,
      );
      expect(nextJSON).to.be.an(Object);
    } catch (err) {
      expect(err).to.be.an('Error');
      const expectedOutput = 'Each player must have an origin position set';
      expect(err.toString()).to.have.string(expectedOutput);
    }
  });
  it('low fitness level', async () => {
    const itlocation = './init_config/iteration.json';
    const matchDetails = await readFile(itlocation);
    matchDetails.secondTeam.players[0].fitness = 10;
    const nextJSON = await setpieces.switchSide(
      matchDetails,
      matchDetails.secondTeam,
    );

    expect(nextJSON.secondTeam.players[0].fitness).to.eql(60);
  });
});
