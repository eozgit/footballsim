import { expect, it, describe } from 'vitest';

import common from '../lib/common.js';

import setfreekicks from './lib/set_freekicks.js';

describe('testFreekicksTopOwnHalf()', function () {
  it('freekick in own half - top boundary', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [340, 1]);
    const { kickOffTeam, secondTeam } = nextJSON;
    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('south');
    expect(nextJSON.ball.position).to.eql([340, 1]);
    expect(kickOffTeam.players[0].currentPOS).to.eql([340, 1]);
    for (const player of kickOffTeam.players) {
      if (player.position !== 'GK')
        expect(player.currentPOS).to.eql(player.originPOS);
    }
    for (const player of secondTeam.players) {
      if (player.position === 'GK')
        expect(player.currentPOS).to.eql(player.originPOS);
      if (player.position !== 'GK')
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] - 100,
        ]);
    }
  });
  it('freekick in own half - top origin positions', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [340, 101]);
    const { kickOffTeam, secondTeam } = nextJSON;
    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('south');
    expect(nextJSON.ball.position).to.eql([340, 101]);
    expect(kickOffTeam.players[0].currentPOS).to.eql([340, 101]);
    for (const player of kickOffTeam.players) {
      if (player.position !== 'GK') {
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] + 300,
        ]);
      }
    }
    for (const player of secondTeam.players) {
      if (player.position === 'GK') {
        expect(player.currentPOS).to.eql(player.originPOS);
      } else {
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] - 100,
        ]);
      }
    }
  });
  it('freekick in own half - halfway boundary', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [340, 524]);
    const [, pitchHeight] = nextJSON.pitchSize;
    const { kickOffTeam, secondTeam } = nextJSON;
    const KOTgoalie = kickOffTeam.players[0];

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('south');
    expect(nextJSON.ball.position).to.eql([340, 524]);
    expect(kickOffTeam.players[3].currentPOS).to.eql([340, 524]);
    expect(secondTeam.players[3].currentPOS).to.eql(
      secondTeam.players[3].originPOS,
    );
    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      parseInt(pitchHeight * 0.25, 10),
    ]);
    for (const num of [1, 2, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      expect(thisPlayer.currentPOS).to.eql([
        thisPlayer.originPOS[0],
        parseInt(pitchHeight * 0.5, 10),
      ]);
      expect(thatPlayer.currentPOS).to.eql(thatPlayer.originPOS);
    }
    for (const num of [5, 6, 7, 8]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      expect(thisPlayer.currentPOS).to.eql([
        thisPlayer.originPOS[0],
        parseInt(pitchHeight * 0.75, 10),
      ]);
      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        parseInt(pitchHeight * 0.75, 10) + 5,
      ]);
    }
    for (const num of [9, 10]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      expect(thisPlayer.currentPOS).to.eql([thisPlayer.originPOS[0], 824]);
      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        parseInt(pitchHeight * 0.5, 10),
      ]);
    }
  });
});
describe('testFreekicksTopHalfwayToThirdQuarter()', function () {
  it('freekick between halfway and last quarter - top center', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [400, 550]);
    const [, pitchHeight] = nextJSON.pitchSize;
    const { kickOffTeam, secondTeam } = nextJSON;
    const KOTgoalie = kickOffTeam.players[0];
    const STgoalie = secondTeam.players[0];

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('south');
    expect(nextJSON.ball.position).to.eql([400, 550]);
    expect(kickOffTeam.players[5].currentPOS).to.eql([400, 550]);
    expect(secondTeam.players[5].currentPOS).to.eql([
      80,
      parseInt(pitchHeight * 0.75, 10),
    ]);
    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      parseInt(pitchHeight * 0.25, 10),
    ]);
    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS).to.eql([thisPlayer.originPOS[0], 450]);
      expect(thatPlayer.currentPOS).to.eql(thatPlayer.originPOS);
    }
    for (const num of [6, 7, 8]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.gt(699);
      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        parseInt(pitchHeight * 0.75, 10),
      ]);
    }
    for (const num of [9, 10]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.gt(849);
      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        parseInt(pitchHeight * 0.5, 10),
      ]);
    }
  });
  it('freekick between halfway and last quarter - top left', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [29, 550]);
    const [, pitchHeight] = nextJSON.pitchSize;
    const { kickOffTeam, secondTeam } = nextJSON;
    const KOTgoalie = kickOffTeam.players[0];
    const STgoalie = secondTeam.players[0];

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('southeast');
    expect(nextJSON.ball.position).to.eql([29, 550]);
    expect(kickOffTeam.players[5].currentPOS).to.eql([29, 550]);
    expect(secondTeam.players[5].currentPOS).to.eql([
      80,
      parseInt(pitchHeight * 0.75, 10),
    ]);
    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      parseInt(pitchHeight * 0.25, 10),
    ]);
    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS).to.eql([thisPlayer.originPOS[0], 450]);
      expect(thatPlayer.currentPOS).to.eql(thatPlayer.originPOS);
    }
    for (const num of [6, 7, 8]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.gt(699);
      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        parseInt(pitchHeight * 0.75, 10),
      ]);
    }
    for (const num of [9, 10]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.gt(849);
      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        parseInt(pitchHeight * 0.5, 10),
      ]);
    }
  });
  it('freekick between halfway and last quarter - top right', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [655, 550]);
    const [, pitchHeight] = nextJSON.pitchSize;
    const { kickOffTeam, secondTeam } = nextJSON;
    const KOTgoalie = kickOffTeam.players[0];
    const STgoalie = secondTeam.players[0];

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('southwest');
    expect(nextJSON.ball.position).to.eql([655, 550]);
    expect(kickOffTeam.players[5].currentPOS).to.eql([655, 550]);
    expect(secondTeam.players[5].currentPOS).to.eql([
      80,
      parseInt(pitchHeight * 0.75, 10),
    ]);
    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      parseInt(pitchHeight * 0.25, 10),
    ]);
    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS).to.eql([thisPlayer.originPOS[0], 450]);
      expect(thatPlayer.currentPOS).to.eql(thatPlayer.originPOS);
    }
    for (const num of [6, 7, 8]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.gt(699);
      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        parseInt(pitchHeight * 0.75, 10),
      ]);
    }
    for (const num of [9, 10]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.gt(849);
      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        parseInt(pitchHeight * 0.5, 10),
      ]);
    }
  });
});
describe('testFreekicksTopLastQuarter()', function () {
  it('freekick last quarter - top center', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [340, 840]);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;
    const { kickOffTeam, secondTeam } = nextJSON;
    const KOTgoalie = kickOffTeam.players[0];
    const STgoalie = secondTeam.players[0];
    let playerSpace = -3;

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('south');
    expect(nextJSON.ball.position).to.eql([
      340,
      parseInt(pitchHeight - pitchHeight / 6 - 35, 10),
    ]);
    expect(kickOffTeam.players[5].currentPOS).to.eql([
      340,
      parseInt(pitchHeight - pitchHeight / 6 - 35, 10),
    ]);
    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      parseInt(pitchHeight * 0.25, 10),
    ]);
    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = parseInt(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
        10,
      );
      const ballDistanceFromGoalY = pitchHeight - nextJSON.ball.position[1];
      const midWayFromBalltoGoalY = parseInt(
        (nextJSON.ball.position[1] - ballDistanceFromGoalY) / 2,
        10,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.5, 10),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.66, 10),
        ]);
      }
      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX + playerSpace,
        midWayFromBalltoGoalY,
      ]);
      playerSpace += 2;
    }
    const boundaryX = [pitchWidth / 4 - 7, pitchWidth - pitchWidth / 4 + 7];
    const boundaryY = [pitchHeight - pitchHeight / 6 - 5, pitchHeight + 1];
    for (const num of [5, 6, 7, 8, 9, 10]) {
      const thisXPOSKOT = kickOffTeam.players[num].currentPOS[0];
      const thisYPOSKOT = kickOffTeam.players[num].currentPOS[1];
      const thisXPOSST = secondTeam.players[num].currentPOS[0];
      const thisYPOSST = secondTeam.players[num].currentPOS[1];

      if (num !== 5) {
        expect(true).to.eql(
          common.isBetween(thisXPOSKOT, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSKOT, boundaryY[0], boundaryY[1]),
        );
      } else {
        expect(true).to.eql(
          common.isBetween(thisXPOSST, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSST, boundaryY[0], boundaryY[1]),
        );
      }
    }
  });
  it('freekick last quarter - top edge of penalty box', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [340, 869]);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;
    const { kickOffTeam, secondTeam } = nextJSON;
    const KOTgoalie = kickOffTeam.players[0];
    const STgoalie = secondTeam.players[0];
    let playerSpace = -3;

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('south');
    expect(nextJSON.ball.position).to.eql([340, 869]);
    expect(kickOffTeam.players[5].currentPOS).to.eql([340, 869]);
    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      parseInt(pitchHeight * 0.25, 10),
    ]);
    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = parseInt(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
        10,
      );
      const ballDistanceFromGoalY = pitchHeight - nextJSON.ball.position[1];
      const midWayFromBalltoGoalY = parseInt(
        (nextJSON.ball.position[1] - ballDistanceFromGoalY) / 2,
        10,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.5, 10),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.66, 10),
        ]);
      }
      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX + playerSpace,
        midWayFromBalltoGoalY,
      ]);
      playerSpace += 2;
    }
    const boundaryX = [pitchWidth / 4 - 7, pitchWidth - pitchWidth / 4 + 7];
    const boundaryY = [pitchHeight - pitchHeight / 6 + 4, pitchHeight + 1];
    for (const num of [5, 6, 7, 8, 9, 10]) {
      const thisXPOSKOT = kickOffTeam.players[num].currentPOS[0];
      const thisYPOSKOT = kickOffTeam.players[num].currentPOS[1];
      const thisXPOSST = secondTeam.players[num].currentPOS[0];
      const thisYPOSST = secondTeam.players[num].currentPOS[1];

      if (num !== 5) {
        expect(true).to.eql(
          common.isBetween(thisXPOSKOT, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSKOT, boundaryY[0], boundaryY[1]),
        );
      } else {
        expect(true).to.eql(
          common.isBetween(thisXPOSST, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSST, boundaryY[0], boundaryY[1]),
        );
      }
    }
  });
  it('freekick last quarter - top team bottom left', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [10, 850]);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;
    const { kickOffTeam, secondTeam } = nextJSON;
    const KOTgoalie = kickOffTeam.players[0];
    const STgoalie = secondTeam.players[0];
    let playerSpace = -3;

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('southeast');
    expect(nextJSON.ball.position).to.eql([10, 850]);
    expect(kickOffTeam.players[5].currentPOS).to.eql([10, 850]);
    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      parseInt(pitchHeight * 0.25, 10),
    ]);
    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = parseInt(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
        10,
      );
      const ballDistanceFromGoalY = pitchHeight - nextJSON.ball.position[1];
      const midWayFromBalltoGoalY = parseInt(
        (nextJSON.ball.position[1] - ballDistanceFromGoalY) / 2,
        10,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.5, 10),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.66, 10),
        ]);
      }
      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX + playerSpace,
        midWayFromBalltoGoalY,
      ]);
      playerSpace += 2;
    }
    const boundaryX = [pitchWidth / 4 - 7, pitchWidth - pitchWidth / 4 + 7];
    const boundaryY = [pitchHeight - pitchHeight / 6 + 4, pitchHeight + 1];
    for (const num of [5, 6, 7, 8, 9, 10]) {
      const thisXPOSKOT = kickOffTeam.players[num].currentPOS[0];
      const thisYPOSKOT = kickOffTeam.players[num].currentPOS[1];
      const thisXPOSST = secondTeam.players[num].currentPOS[0];
      const thisYPOSST = secondTeam.players[num].currentPOS[1];

      if (num !== 5) {
        expect(true).to.eql(
          common.isBetween(thisXPOSKOT, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSKOT, boundaryY[0], boundaryY[1]),
        );
      } else {
        expect(true).to.eql(
          common.isBetween(thisXPOSST, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSST, boundaryY[0], boundaryY[1]),
        );
      }
    }
  });
  it('freekick and last quarter - top team bottom right', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [600, 826]);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;
    const { kickOffTeam, secondTeam } = nextJSON;
    const KOTgoalie = kickOffTeam.players[0];
    const STgoalie = secondTeam.players[0];
    let playerSpace = -3;

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('southwest');
    expect(nextJSON.ball.position).to.eql([600, 826]);
    expect(kickOffTeam.players[5].currentPOS).to.eql([600, 826]);
    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      parseInt(pitchHeight * 0.25, 10),
    ]);
    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = parseInt(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
        10,
      );
      const ballDistanceFromGoalY = pitchHeight - nextJSON.ball.position[1];
      const midWayFromBalltoGoalY = parseInt(
        (nextJSON.ball.position[1] - ballDistanceFromGoalY) / 2,
        10,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.5, 10),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.66, 10),
        ]);
      }
      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX + playerSpace,
        midWayFromBalltoGoalY,
      ]);
      playerSpace += 2;
    }
    const boundaryX = [pitchWidth / 4 - 7, pitchWidth - pitchWidth / 4 + 7];
    const boundaryY = [pitchHeight - pitchHeight / 6 + 4, pitchHeight + 1];
    for (const num of [5, 6, 7, 8, 9, 10]) {
      const thisXPOSKOT = kickOffTeam.players[num].currentPOS[0];
      const thisYPOSKOT = kickOffTeam.players[num].currentPOS[1];
      const thisXPOSST = secondTeam.players[num].currentPOS[0];
      const thisYPOSST = secondTeam.players[num].currentPOS[1];

      if (num !== 5) {
        expect(true).to.eql(
          common.isBetween(thisXPOSKOT, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSKOT, boundaryY[0], boundaryY[1]),
        );
      } else {
        expect(true).to.eql(
          common.isBetween(thisXPOSST, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSST, boundaryY[0], boundaryY[1]),
        );
      }
    }
  });
  it('freekick last quarter - top team bottom left goal line', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [10, 1049]);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;
    const { kickOffTeam, secondTeam } = nextJSON;
    const KOTgoalie = kickOffTeam.players[0];
    const STgoalie = secondTeam.players[0];
    let firstWallPosition = pitchHeight;

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('east');
    expect(nextJSON.ball.position).to.eql([10, pitchHeight - 1]);
    expect(kickOffTeam.players[5].currentPOS).to.eql([10, pitchHeight - 1]);
    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      parseInt(pitchHeight * 0.25, 10),
    ]);
    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = parseInt(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
        10,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.5, 10),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.66, 10),
        ]);
      }
      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX,
        firstWallPosition,
      ]);
      firstWallPosition -= 2;
    }
    for (const num of [5, 6, 7, 8, 9, 10]) {
      const kotCurrentPOS = kickOffTeam.players[num].currentPOS;
      const stCurrentPOS = secondTeam.players[num].currentPOS;

      if (num !== 5) {
        expect(true).to.eql(common.inBottomPenalty(nextJSON, kotCurrentPOS));
      } else {
        expect(true).to.eql(common.inBottomPenalty(nextJSON, stCurrentPOS));
      }
    }
  });
  it('freekick last quarter - top team bottom right goal line', async () => {
    const itlocation = './init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [600, 1049]);
    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;
    const { kickOffTeam, secondTeam } = nextJSON;
    const KOTgoalie = kickOffTeam.players[0];
    const STgoalie = secondTeam.players[0];
    let firstWallPosition = pitchHeight;

    expect(nextJSON).to.be.an('object');
    expect(nextJSON.ball.direction).to.eql('west');
    expect(nextJSON.ball.position).to.eql([600, 1049]);
    expect(kickOffTeam.players[5].currentPOS).to.eql([600, 1049]);
    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      parseInt(pitchHeight * 0.25, 10),
    ]);
    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = parseInt(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
        10,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.5, 10),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          parseInt(pitchHeight * 0.66, 10),
        ]);
      }
      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX,
        firstWallPosition,
      ]);
      firstWallPosition -= 2;
    }
    for (const num of [5, 6, 7, 8, 9, 10]) {
      const thisXPOSKOT = kickOffTeam.players[num].currentPOS[0];
      const thisYPOSKOT = kickOffTeam.players[num].currentPOS[1];
      const thisXPOSST = secondTeam.players[num].currentPOS[0];
      const thisYPOSST = secondTeam.players[num].currentPOS[1];
      const boundaryX = [pitchWidth / 4 - 7, pitchWidth - pitchWidth / 4 + 7];
      const boundaryY = [pitchHeight - pitchHeight / 6 + 4, pitchHeight + 1];

      if (num !== 5) {
        expect(true).to.eql(
          common.isBetween(thisXPOSKOT, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSKOT, boundaryY[0], boundaryY[1]),
        );
      } else {
        expect(true).to.eql(
          common.isBetween(thisXPOSST, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSST, boundaryY[0], boundaryY[1]),
        );
      }
      if ([6, 7].includes(num)) {
        expect(true).to.eql(
          common.isBetween(thisXPOSST, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSST, boundaryY[0], boundaryY[1]),
        );
      }
      if ([8, 9, 10].includes(num)) {
        expect(true).to.eql(
          common.isBetween(thisXPOSST, boundaryX[0], boundaryX[1]),
        );
        expect(true).to.eql(
          common.isBetween(thisYPOSST, boundaryY[0], boundaryY[1]),
        );
      }
    }
  });
});
