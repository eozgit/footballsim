const { expect } = require('chai');
const validation = require('./lib/validate_tests');
const common = require('../lib/common');

//disable console errors in tests
console.error = function () {};

describe('testValidationOfInputData()', function () {
  it('init game returns an object', async () => {
    let t1location = './init_config/team1.json';
    let t2location = './init_config/team2.json';
    let plocation = './init_config/pitch.json';

    let initJSON = await validation.initGame(t1location, t2location, plocation);

    expect(initJSON).to.be.an('object');
  });
  it('playIteration returns an Object', async () => {
    let providedItJson = './init_config/iteration.json';

    let outputIteration = await validation.playIteration(providedItJson);

    expect(outputIteration).to.be.an('object');
  });
  it('start second half returns an Object', async () => {
    let providedItJson = './init_config/iteration.json';

    let shJSON = await validation.setupSecondHalf(providedItJson);

    expect(shJSON).to.be.an('object');
  });
});
describe('testValidationOfBadInitInputData()', function () {
  it('init game fails on pitch height', async () => {
    let t1location = './init_config/team1.json';
    let t2location = './init_config/team2.json';
    let plocation = './test/input/badInput/badPitchHeight.json';
    try {
      let output = await validation.initGame(t1location, t2location, plocation);
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Please provide pitchWidth and pitchHeight');
    }
  });
  it('init game fails on pitch width', async () => {
    let t1location = './init_config/team1.json';
    let t2location = './init_config/team2.json';
    let plocation = './test/input/badInput/badPitchWidth.json';
    try {
      let output = await validation.initGame(t1location, t2location, plocation);
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Please provide pitchWidth and pitchHeight');
    }
  });
  it('init game fails on bad team name', async () => {
    let t1location = './test/input/badInput/badTeamName.json';
    let t2location = './init_config/team2.json';
    let plocation = './init_config/pitch.json';
    try {
      let output = await validation.initGame(t1location, t2location, plocation);
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('No team name given');
    }
  });
  it('init game fails on not enough players', async () => {
    let t1location = './test/input/badInput/notEnoughPlayers.json';
    let t2location = './init_config/team2.json';
    let plocation = './init_config/pitch.json';
    try {
      let output = await validation.initGame(t1location, t2location, plocation);
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('There must be 11 players in a team');
    }
  });
  it('init game fails on player no strength', async () => {
    let t1location = './test/input/badInput/playerNoStrength.json';
    let t2location = './init_config/team2.json';
    let plocation = './init_config/pitch.json';
    try {
      let output = await validation.initGame(t1location, t2location, plocation);
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      let expectedString =
        'Provide skills: passing,shooting,tackling,saving,agility,strength,penalty_taking,jumping';
      expect(err.toString()).to.have.string(expectedString);
    }
  });
  it('init game fails on player no injury', async () => {
    let t1location = './test/input/badInput/noInjury.json';
    let t2location = './init_config/team2.json';
    let plocation = './init_config/pitch.json';
    try {
      let output = await validation.initGame(t1location, t2location, plocation);
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Player must contain JSON variable: injured');
    }
  });
  it('init game fails on player no fitness', async () => {
    let t1location = './test/input/badInput/noFitness.json';
    let t2location = './init_config/team2.json';
    let plocation = './init_config/pitch.json';
    try {
      let output = await validation.initGame(t1location, t2location, plocation);
      expect(output).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Player must contain JSON variable: fitness');
    }
  });
});
describe('testValidationOfBadIterationInputData()', function () {
  it('playIteration no player name', async () => {
    let providedItJson = './test/input/badInput/noPlayerNameIteration.json';
    try {
      let outputIteration = await validation.playIteration(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Player must contain JSON variable: name');
    }
  });
  it('playIteration no half', async () => {
    let providedItJson = './test/input/badInput/noHalf.json';
    try {
      let outputIteration = await validation.playIteration(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Please provide valid match details JSON');
    }
  });
  it('playIteration no ball with team', async () => {
    let providedItJson = './test/input/badInput/noBallWithTeam.json';
    try {
      let outputIteration = await validation.playIteration(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      let expectedOutput =
        'Provide: position,withPlayer,Player,withTeam,direction,ballOverIterations';
      expect(err.toString()).to.have.string(expectedOutput);
    }
  });
  it('playIteration no current pos', async () => {
    let providedItJson = './test/input/badInput/nocurrentPOS.json';
    try {
      let outputIteration = await validation.playIteration(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Player must contain JSON variable: currentPOS');
    }
  });
  it('playIteration no iteration log', async () => {
    let providedItJson = './test/input/badInput/noIterationLog.json';
    try {
      let outputIteration = await validation.playIteration(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Please provide valid match details JSON');
    }
  });
});
describe('testValidationOfSecondHalfInputData()', function () {
  it('start second half no intent', async () => {
    let providedItJson = './test/input/badInput/secondHalfNoIntent.json';
    try {
      let shJSON = await validation.setupSecondHalf(providedItJson);
      expect(shJSON).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('No team intent given.');
    }
  });
  it('start second half no kick off team', async () => {
    let providedItJson = './test/input/badInput/secondHalfNoKickoffTeam.json';
    try {
      let shJSON = await validation.setupSecondHalf(providedItJson);
      expect(shJSON).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Please provide valid match details JSON');
    }
  });
  it('start second half no red card', async () => {
    let providedItJson = './test/input/badInput/secondHalfNoRedCard.json';
    try {
      let shJSON = await validation.setupSecondHalf(providedItJson);
      expect(shJSON).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Player must contain JSON variable: stats');
    }
  });
});
describe('testObjectIDsInitiateGame()', function () {
  it('object id given to match', async () => {
    let t1location = './init_config/team1.json';
    let t2location = './init_config/team2.json';
    let plocation = './init_config/pitch.json';
    let output = await validation.initGame(t1location, t2location, plocation);
    expect(output.matchID).to.be.an('number');
    let idNumberBetweenOutliers = common.isBetween(output.matchID, 1000000000000, 999999999999999);
    expect(idNumberBetweenOutliers).to.eql(true);
  });
  it('object id given to team', async () => {
    let t1location = './init_config/team1.json';
    let t2location = './init_config/team2.json';
    let plocation = './init_config/pitch.json';
    let output = await validation.initGame(t1location, t2location, plocation);
    expect(output.kickOffTeam.teamID).to.be.an('number');
    let idNumberBetweenKOTOutliers = common.isBetween(
      output.kickOffTeam.teamID,
      1000000000000,
      999999999999999
    );
    expect(idNumberBetweenKOTOutliers).to.eql(true);
    expect(output.secondTeam.teamID).to.be.an('number');
    let idNumberBetweenSTOutliers = common.isBetween(
      output.secondTeam.teamID,
      1000000000000,
      999999999999999
    );
    expect(idNumberBetweenSTOutliers).to.eql(true);
  });
  it('object id given to players', async () => {
    let t1location = './init_config/team1.json';
    let t2location = './init_config/team2.json';
    let plocation = './init_config/pitch.json';
    let output = await validation.initGame(t1location, t2location, plocation);
    for (let player of output.kickOffTeam.players) {
      expect(player.playerID).to.be.an('number');
      let idNumberBetweenOutliers = common.isBetween(
        player.playerID,
        1000000000000,
        999999999999999
      );
      expect(idNumberBetweenOutliers).to.eql(true);
    }
  });
});
describe('testObjectIDsIteration()', function () {
  it('match id validation', async () => {
    let providedItJson = './test/input/badInput/noMatchID.json';
    try {
      let outputIteration = await validation.playIteration(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Please provide valid match details JSON');
    }
  });
  it('team id validation', async () => {
    let providedItJson = './test/input/badInput/noTeamID.json';
    try {
      let outputIteration = await validation.playIteration(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('No team ID given.');
    }
  });
  it('player id validation', async () => {
    let providedItJson = './test/input/badInput/noPlayerID.json';
    try {
      let outputIteration = await validation.playIteration(providedItJson);
      expect(outputIteration).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Player must contain JSON variable: playerID');
    }
  });
});
describe('otherValidationTests()', function () {
  it('Not enough paramaters in validate arguments', async () => {
    try {
      validation.validateArguments('', '');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('Please provide two teams and a pitch');
    }
  });
  it('validate team even if not in JSON format', async () => {
    let team = await validation.readFile('./init_config/team1.json');
    expect(validation.validateTeam(team)).to.not.be.an('Error');
  });
  it('validate team in second half even if not in JSON format', async () => {
    let iteration = await common.readFile('./init_config/iteration.json');
    let team = JSON.stringify(iteration.kickOffTeam);
    expect(validation.validateTeamSecondHalf(team)).to.not.be.an('Error');
  });
  it('validate team in second half with no team name', async () => {
    let iteration = await common.readFile('./init_config/iteration.json');
    delete iteration.kickOffTeam.name;
    try {
      let team = JSON.stringify(iteration.kickOffTeam);
      expect(validation.validateTeamSecondHalf(team)).to.be.an('Error');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.toString()).to.have.string('No team name given');
    }
  });
});
