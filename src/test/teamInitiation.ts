import { expect, it, describe } from 'vitest';

import initteams from './lib/initiate_team.js';

describe('testTeamSetup()', function () {
  it('check all players origin positions are the same as the start positions', async () => {
    const t1location = './src/init_config/team1.json';

    const teamOutput = await initteams.setTeam(t1location);

    expect(teamOutput).to.be.an('object');

    expect(teamOutput.players[0].originPOS).to.eql(
      teamOutput.players[0].currentPOS,
    );

    expect(teamOutput.players[1].originPOS).to.eql(
      teamOutput.players[1].currentPOS,
    );

    expect(teamOutput.players[2].originPOS).to.eql(
      teamOutput.players[2].currentPOS,
    );

    expect(teamOutput.players[3].originPOS).to.eql(
      teamOutput.players[3].currentPOS,
    );

    expect(teamOutput.players[4].originPOS).to.eql(
      teamOutput.players[4].currentPOS,
    );

    expect(teamOutput.players[5].originPOS).to.eql(
      teamOutput.players[5].currentPOS,
    );

    expect(teamOutput.players[6].originPOS).to.eql(
      teamOutput.players[6].currentPOS,
    );

    expect(teamOutput.players[7].originPOS).to.eql(
      teamOutput.players[7].currentPOS,
    );

    expect(teamOutput.players[8].originPOS).to.eql(
      teamOutput.players[8].currentPOS,
    );

    expect(teamOutput.players[9].originPOS).to.eql(
      teamOutput.players[9].currentPOS,
    );

    expect(teamOutput.players[10].originPOS).to.eql(
      teamOutput.players[10].currentPOS,
    );
  });

  it('check all players relative positions are the same as the start positions', async () => {
    const t1location = './src/init_config/team1.json';

    const teamOutput = await initteams.setTeam(t1location);

    expect(teamOutput).to.be.an('object');

    expect(teamOutput.players[0].intentPOS).to.eql(
      teamOutput.players[0].currentPOS,
    );

    expect(teamOutput.players[1].intentPOS).to.eql(
      teamOutput.players[1].currentPOS,
    );

    expect(teamOutput.players[2].intentPOS).to.eql(
      teamOutput.players[2].currentPOS,
    );

    expect(teamOutput.players[3].intentPOS).to.eql(
      teamOutput.players[3].currentPOS,
    );

    expect(teamOutput.players[4].intentPOS).to.eql(
      teamOutput.players[4].currentPOS,
    );

    expect(teamOutput.players[5].intentPOS).to.eql(
      teamOutput.players[5].currentPOS,
    );

    expect(teamOutput.players[6].intentPOS).to.eql(
      teamOutput.players[6].currentPOS,
    );

    expect(teamOutput.players[7].intentPOS).to.eql(
      teamOutput.players[7].currentPOS,
    );

    expect(teamOutput.players[8].intentPOS).to.eql(
      teamOutput.players[8].currentPOS,
    );

    expect(teamOutput.players[9].intentPOS).to.eql(
      teamOutput.players[9].currentPOS,
    );

    expect(teamOutput.players[10].intentPOS).to.eql(
      teamOutput.players[10].currentPOS,
    );
  });
});
