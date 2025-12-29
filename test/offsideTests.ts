import { expect, it, describe } from 'vitest';

import { readFile } from '../lib/fileReader.js';
import pMovement from '../lib/playerMovement.js';

describe('checkOffside()', function () {
  it('1 Bottom Player offside', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/offsidePosition1.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.kickOffTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[9].offside).to.eql(true);
  });
  it('1 Player top offside', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/offsideTopPosition1.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.kickOffTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(2);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[9].offside).to.eql(true);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[10].offside).to.eql(true);
  });
  it('1 Player top offside w/ ball', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/offsideTopPosition1withBall.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.kickOffTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.secondTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(0);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[9].offside).to.eql(false);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[10].offside).to.eql(false);
  });
  it('1 Player top offside w/ ball switched', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/offsideTopPosition1withBall.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.kickOffTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(0);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[9].offside).to.eql(false);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[10].offside).to.eql(false);
  });
  it('1 Player btm offside w/ ball', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/offsideBtmPosition1withBall.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.kickOffTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.secondTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(0);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[9].offside).to.eql(false);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[10].offside).to.eql(false);
  });
  it('1 Player btm offside w/ ball switched', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/offsideBtmPosition1withBall.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.kickOffTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(0);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[9].offside).to.eql(false);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[10].offside).to.eql(false);
  });
  it('2 Player offside', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/offsidePosition2.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.kickOffTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.secondTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(2);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[9].offside).to.eql(true);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[10].offside).to.eql(true);
  });
  it('1 offside player, same team with ball', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/onsidePosition1.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.kickOffTeam;
    team.players[9].currentPOS[1] = 121;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    matchDetails.ball.position[1] = 121;
    team.players[10].currentPOS = [400, 57];
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(1);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[9].offside).to.eql(false);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[10].offside).to.eql(true);
  });
  it('Team 1 at top, 1 player offside', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/offsidePosition3.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.kickOffTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.secondTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(2);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[9].offside).to.eql(false);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[10].offside).to.eql(true);
  });
  it('Team 1 at bottom, 1 player offside', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/offsidePosition3.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.kickOffTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(2);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[9].offside).to.eql(false);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.kickOffTeam.players[10].offside).to.eql(true);
  });
  it('Goalkeeper has ball, no offside positions', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/onsideBottomPosition2GK.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.kickOffTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(0);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[9].offside).to.eql(false);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[10].offside).to.eql(false);
  });
  it('Ball not with team', async () => {
    const matchDetails = await readFile(
      'test/input/offsideTests/ballNotWithTeam.json',
    );
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const team = matchDetails.secondTeam;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const opposition = matchDetails.kickOffTeam;
    pMovement.checkOffside(team, opposition, matchDetails);
    expect(
      JSON.stringify(matchDetails).split(`"offside":true`).length - 1,
    ).to.eql(0);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[9].offside).to.eql(false);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    expect(matchDetails.secondTeam.players[10].offside).to.eql(false);
  });
});
