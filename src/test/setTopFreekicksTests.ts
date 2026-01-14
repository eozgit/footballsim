import { expect, it, describe } from 'vitest';

import * as common from '../lib/common.js';

import setfreekicks from './lib/set_freekicks.js';

describe('testFreekicksTopOwnHalf()', function () {
  it('freekick in own half - top boundary', async () => {
    const itlocation = './src/init_config/iteration.json';
    const nextJSON = await setfreekicks.setTopFreekick(itlocation, [340, 1]);
    const { kickOffTeam, secondTeam } = nextJSON;
    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('south');

    expect(nextJSON.ball.position).to.eql([340, 1]);

    expect(kickOffTeam.players[0].currentPOS).to.eql([340, 1]);
    for (const player of kickOffTeam.players) {
      if (player.position !== 'GK') {
        expect(player.currentPOS).to.eql(player.originPOS);
      }
    }
    for (const player of secondTeam.players) {
      if (player.position === 'GK') {
        expect(player.currentPOS).to.eql(player.originPOS);
      }
      if (player.position !== 'GK') {
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] - 100,
        ]);
      }
    }
  });

  it('freekick in own half - top origin positions', async () => {
    const itlocation = './src/init_config/iteration.json';
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
    const itlocation = './src/init_config/iteration.json';
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
      Math.floor(pitchHeight * 0.25),
    ]);
    for (const num of [1, 2, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      expect(thisPlayer.currentPOS).to.eql([
        thisPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.5),
      ]);

      expect(thatPlayer.currentPOS).to.eql(thatPlayer.originPOS);
    }
    for (const num of [5, 6, 7, 8]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      expect(thisPlayer.currentPOS).to.eql([
        thisPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.75),
      ]);

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.75) + 5,
      ]);
    }
    for (const num of [9, 10]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      expect(thisPlayer.currentPOS).to.eql([thisPlayer.originPOS[0], 824]);

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.5),
      ]);
    }
  });
});

describe('testFreekicksTopHalfwayToThirdQuarter()', function () {
  it('freekick between halfway and last quarter - top center', async () => {
    const itlocation = './src/init_config/iteration.json';
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
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.25),
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
        Math.floor(pitchHeight * 0.75),
      ]);
    }
    for (const num of [9, 10]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.gt(849);

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.5),
      ]);
    }
  });

  it('freekick between halfway and last quarter - top left', async () => {
    const itlocation = './src/init_config/iteration.json';
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
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.25),
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
        Math.floor(pitchHeight * 0.75),
      ]);
    }
    for (const num of [9, 10]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.gt(849);

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.5),
      ]);
    }
  });

  it('freekick between halfway and last quarter - top right', async () => {
    const itlocation = './src/init_config/iteration.json';
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
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.25),
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
        Math.floor(pitchHeight * 0.75),
      ]);
    }
    for (const num of [9, 10]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.gt(849);

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.5),
      ]);
    }
  });
});

