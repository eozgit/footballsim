import { expect, it, describe } from 'vitest';

import { readFile } from '../lib/fileReader.js';
import actions from '../lib/actions.js';
import common from '../lib/common.js';
import playerMovement from '../lib/playerMovement.js';

describe('testFoulIntensity()', function () {
  it('Foul intensity between 0 and 100 - 1', async () => {
    const testIntensity = actions.foulIntensity();
    expect(testIntensity).to.be.gt(-1);
    expect(testIntensity).to.be.lt(101);
  });
  it('Foul intensity between 0 and 100 - 2', async () => {
    const testIntensity = actions.foulIntensity();
    expect(testIntensity).to.be.gt(-1);
    expect(testIntensity).to.be.lt(101);
  });
});
describe('testWasFoul()', function () {
  it('Foul returns false for (1,4)', async () => {
    const foul = actions.wasFoul(1, 4);
    expect(foul).to.be.eql(false);
  });
  it('Foul returns false for (10,18)', async () => {
    let timesTrue = 0;
    let timesFalse = 0;
    for (let i = 0; i < 1000; i++) {
      const foul = actions.wasFoul(10, 18);
      if (foul === true) timesTrue++;
      else timesFalse++;
    }
    expect(timesTrue).to.be.gt(200);
    expect(timesFalse).to.be.gt(200);
  });
  it('Foul returns false for (11,20)', async () => {
    let timesTrue = 0;
    let timesFalse = 0;
    for (let i = 0; i < 1000; i++) {
      const foul = actions.wasFoul(11, 20);
      if (foul === true) timesTrue++;
      else timesFalse++;
    }
    expect(timesTrue).to.be.gt(400);
    expect(timesFalse).to.be.gt(300);
  });
});
describe('testSelectActions()', function () {
  it('No actions returns a wait', async () => {
    const action = actions.selectAction([]);
    expect(action).to.be.eql('wait');
  });
});
describe('testSettingOfFoul()', function () {
  it('foul is set', async () => {
    const matchDetails = await readFile('init_config/iteration.json');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testPlayer = matchDetails.secondTeam.players[4];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thatPlayer = matchDetails.kickOffTeam.players[6];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testTackleTeam = matchDetails.secondTeam;
    actions.setFoul(matchDetails, testTackleTeam, testPlayer, thatPlayer);
    expect(
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      matchDetails.iterationLog.indexOf(`Foul against: ${thatPlayer.name}`),
    ).to.be.greaterThan(-1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[4].stats.tackles.fouls).to.eql(1);
  });
  it('foul is set', async () => {
    const matchDetails = await readFile('init_config/iteration.json');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testPlayer = matchDetails.kickOffTeam.players[4];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thatPlayer = matchDetails.secondTeam.players[6];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testTackleTeam = matchDetails.kickOffTeam;
    actions.setFoul(matchDetails, testTackleTeam, testPlayer, thatPlayer);
    expect(
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      matchDetails.iterationLog.indexOf(`Foul against: ${thatPlayer.name}`),
    ).to.be.greaterThan(-1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[4].stats.tackles.fouls).to.eql(1);
  });
  it('injury test setting', async () => {
    const matchDetails = await readFile('init_config/iteration.json');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testPlayer = matchDetails.secondTeam.players[4];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thatPlayer = matchDetails.kickOffTeam.players[6];
    actions.setInjury(matchDetails, thatPlayer, testPlayer, 14000, 15000);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (matchDetails.secondTeam.players[4].injured === true) {
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Player Injured - ${testPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
    }
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (matchDetails.kickOffTeam.players[6].injured === true) {
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Player Injured - ${thatPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
    }
  });
  it('injury is set when already injured', async () => {
    const matchDetails = await readFile('init_config/iteration.json');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testPlayer = matchDetails.secondTeam.players[4];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thatPlayer = matchDetails.kickOffTeam.players[6];
    actions.setInjury(matchDetails, thatPlayer, testPlayer, 23, 23);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (matchDetails.secondTeam.players[4].injured === true) {
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Player Injured - ${testPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
    }
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (matchDetails.kickOffTeam.players[6].injured === true) {
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Player Injured - ${thatPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
    }
  });
  it('injury is set', async () => {
    const matchDetails = await readFile('init_config/iteration.json');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    matchDetails.secondTeam.players[4].injured = true;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testPlayer = matchDetails.secondTeam.players[4];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thatPlayer = matchDetails.kickOffTeam.players[6];
    actions.setInjury(matchDetails, thatPlayer, testPlayer, 23, 23);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (matchDetails.secondTeam.players[4].injured === true) {
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Player Injured - ${testPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
    }
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (matchDetails.kickOffTeam.players[6].injured === true) {
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Player Injured - ${thatPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
    }
  });
});
describe('testSetPostTacklePosition()', function () {
  it('Set tackle position (3)', async () => {
    const matchDetails = await readFile('init_config/iteration.json');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testPlayer = matchDetails.secondTeam.players[4];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thatPlayer = matchDetails.kickOffTeam.players[6];
    actions.setPostTacklePosition(matchDetails, testPlayer, thatPlayer, 3);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[4].currentPOS).to.eql([600, 967]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[6].currentPOS).to.eql([230, 273]);
  });
  it('Set tackle position (3) other half', async () => {
    const matchDetails = await readFile('init_config/iteration2.json');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testPlayer = matchDetails.kickOffTeam.players[4];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thatPlayer = matchDetails.secondTeam.players[6];
    actions.setPostTacklePosition(matchDetails, testPlayer, thatPlayer, 3);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[4].currentPOS).to.eql([600, 83]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[6].currentPOS).to.eql([230, 777]);
  });
  it('Set tackle position (1)', async () => {
    const matchDetails = await readFile('init_config/iteration.json');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testPlayer = matchDetails.secondTeam.players[4];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thatPlayer = matchDetails.kickOffTeam.players[6];
    actions.setPostTacklePosition(matchDetails, testPlayer, thatPlayer, 1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[4].currentPOS).to.eql([600, 969]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[6].currentPOS).to.eql([230, 271]);
  });
  it('Set tackle position (1) other half', async () => {
    const matchDetails = await readFile('init_config/iteration2.json');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testPlayer = matchDetails.kickOffTeam.players[4];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thatPlayer = matchDetails.secondTeam.players[6];
    actions.setPostTacklePosition(matchDetails, testPlayer, thatPlayer, 1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[4].currentPOS).to.eql([600, 81]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[6].currentPOS).to.eql([230, 779]);
  });
});
describe('testSetPostTackleBall()', function () {
  it('Set tackle position (3)', async () => {
    const matchDetails = await readFile('init_config/iteration.json');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testPlayer = matchDetails.secondTeam.players[4];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testTeam = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const testOpposition = matchDetails.kickOffTeam;
    actions.setPostTackleBall(
      matchDetails,
      testTeam,
      testOpposition,
      testPlayer,
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.ball.lastTouch.playerName).to.eql('Emily Smith');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.ball.position).to.eql([600, 970]);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.ball.Player).to.eql('78883930303030204');
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.ball.withPlayer).to.eql(true);
  });
});
describe('testCalculationOfTackleScores()', function () {
  it('tackle score', async () => {
    const skills = {
      tackling: 50,
      strength: 50,
    };
    const tackleScore = actions.calcTackleScore(skills, 5);
    expect(true).to.eql(common.isBetween(tackleScore, 44, 56));
  });
  it('retention score', async () => {
    const skills = {
      agility: 50,
      strength: 50,
    };
    const retentionScore = actions.calcRetentionScore(skills, 5);
    expect(true).to.eql(common.isBetween(retentionScore, 44, 56));
  });
  it('tackler win', async () => {
    const tacklerSkills = {
      tackling: 100,
      strength: 80,
    };
    const retentionSkills = {
      agility: 80,
      strength: 65,
    };
    const tackleScore = actions.calcTackleScore(tacklerSkills, 5);
    const retentionScore = actions.calcRetentionScore(retentionSkills, 5);
    const result = tackleScore > retentionScore ? 'tackler' : 'retention';
    expect(result).to.eql('tackler');
  });
  it('retention win', async () => {
    const tacklerSkills = {
      tackling: 60,
      strength: 32,
    };
    const retentionSkills = {
      agility: 100,
      strength: 43,
    };
    const tackleScore = actions.calcTackleScore(tacklerSkills, 5);
    const retentionScore = actions.calcRetentionScore(retentionSkills, 5);
    const result = tackleScore > retentionScore ? 'tackler' : 'retention';
    expect(result).to.eql('retention');
  });
});
describe('testSlideTackle()', function () {
  let x = 0;
  for (let i = 0; i < 10; i++) {
    it(`resolve slide tackle ${x}`, async () => {
      const matchDetails = await readFile('init_config/iteration.json');
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testPlayer = matchDetails.secondTeam.players[4];
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testTeam = matchDetails.secondTeam;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testOpposition = matchDetails.kickOffTeam;
      actions.resolveSlide(testPlayer, testTeam, testOpposition, matchDetails);
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Slide tackle attempted by: ${testPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FTlog = matchDetails.iterationLog.indexOf(
        `Failed tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const STlog = matchDetails.iterationLog.indexOf(
        `Successful tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FAlog = matchDetails.iterationLog.indexOf(
        `Foul against: Peter Johnson`,
      );
      expect(FTlog + STlog + FAlog).to.be.greaterThan(-1);
      if (FTlog > -1) expect(testPlayer.stats.tackles.off).to.eql(1);
      if (STlog > -1) expect(testPlayer.stats.tackles.on).to.eql(1);
      if (FAlog > -1) expect(testPlayer.stats.tackles.fouls).to.eql(1);
    });
    it(`resolve slide tackle opposite ${x}`, async () => {
      const matchDetails = await readFile(
        'test/input/opposite/iterationSwitch.json',
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testPlayer = matchDetails.secondTeam.players[4];
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testTeam = matchDetails.secondTeam;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testOpposition = matchDetails.kickOffTeam;
      actions.resolveSlide(testPlayer, testTeam, testOpposition, matchDetails);
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Slide tackle attempted by: ${testPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FTlog = matchDetails.iterationLog.indexOf(
        `Failed tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const STlog = matchDetails.iterationLog.indexOf(
        `Successful tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FAlog = matchDetails.iterationLog.indexOf(
        `Foul against: Peter Johnson`,
      );
      expect(FTlog + STlog + FAlog).to.be.greaterThan(-1);
      if (FTlog > -1) expect(testPlayer.stats.tackles.off).to.eql(1);
      if (STlog > -1) expect(testPlayer.stats.tackles.on).to.eql(1);
      if (FAlog > -1) expect(testPlayer.stats.tackles.fouls).to.eql(1);
    });
    it(`resolve slide tackle - failed ${x}`, async () => {
      const matchDetails = await readFile(
        'test/input/opposite/iterationSwitch.json',
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testPlayer = matchDetails.secondTeam.players[4];
      testPlayer.skill.tackling = 60;
      testPlayer.skill.strength = 32;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      matchDetails.kickOffTeam.players[9].skill.agility = 100;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      matchDetails.kickOffTeam.players[9].skill.strength = 43;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testTeam = matchDetails.secondTeam;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testOpposition = matchDetails.kickOffTeam;
      actions.resolveSlide(testPlayer, testTeam, testOpposition, matchDetails);
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Slide tackle attempted by: ${testPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FTlog = matchDetails.iterationLog.indexOf(
        `Failed tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const STlog = matchDetails.iterationLog.indexOf(
        `Successful tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FAlog = matchDetails.iterationLog.indexOf(
        `Foul against: Peter Johnson`,
      );
      expect(FTlog + STlog + FAlog).to.be.greaterThan(-1);
      if (FTlog > -1) expect(testPlayer.stats.tackles.off).to.eql(1);
      if (STlog > -1) expect(testPlayer.stats.tackles.on).to.eql(1);
      if (FAlog > -1) expect(testPlayer.stats.tackles.fouls).to.eql(1);
    });
    x++;
  }
});
describe('testTackle()', function () {
  let x = 0;
  for (let i = 0; i < 10; i++) {
    it(`resolve tackle ${x}`, async () => {
      const matchDetails = await readFile('init_config/iteration.json');
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testPlayer = matchDetails.secondTeam.players[4];
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testTeam = matchDetails.secondTeam;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testOpposition = matchDetails.kickOffTeam;
      actions.resolveTackle(testPlayer, testTeam, testOpposition, matchDetails);
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Tackle attempted by: ${testPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FTlog = matchDetails.iterationLog.indexOf(
        `Failed tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const STlog = matchDetails.iterationLog.indexOf(
        `Successful tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FAlog = matchDetails.iterationLog.indexOf(
        `Foul against: Peter Johnson`,
      );
      expect(FTlog + STlog + FAlog).to.be.greaterThan(-1);
      if (FTlog > -1) expect(testPlayer.stats.tackles.off).to.eql(1);
      if (STlog > -1) expect(testPlayer.stats.tackles.on).to.eql(1);
      if (FAlog > -1) expect(testPlayer.stats.tackles.fouls).to.eql(1);
    });
    it(`resolve tackle opposite ${x}`, async () => {
      const matchDetails = await readFile(
        'test/input/opposite/iterationSwitch.json',
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testPlayer = matchDetails.secondTeam.players[4];
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testTeam = matchDetails.secondTeam;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testOpposition = matchDetails.kickOffTeam;
      actions.resolveTackle(testPlayer, testTeam, testOpposition, matchDetails);
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Tackle attempted by: ${testPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FTlog = matchDetails.iterationLog.indexOf(
        `Failed tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const STlog = matchDetails.iterationLog.indexOf(
        `Successful tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FAlog = matchDetails.iterationLog.indexOf(
        `Foul against: Peter Johnson`,
      );
      expect(FTlog + STlog + FAlog).to.be.greaterThan(-1);
      if (FTlog > -1) expect(testPlayer.stats.tackles.off).to.eql(1);
      if (STlog > -1) expect(testPlayer.stats.tackles.on).to.eql(1);
      if (FAlog > -1) expect(testPlayer.stats.tackles.fouls).to.eql(1);
    });
    it(`resolve tackle - failed ${x}`, async () => {
      const matchDetails = await readFile(
        'test/input/opposite/iterationSwitch.json',
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testPlayer = matchDetails.secondTeam.players[4];
      testPlayer.skill.tackling = 60;
      testPlayer.skill.strength = 32;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      matchDetails.kickOffTeam.players[9].skill.agility = 100;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      matchDetails.kickOffTeam.players[9].skill.strength = 43;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testTeam = matchDetails.secondTeam;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const testOpposition = matchDetails.kickOffTeam;
      actions.resolveTackle(testPlayer, testTeam, testOpposition, matchDetails);
      expect(
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        matchDetails.iterationLog.indexOf(
          `Tackle attempted by: ${testPlayer.name}`,
        ),
      ).to.be.greaterThan(-1);
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FTlog = matchDetails.iterationLog.indexOf(
        `Failed tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const STlog = matchDetails.iterationLog.indexOf(
        `Successful tackle by: ${testPlayer.name}`,
      );
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const FAlog = matchDetails.iterationLog.indexOf(
        `Foul against: Peter Johnson`,
      );
      expect(FTlog + STlog + FAlog).to.be.greaterThan(-1);
      if (FTlog > -1) expect(testPlayer.stats.tackles.off).to.eql(1);
      if (STlog > -1) expect(testPlayer.stats.tackles.on).to.eql(1);
      if (FAlog > -1) expect(testPlayer.stats.tackles.fouls).to.eql(1);
    });
    x++;
  }
});
describe('checkCards()', function () {
  it('completeSlide - test 1', async () => {
    let matchDetails = await readFile(
      'test/input/tackleTests/completeSlide.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.kickOffTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opp = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thisPlayer = matchDetails.kickOffTeam.players[8];
    matchDetails = playerMovement.completeSlide(
      matchDetails,
      thisPlayer,
      team,
      opp,
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (matchDetails.kickOffTeam.players[8].stats.cards.red === 1) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      expect(matchDetails.kickOffTeam.players[8].currentPOS).to.eql([
        'NP',
        'NP',
      ]);
    }
  });
  it('completeSlide - test 2', async () => {
    let matchDetails = await readFile(
      'test/input/tackleTests/completeSlide.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.kickOffTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opp = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thisPlayer = matchDetails.kickOffTeam.players[6];
    matchDetails = playerMovement.completeSlide(
      matchDetails,
      thisPlayer,
      team,
      opp,
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (matchDetails.kickOffTeam.players[8].stats.cards.red === 1) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      expect(matchDetails.kickOffTeam.players[8].currentPOS).to.eql([
        'NP',
        'NP',
      ]);
    }
  });
  it('completeSlide - test 3', async () => {
    let matchDetails = await readFile(
      'test/input/tackleTests/completeSlide.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.kickOffTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opp = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const thisPlayer = matchDetails.kickOffTeam.players[2];
    matchDetails = playerMovement.completeSlide(
      matchDetails,
      thisPlayer,
      team,
      opp,
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (matchDetails.kickOffTeam.players[8].stats.cards.red === 1) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      expect(matchDetails.kickOffTeam.players[8].currentPOS).to.eql([
        'NP',
        'NP',
      ]);
    }
  });
});
