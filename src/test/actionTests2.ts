import { expect, it, describe } from 'vitest';

import * as actions from '../lib/actions.js';

import { readMatchDetails } from './lib/utils.js';

describe('bottomTeamPlayerHasBallInMiddle()', function () {
  it('In middle of pitch, no opp. near, shooting over 85', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInMiddle.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const playerInformation = { proxPOS: [218, -464] };
    const parameters = actions.bottomTeamPlayerHasBallInMiddle(
      playerInformation,
      player.position,
      player.skill,
    );
    expect(parameters).to.eql([10, 10, 30, 0, 0, 0, 0, 50, 0, 0, 0]);
  });
  it('In middle of pitch, no opp. near, shooting below 85, striker', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInMiddle.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.skill.shooting = 30;
    const playerInformation = { proxPOS: [218, -464] };
    const parameters = actions.bottomTeamPlayerHasBallInMiddle(
      playerInformation,
      player.position,
      player.skill,
    );
    expect(parameters).to.eql([0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0]);
  });
  it('In middle of pitch, no opp. near, shooting below 85, midfielder', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInMiddle.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.skill.shooting = 30;
    player.position = 'CM';
    const playerInformation = { proxPOS: [218, -464] };
    const parameters = actions.bottomTeamPlayerHasBallInMiddle(
      playerInformation,
      player.position,
      player.skill,
    );
    expect(parameters).to.eql([0, 10, 10, 10, 0, 0, 0, 30, 40, 0, 0]);
  });
  it('In middle of pitch, no opp. near, shooting below 85, defender', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInMiddle.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.skill.shooting = 30;
    player.position = 'CB';
    const playerInformation = { proxPOS: [218, -464] };
    const parameters = actions.bottomTeamPlayerHasBallInMiddle(
      playerInformation,
      player.position,
      player.skill,
    );
    expect(parameters).to.eql([0, 0, 10, 0, 0, 0, 0, 60, 20, 0, 10]);
  });
  it('In middle of pitch, opp. near, shooting over 85', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInMiddle.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const playerInformation = { proxPOS: [5, -5] };
    const parameters = actions.bottomTeamPlayerHasBallInMiddle(
      playerInformation,
      player.position,
      player.skill,
    );
    expect(parameters).to.eql([0, 20, 30, 20, 0, 0, 0, 20, 0, 0, 10]);
  });
});
describe('bottomTeamPlayerHasBall()', function () {
  it('bottomTeamPlayerHasBallInMiddle', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInMiddle.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([10, 10, 30, 0, 0, 0, 0, 50, 0, 0, 0]);
  });
  it('bottomTeamPlayerHasBallInTopPenaltyBox', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0]);
  });
  it('onTopCornerBoundary', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.currentPOS = [0, 0];
    matchDetails.ball.position = [0, 0];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('bottomTeamPlayerHasBall, GK, opposition near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.position = 'GK';
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[7].currentPOS = [385, 70];
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40]);
  });
  it('bottomTeamPlayerHasBall, GK, opposition not near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.position = 'GK';
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20]);
  });
  it('Top Thrd, opposition not near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0]);
  });
  it('Top Third, opposition near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[7].currentPOS = [385, 205];
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0]);
  });
  it('Bottom Third, opposition near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInBottomThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[4].currentPOS = [385, 982];
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20]);
  });
  it('Bottom Third, no opposition near, midfielder', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInBottomThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.position = 'LM';
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0]);
  });
  it('Bottom Third, no opposition near, defender', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInBottomThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.position = 'LB';
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 30, 0, 0, 0, 0, 50, 0, 10, 10]);
  });
  it('Bottom Third, no opposition near, striker', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInBottomThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.position = 'ST';
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.bottomTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0]);
  });
});
describe('topTeamPlayerHasBallInBottomPenaltyBox()', function () {
  it('Close, no opposition near, no team mate close, further than shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0]);
  });
  it('Close, no opposition near, no team mate close, half/shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 1;
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0]);
  });
  it('Close, no opposition near, no team mate close, 0/half shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 500;
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('Not Close, opposition near, within shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.currentPOS[1] = 875;
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    opposition.players[3].currentPOS = [377, 880];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([10, 0, 70, 0, 0, 0, 0, 20, 0, 0, 0]);
  });
  it('Not Close, opposition near, further than shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.currentPOS[1] = 875;
    player.skill.shooting = 1000;
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]);
  });
  it('Not Close, opposition near, further than shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    player.currentPOS[1] = 910;
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([70, 0, 20, 0, 0, 0, 0, 10, 0, 0, 0]);
  });
  it('Close, opp. near not ahead, no tmate close, half/shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 250;
    opposition.players[3].currentPOS = [275, 991];
    matchDetails.ball.position = [280, 995];
    matchDetails.secondTeam.players[10].currentPOS = [385, 998];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('Close, opp. near not ahead, no tmate close, 0/half skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    opposition.players[3].currentPOS = [275, 991];
    matchDetails.ball.position = [280, 995];
    matchDetails.secondTeam.players[10].currentPOS = [385, 998];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]);
  });
  it('Close, opp. near not ahead, no tmate close, further than shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 5;
    opposition.players[3].currentPOS = [275, 991];
    matchDetails.ball.position = [280, 995];
    matchDetails.secondTeam.players[10].currentPOS = [385, 998];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0]);
  });
  it('Close, no opposition ahead, tmate close, 0/shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 250;
    opposition.players[3].currentPOS = [375, 991];
    matchDetails.secondTeam.players[10].currentPOS = [382, 997];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('Close, no opposition ahead, tmate close, half/shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    opposition.players[3].currentPOS = [375, 991];
    matchDetails.secondTeam.players[10].currentPOS = [382, 997];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]);
  });
  it('Close, no opposition ahead, tmate close, further than shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 2;
    opposition.players[3].currentPOS = [375, 991];
    matchDetails.secondTeam.players[10].currentPOS = [382, 997];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0]);
  });
  it('Close, no opposition ahead, no tmate close, further than shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 2;
    opposition.players[3].currentPOS = [375, 991];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0]);
  });
  it('Close, no opposition ahead, no tmate close, half/shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    opposition.players[3].currentPOS = [375, 991];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0]);
  });
  it('Close, no opposition ahead, no tmate close, 0/half shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 250;
    opposition.players[3].currentPOS = [375, 991];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('Close, opposition ahead, no tmate close, 0/half shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 250;
    opposition.players[3].currentPOS = [380, 999];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('Close, opposition ahead, no tmate close, half/shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    opposition.players[3].currentPOS = [380, 999];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0]);
  });
  it('Close, opposition ahead, no tmate close, further than shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 2;
    opposition.players[3].currentPOS = [380, 999];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0]);
  });
  it('Close, opposition ahead, tmate close, further than shooting skills', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    opposition.players[3].currentPOS = [380, 999];
    matchDetails.secondTeam.players[10].currentPOS = [382, 997];
    const parameters = actions.topTeamPlayerHasBallInBottomPenaltyBox(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0]);
  });
});
describe('topTeamPlayerHasBall()', function () {
  it('GK - opposition not near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.position = 'GK';
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20]);
  });
  it('GK - opposition near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.position = 'GK';
    opposition.players[3].currentPOS = [380, 999];
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40]);
  });
  it('Not GK - bottom corner boundary', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.currentPOS = [0, 1050];
    matchDetails.ball.position = [0, 1050];
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0]);
  });
  it('Not GK - In Bottom Penalty Box', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0]);
  });
  it('Not GK - In Bottom Third - no opp near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0]);
  });
  it('Not GK - In Bottom Third - opp near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInBottomThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[6].currentPOS = [378, 815];
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0]);
  });
  it('Middle Third - opp near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInMiddleThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[6].currentPOS = [378, 532];
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 20, 30, 20, 0, 0, 20, 0, 0, 0, 10]);
  });
  it('Middle Third - no opp near - shooting > 85', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInMiddleThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([10, 10, 30, 0, 0, 0, 50, 0, 0, 0, 0]);
  });
  it('Middle Third - no opp near - shooting < 85, LM', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInMiddleThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 50;
    player.position = 'LM';
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 10, 10, 10, 0, 0, 0, 30, 40, 0, 0]);
  });
  it('Middle Third - no opp near - shooting < 85, Striker', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInMiddleThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 50;
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0]);
  });
  it('Middle Third - no opp near - shooting < 85, Defender', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInMiddleThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.skill.shooting = 50;
    player.position = 'LB';
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 10, 0, 0, 0, 0, 60, 20, 0, 10]);
  });
  it('Own Third - opp near', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInOwnThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    matchDetails.kickOffTeam.players[6].currentPOS = [378, 182];
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20]);
  });
  it('Own Third - no opp near - midfielder', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInOwnThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.position = 'LM';
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0]);
  });
  it('Own Third - no opp near - striker', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInOwnThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.position = 'ST';
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0]);
  });
  it('Own Third - no opp near - defender', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInOwnThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    player.position = 'RB';
    const parameters = actions.topTeamPlayerHasBall(
      matchDetails,
      player,
      team,
      opposition,
    );
    expect(parameters).to.eql([0, 0, 40, 0, 0, 0, 0, 30, 0, 20, 10]);
  });
});
describe('findPossActions()', function () {
  it('From Bottom', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/bottomTeamHasBallInTopPenaltyBox.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const output = actions.findPossActions(
      player,
      team,
      opposition,
      10,
      10,
      matchDetails,
    );
    expect(output).to.eql([
      { name: 'shoot', points: 60 },
      { name: 'throughBall', points: 0 },
      { name: 'pass', points: 0 },
      { name: 'cross', points: 0 },
      { name: 'tackle', points: 0 },
      { name: 'intercept', points: 0 },
      { name: 'slide', points: 0 },
      { name: 'run', points: 40 },
      { name: 'sprint', points: 0 },
      { name: 'cleared', points: 0 },
      { name: 'boot', points: 0 },
    ]);
  });
  it('From Bottom', async () => {
    const matchDetails = await readMatchDetails(
      './src/test/input/actionInputs/topTeamHasBallInOwnThird.json',
    );
    const player = matchDetails.secondTeam.players[9];
    const team = matchDetails.secondTeam;
    const opposition = matchDetails.kickOffTeam;
    const output = actions.findPossActions(
      player,
      team,
      opposition,
      10,
      10,
      matchDetails,
    );
    expect(output).to.eql([
      { name: 'shoot', points: 0 },
      { name: 'throughBall', points: 0 },
      { name: 'pass', points: 0 },
      { name: 'cross', points: 0 },
      { name: 'tackle', points: 0 },
      { name: 'intercept', points: 0 },
      { name: 'slide', points: 0 },
      { name: 'run', points: 50 },
      { name: 'sprint', points: 50 },
      { name: 'cleared', points: 0 },
      { name: 'boot', points: 0 },
    ]);
  });
});