describe('testFreekicksTopLastQuarter()', function () {
  it('freekick last quarter - top center', async () => {
    const itlocation = './src/init_config/iteration.json';
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
      Math.floor(pitchHeight - pitchHeight / 6 - 35),
    ]);

    expect(kickOffTeam.players[5].currentPOS).to.eql([
      340,
      Math.floor(pitchHeight - pitchHeight / 6 - 35),
    ]);

    expect(KOTgoalie.currentPOS).to.eql([
      KOTgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.25),
    ]);

    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = Math.floor(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
      );
      const ballDistanceFromGoalY = pitchHeight - nextJSON.ball.position[1];
      const midWayFromBalltoGoalY = Math.floor(
        (nextJSON.ball.position[1] - ballDistanceFromGoalY) / 2,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.66),
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
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;
      const [xST, yST] = secondTeam.players[num].currentPOS;

      // Guard against 'NP' for both teams
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Player ${num} has no position ('NP')`);
      }

      if (num !== 5) {
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });

  it('freekick last quarter - top edge of penalty box', async () => {
    const itlocation = './src/init_config/iteration.json';
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
      Math.floor(pitchHeight * 0.25),
    ]);

    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = Math.floor(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
      );
      const ballDistanceFromGoalY = pitchHeight - nextJSON.ball.position[1];
      const midWayFromBalltoGoalY = Math.floor(
        (nextJSON.ball.position[1] - ballDistanceFromGoalY) / 2,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.66),
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
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;
      const [xST, yST] = secondTeam.players[num].currentPOS;

      // Type Guard: Ensure coordinates are valid numbers before passing to isBetween
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Position data missing for player index ${num}`);
      }

      if (num !== 5) {
        // KOT Boundary Checks
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        // ST Boundary Checks
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });

  it('freekick last quarter - top team bottom left', async () => {
    const itlocation = './src/init_config/iteration.json';
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
      Math.floor(pitchHeight * 0.25),
    ]);

    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = Math.floor(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
      );
      const ballDistanceFromGoalY = pitchHeight - nextJSON.ball.position[1];
      const midWayFromBalltoGoalY = Math.floor(
        (nextJSON.ball.position[1] - ballDistanceFromGoalY) / 2,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.66),
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
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;
      const [xST, yST] = secondTeam.players[num].currentPOS;

      // Safe Guard: Fail fast if any position is 'NP' (No Position)
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Invalid position 'NP' for player at index ${num}`);
      }

      // At this point, TS knows xKOT, yKOT, xST, and yST are numbers
      if (num !== 5) {
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });

  it('freekick and last quarter - top team bottom right', async () => {
    const itlocation = './src/init_config/iteration.json';
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
      Math.floor(pitchHeight * 0.25),
    ]);

    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = Math.floor(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
      );
      const ballDistanceFromGoalY = pitchHeight - nextJSON.ball.position[1];
      const midWayFromBalltoGoalY = Math.floor(
        (nextJSON.ball.position[1] - ballDistanceFromGoalY) / 2,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.66),
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
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;
      const [xST, yST] = secondTeam.players[num].currentPOS;

      // Type Guard: If position is 'NP', the test should fail with a clear message
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Player index ${num} has invalid position 'NP'`);
      }

      if (num !== 5) {
        // Assert KOT player is within boundaries
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        // Assert ST player is within boundaries
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });

  it('freekick last quarter - top team bottom left goal line', async () => {
    const itlocation = './src/init_config/iteration.json';
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
      Math.floor(pitchHeight * 0.25),
    ]);

    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = Math.floor(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.66),
        ]);
      }
      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX,
        firstWallPosition,
      ]);

      firstWallPosition -= 2;
    }
    for (const num of [5, 6, 7, 8, 9, 10]) {
      // 1. Destructure both elements immediately
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;
      const [xST, yST] = secondTeam.players[num].currentPOS;

      // 2. Validate (Narrowing strings/undefined to numbers)
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Player ${num} has invalid position data`);
      }

      // 3. Create new arrays from the validated destructured elements
      // TypeScript now implicitly knows these are [number, number]
      const kotCoords: [number, number] = [xKOT, yKOT];
      const stCoords: [number, number] = [xST, yST];

      if (num !== 5) {
        // Pass the new, guaranteed numeric array
        expect(common.inBottomPenalty(nextJSON, kotCoords)).toBe(true);
      } else {
        expect(common.inBottomPenalty(nextJSON, stCoords)).toBe(true);
      }
    }
  });

  it('freekick last quarter - top team bottom right goal line', async () => {
    const itlocation = './src/init_config/iteration.json';
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
      Math.floor(pitchHeight * 0.25),
    ]);

    expect(STgoalie.currentPOS).to.eql(STgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = kickOffTeam.players[num];
      const thatPlayer = secondTeam.players[num];
      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;
      const midWayFromBalltoGoalX = Math.floor(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
      );
      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.66),
        ]);
      }
      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX,
        firstWallPosition,
      ]);

      firstWallPosition -= 2;
    }
    for (const num of [5, 6, 7, 8, 9, 10]) {
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;
      const [xST, yST] = secondTeam.players[num].currentPOS;

      // Type Guard: Ensure coordinates are valid numbers
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Player ${num} missing position ('NP')`);
      }

      const boundaryX = [pitchWidth / 4 - 7, pitchWidth - pitchWidth / 4 + 7];
      const boundaryY = [pitchHeight - pitchHeight / 6 + 4, pitchHeight + 1];

      // Primary Check
      if (num !== 5) {
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      }

      // Extra ST Checks for 6, 7, 8, 9, 10
      if (num !== 5) {
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });
});
