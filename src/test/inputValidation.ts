import { expect, it, describe, assert } from 'vitest';

import { readFile } from '../lib/fileReader.js';
import * as common from '../lib/common.js';

import validation from './lib/validate_tests.js';
import { readMatchDetails } from './lib/utils.js';

describe('testValidationOfInputData()', function () {
  it('init game returns an object', async () => {
    const t1location = './src/init_config/team1.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/init_config/pitch.json';

    const initJSON = await validation.initGame(
      t1location,
      t2location,
      plocation,
    );

    expect(initJSON).to.be.an('object');
  });
  it('playIteration returns an Object', async () => {
    const providedItJson = './src/init_config/iteration.json';

    const outputIteration = await validation.playIter(providedItJson);

    expect(outputIteration).to.be.an('object');
  });
  it('start second half returns an Object', async () => {
    const providedItJson = './src/init_config/iteration.json';

    const shJSON = await validation.setupSecondHalf(providedItJson);

    expect(shJSON).to.be.an('object');
  });
});
describe('testValidationOfBadInitInputData()', function () {
  it('init game fails on pitch height', async () => {
    const t1location = './src/init_config/team1.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/test/input/badInput/badPitchHeight.json';
    try {
      const output = await validation.initGame(
        t1location,
        t2location,
        plocation,
      );
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Please provide pitchWidth and pitchHeight',
      );
    }
  });
  it('init game fails on pitch width', async () => {
    const t1location = './src/init_config/team1.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/test/input/badInput/badPitchWidth.json';
    try {
      const output = await validation.initGame(
        t1location,
        t2location,
        plocation,
      );
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Please provide pitchWidth and pitchHeight',
      );
    }
  });
  it('init game fails on bad team name', async () => {
    const t1location = './src/test/input/badInput/badTeamName.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/init_config/pitch.json';
    try {
      const output = await validation.initGame(
        t1location,
        t2location,
        plocation,
      );
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string('No team name given');
    }
  });
  it('init game fails on not enough players', async () => {
    const t1location = './src/test/input/badInput/notEnoughPlayers.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/init_config/pitch.json';
    try {
      const output = await validation.initGame(
        t1location,
        t2location,
        plocation,
      );
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'There must be 11 players in a team',
      );
    }
  });
  it('init game fails on player no strength', async () => {
    const t1location = './src/test/input/badInput/playerNoStrength.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/init_config/pitch.json';
    try {
      const output = await validation.initGame(
        t1location,
        t2location,
        plocation,
      );
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      const expectedString =
        'Provide skills: passing,shooting,tackling,saving,agility,strength,penalty_taking,jumping';
      expect(err.toString()).to.have.string(expectedString);
    }
  });
  it('init game fails on player no injury', async () => {
    const t1location = './src/test/input/badInput/noInjury.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/init_config/pitch.json';
    try {
      const output = await validation.initGame(
        t1location,
        t2location,
        plocation,
      );
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Player must contain JSON variable: injured',
      );
    }
  });
  it('init game fails on player no fitness', async () => {
    const t1location = './src/test/input/badInput/noFitness.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/init_config/pitch.json';
    try {
      const output = await validation.initGame(
        t1location,
        t2location,
        plocation,
      );
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Player must contain JSON variable: fitness',
      );
    }
  });
});
describe('testValidationOfBadIterationInputData()', function () {
  it('playIteration no player name', async () => {
    const providedItJson =
      './src/test/input/badInput/noPlayerNameIteration.json';
    try {
      const outputIteration = await validation.playIter(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Player must contain JSON variable: name',
      );
    }
  });
  it('playIteration no half', async () => {
    const providedItJson = './src/test/input/badInput/noHalf.json';
    try {
      const outputIteration = await validation.playIter(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Please provide valid match details JSON',
      );
    }
  });
  it('playIteration no ball with team', async () => {
    const providedItJson = './src/test/input/badInput/noBallWithTeam.json';
    try {
      const outputIteration = await validation.playIter(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      const expectedOutput =
        'Provide: position,withPlayer,Player,withTeam,direction,ballOverIterations';
      expect(err.toString()).to.have.string(expectedOutput);
    }
  });
  it('playIteration no current pos', async () => {
    const providedItJson = './src/test/input/badInput/nocurrentPOS.json';
    try {
      const outputIteration = await validation.playIter(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Player must contain JSON variable: currentPOS',
      );
    }
  });
  it('playIteration no iteration log', async () => {
    const providedItJson = './src/test/input/badInput/noIterationLog.json';
    try {
      const outputIteration = await validation.playIter(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Please provide valid match details JSON',
      );
    }
  });
});
describe('testValidationOfSecondHalfInputData()', function () {
  it('start second half no intent', async () => {
    const providedItJson = './src/test/input/badInput/secondHalfNoIntent.json';
    try {
      const shJSON = await validation.setupSecondHalf(providedItJson);
      expect(shJSON).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string('No team intent given.');
    }
  });
  it('start second half no kick off team', async () => {
    const providedItJson =
      './src/test/input/badInput/secondHalfNoKickoffTeam.json';
    try {
      const shJSON = await validation.setupSecondHalf(providedItJson);
      expect(shJSON).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Please provide valid match details JSON',
      );
    }
  });
  it('start second half no red card', async () => {
    const providedItJson = './src/test/input/badInput/secondHalfNoRedCard.json';
    try {
      const shJSON = await validation.setupSecondHalf(providedItJson);
      expect(shJSON).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Player must contain JSON variable: stats',
      );
    }
  });
});
describe('testObjectIDsInitiateGame()', function () {
  it('object id given to match', async () => {
    const t1location = './src/init_config/team1.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/init_config/pitch.json';
    const output = await validation.initGame(t1location, t2location, plocation);
    expect(output.matchID).to.be.an('number');
    const idNumberBetweenOutliers = common.isBetween(
      Number(output.matchID),
      1000000000000,
      999999999999999,
    );
    expect(idNumberBetweenOutliers).to.eql(true);
  });
  it('object id given to team', async () => {
    const t1location = './src/init_config/team1.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/init_config/pitch.json';
    const output = await validation.initGame(t1location, t2location, plocation);
    expect(output.kickOffTeam.teamID).to.be.an('number');
    const idNumberBetweenKOTOutliers = common.isBetween(
      output.kickOffTeam.teamID,
      1000000000000,
      999999999999999,
    );
    expect(idNumberBetweenKOTOutliers).to.eql(true);
    expect(output.secondTeam.teamID).to.be.an('number');
    const idNumberBetweenSTOutliers = common.isBetween(
      output.secondTeam.teamID,
      1000000000000,
      999999999999999,
    );
    expect(idNumberBetweenSTOutliers).to.eql(true);
  });
  it('object id given to players', async () => {
    const t1location = './src/init_config/team1.json';
    const t2location = './src/init_config/team2.json';
    const plocation = './src/init_config/pitch.json';
    const output = await validation.initGame(t1location, t2location, plocation);
    for (const player of output.kickOffTeam.players) {
      expect(player.playerID).to.be.an('number');
      const idNumberBetweenOutliers = common.isBetween(
        player.playerID,
        1000000000000,
        999999999999999,
      );
      expect(idNumberBetweenOutliers).to.eql(true);
    }
  });
});
describe('testObjectIDsIteration()', function () {
  it('match id validation', async () => {
    const providedItJson = './src/test/input/badInput/noMatchID.json';
    try {
      const outputIteration = await validation.playIter(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Please provide valid match details JSON',
      );
    }
  });
  it('team id validation', async () => {
    const providedItJson = './src/test/input/badInput/noTeamID.json';
    try {
      const outputIteration = await validation.playIter(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string('No team ID given.');
    }
  });
  it('player id validation', async () => {
    const providedItJson = './src/test/input/badInput/noPlayerID.json';
    try {
      const outputIteration = await validation.playIter(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      assert(err instanceof Error);
      expect(err.toString()).to.have.string(
        'Player must contain JSON variable: playerID',
      );
    }
  });
});
describe('otherValidationTests()', function () {
  it('Not enough parameters in validate arguments', async () => {
    try {
      // Cast the function to any to bypass the 3-argument requirement check
      (validation.validateArguments as unknown)('', '');

      assert.fail('Should have thrown an error for missing arguments');
    } catch (err: unknown) {
      assert(err instanceof Error);
      expect(err.message).to.contain('Please provide two teams and a pitch');
    }
  });
  it('validate team even if not in JSON format', async () => {
    const team = await readFile('./src/init_config/team1.json');
    expect(validation.validateTeam(team)).to.not.be.an('Error');
  });
  it('validate team in second half even if not in JSON format', async () => {
    const iteration = await readMatchDetails(
      './src/init_config/iteration.json',
    );
    const team = JSON.stringify(iteration.kickOffTeam);
    expect(validation.validateTeamSecondHalf(team)).to.not.be.an('Error');
  });
  it('validate team in second half with no team name', async () => {
    const iteration = await readMatchDetails(
      './src/init_config/iteration.json',
    );

    // 1. Force the invalid state (bypassing TS required check)
    (iteration.kickOffTeam as unknown).name = undefined;

    // 2. Convert to string as required by the validation function
    const teamJsonString = JSON.stringify(iteration.kickOffTeam);

    try {
      validation.validateTeamSecondHalf(teamJsonString);

      // 3. Fail the test if no error was thrown
      assert.fail(
        'Validation should have thrown an error for missing team name',
      );
    } catch (err: unknown) {
      // 4. Standardize error check and type narrowing
      assert(err instanceof Error);
      expect(err.message).to.contain('No team name given');
    }
  });
});
