import { expect, it, describe } from 'vitest';

import * as common from '../lib/common.js';

import setfreekicks from './lib/set_freekicks.js';

describe('testFreekicksBottomOwnHalf()', function () {
  it('freekick in own half - Bottom boundary', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(
      itlocation,
      [340, 1040],
    );

    const { kickOffTeam, secondTeam } = nextJSON;

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('north');

    expect(nextJSON.ball.position).to.eql([340, 1040]);

    expect(secondTeam.players[0].currentPOS).to.eql([340, 1040]);
    for (const player of secondTeam.players) {
      if (player.position !== 'GK') {
        expect(player.currentPOS).to.eql(player.originPOS);
      }
    }

    for (const player of kickOffTeam.players) {
      if (player.position === 'GK') {
        expect(player.currentPOS).to.eql(player.originPOS);
      }

      if (player.position !== 'GK') {
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] + 100,
        ]);
      }
    }
  });

  it('freekick in own half - Bottom origin positions', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(
      itlocation,
      [340, 900],
    );

    const { kickOffTeam, secondTeam } = nextJSON;

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('north');

    expect(nextJSON.ball.position).to.eql([340, 900]);

    expect(secondTeam.players[0].currentPOS).to.eql([340, 900]);
    for (const player of secondTeam.players) {
      if (player.position !== 'GK') {
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] - 300,
        ]);
      }
    }

    for (const player of kickOffTeam.players) {
      if (player.position === 'GK') {
        expect(player.currentPOS).to.eql(player.originPOS);
      } else {
        expect(player.currentPOS).to.eql([
          player.originPOS[0],
          player.originPOS[1] + 100,
        ]);
      }
    }
  });

  it('freekick in own half - halfway boundary', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(
      itlocation,
      [340, 526],
    );

    const [, pitchHeight] = nextJSON.pitchSize;

    const { kickOffTeam, secondTeam } = nextJSON;

    const STgoalie = secondTeam.players[0];

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('north');

    expect(nextJSON.ball.position).to.eql([340, 526]);

    expect(secondTeam.players[3].currentPOS).to.eql([340, 526]);

    expect(kickOffTeam.players[3].currentPOS).to.eql(
      kickOffTeam.players[3].originPOS,
    );

    expect(STgoalie.currentPOS).to.eql([
      STgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.75),
    ]);
    for (const num of [1, 2, 4]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS).to.eql([
        thisPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.5),
      ]);

      expect(thatPlayer.currentPOS).to.eql(thatPlayer.originPOS);
    }

    for (const num of [5, 6, 7, 8]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS).to.eql([
        thisPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.25),
      ]);

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.25) - 5,
      ]);
    }

    for (const num of [9, 10]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS).to.eql([thisPlayer.originPOS[0], 226]);

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.5),
      ]);
    }
  });
});

describe('testFreekicksBottomThirdQuarter()', function () {
  it('freekick between halfway and last sixth - Bottom center', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(
      itlocation,
      [400, 500],
    );

    const [, pitchHeight] = nextJSON.pitchSize;

    const { kickOffTeam, secondTeam } = nextJSON;

    const KOTgoalie = kickOffTeam.players[0];

    const STgoalie = secondTeam.players[0];

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('north');

    expect(nextJSON.ball.position).to.eql([400, 500]);

    expect(secondTeam.players[5].currentPOS).to.eql([400, 500]);

    expect(kickOffTeam.players[5].currentPOS).to.eql([
      80,
      Math.floor(pitchHeight * 0.25),
    ]);

    expect(STgoalie.currentPOS).to.eql([
      STgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql(KOTgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS).to.eql([thisPlayer.originPOS[0], 600]);

      expect(thatPlayer.currentPOS).to.eql(thatPlayer.originPOS);
    }

    for (const num of [6, 7, 8]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.lt(351);

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.25),
      ]);
    }

    for (const num of [9, 10]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.lt(
        Math.floor(pitchHeight * 0.25 + 50),
      );

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.5),
      ]);
    }
  });

  it('freekick between halfway and last sixth - Bottom left', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(
      itlocation,
      [29, 500],
    );

    const [, pitchHeight] = nextJSON.pitchSize;

    const { kickOffTeam, secondTeam } = nextJSON;

    const KOTgoalie = kickOffTeam.players[0];

    const STgoalie = secondTeam.players[0];

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('northeast');

    expect(nextJSON.ball.position).to.eql([29, 500]);

    expect(secondTeam.players[5].currentPOS).to.eql([29, 500]);

    expect(kickOffTeam.players[5].currentPOS).to.eql([
      80,
      Math.floor(pitchHeight * 0.25),
    ]);

    expect(STgoalie.currentPOS).to.eql([
      STgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql(KOTgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS).to.eql([thisPlayer.originPOS[0], 600]);

      expect(thatPlayer.currentPOS).to.eql(thatPlayer.originPOS);
    }

    for (const num of [6, 7, 8]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.lt(351);

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.25),
      ]);
    }

    for (const num of [9, 10]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.lt(
        Math.floor(pitchHeight * 0.25 - 60),
      );

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.5),
      ]);
    }
  });

  it('freekick between halfway and last sixth - Bottom right', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(
      itlocation,
      [655, 500],
    );

    const [, pitchHeight] = nextJSON.pitchSize;

    const { kickOffTeam, secondTeam } = nextJSON;

    const KOTgoalie = kickOffTeam.players[0];

    const STgoalie = secondTeam.players[0];

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('northwest');

    expect(nextJSON.ball.position).to.eql([655, 500]);

    expect(secondTeam.players[5].currentPOS).to.eql([655, 500]);

    expect(kickOffTeam.players[5].currentPOS).to.eql([
      80,
      Math.floor(pitchHeight * 0.25),
    ]);

    expect(STgoalie.currentPOS).to.eql([
      STgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql(KOTgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS).to.eql([thisPlayer.originPOS[0], 600]);

      expect(thatPlayer.currentPOS).to.eql(thatPlayer.originPOS);
    }

    for (const num of [6, 7, 8]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.lt(351);

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.25),
      ]);
    }

    for (const num of [9, 10]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      expect(thisPlayer.currentPOS[1]).to.lt(
        Math.floor(pitchHeight * 0.25 - 60),
      );

      expect(thatPlayer.currentPOS).to.eql([
        thatPlayer.originPOS[0],
        Math.floor(pitchHeight * 0.5),
      ]);
    }
  });
});

describe('testFreekicksBottomLastQuarter()', function () {
  it('freekick last quarter - top center', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(
      itlocation,
      [340, 250],
    );

    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;

    const { kickOffTeam, secondTeam } = nextJSON;

    const KOTgoalie = kickOffTeam.players[0];

    const STgoalie = secondTeam.players[0];

    let playerSpace = -3;

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('north');

    expect(nextJSON.ball.position).to.eql([340, 250]);

    expect(secondTeam.players[5].currentPOS).to.eql([340, 250]);

    expect(STgoalie.currentPOS).to.eql([
      STgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql(KOTgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;

      const midWayFromBalltoGoalX = Math.floor(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
      );

      const midWayFromBalltoGoalY = Math.floor(nextJSON.ball.position[1] / 2);

      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.33),
        ]);
      }

      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX + playerSpace,
        midWayFromBalltoGoalY,
      ]);

      playerSpace += 2;
    }

    const boundaryX = [pitchWidth / 4 + 5, pitchWidth - pitchWidth / 4 - 5];

    const boundaryY = [-1, pitchHeight / 6 + 7];

    for (const num of [5, 6, 7, 8, 9, 10]) {
      // 1. Destructure coordinates for cleaner access
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;

      const [xST, yST] = secondTeam.players[num].currentPOS;

      // 2. Validate X (Type narrowing: Y is known to be a number)
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Player ${num} coordinate error: received 'NP'`);
      }

      // 3. Perform boundary checks (ST for 6-10, KOT for 5)
      if (num !== 5) {
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });

  it('freekick last sixth - Bottom edge of penalty box', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(
      itlocation,
      [340, 171],
    );

    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;

    const { kickOffTeam, secondTeam } = nextJSON;

    const KOTgoalie = kickOffTeam.players[0];

    const STgoalie = secondTeam.players[0];

    let playerSpace = -3;

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('north');

    expect(nextJSON.ball.position).to.eql([340, 171]);

    expect(secondTeam.players[5].currentPOS).to.eql([340, 171]);

    expect(STgoalie.currentPOS).to.eql([
      STgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql(KOTgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;

      const midWayFromBalltoGoalX = Math.floor(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
      );

      const midWayFromBalltoGoalY = Math.floor(nextJSON.ball.position[1] / 2);

      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.33),
        ]);
      }

      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX + playerSpace,
        midWayFromBalltoGoalY,
      ]);

      playerSpace += 2;
    }

    const boundaryX = [pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 7];

    const boundaryY = [-1, pitchHeight / 6 + 7];

    for (const num of [5, 6, 7, 8, 9, 10]) {
      // 1. Destructure coordinates
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;

      const [xST, yST] = secondTeam.players[num].currentPOS;

      // 2. Narrow types by guarding X (Y is guaranteed numeric)
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Player ${num} missing position data ('NP')`);
      }

      // 3. Logic: Check ST for [6-10] and KOT for [5]
      if (num !== 5) {
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });

  it('freekick last sixth - Bottom team top left', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(
      itlocation,
      [10, 174],
    );

    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;

    const { kickOffTeam, secondTeam } = nextJSON;

    const KOTgoalie = kickOffTeam.players[0];

    const STgoalie = secondTeam.players[0];

    let playerSpace = -3;

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('northeast');

    expect(nextJSON.ball.position).to.eql([10, 174]);

    expect(secondTeam.players[5].currentPOS).to.eql([10, 174]);

    expect(STgoalie.currentPOS).to.eql([
      STgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql(KOTgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;

      const midWayFromBalltoGoalX = Math.floor(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
      );

      const midWayFromBalltoGoalY = Math.floor(nextJSON.ball.position[1] / 2);

      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.33),
        ]);
      }

      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX + playerSpace,
        midWayFromBalltoGoalY,
      ]);

      playerSpace += 2;
    }

    const boundaryX = [pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 7];

    const boundaryY = [-1, pitchHeight / 6 + 7];

    for (const num of [5, 6, 7, 8, 9, 10]) {
      // 1. Destructure for readability
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;

      const [xST, yST] = secondTeam.players[num].currentPOS;

      // 2. Narrow type to number by guarding X ('NP' check)
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Invalid position 'NP' for player at index ${num}`);
      }

      // 3. Logic: Assert ST boundaries for players 6-10, KOT for player 5
      if (num !== 5) {
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });

  it('freekick and last sixth - Bottom team bottom right', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(
      itlocation,
      [600, 177],
    );

    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;

    const { kickOffTeam, secondTeam } = nextJSON;

    const KOTgoalie = kickOffTeam.players[0];

    const STgoalie = secondTeam.players[0];

    let playerSpace = -3;

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('northwest');

    expect(nextJSON.ball.position).to.eql([600, 177]);

    expect(secondTeam.players[5].currentPOS).to.eql([600, 177]);

    expect(STgoalie.currentPOS).to.eql([
      STgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql(KOTgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

      const ballDistanceFromGoalX = nextJSON.ball.position[0] - pitchWidth / 2;

      const midWayFromBalltoGoalX = Math.floor(
        (nextJSON.ball.position[0] - ballDistanceFromGoalX) / 2,
      );

      const midWayFromBalltoGoalY = Math.floor(nextJSON.ball.position[1] / 2);

      if (thisPlayer.position === 'CB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.5),
        ]);
      } else if (thisPlayer.position === 'LB' || thisPlayer.position === 'RB') {
        expect(thisPlayer.currentPOS).to.eql([
          thisPlayer.originPOS[0],
          Math.floor(pitchHeight * 0.33),
        ]);
      }

      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX + playerSpace,
        midWayFromBalltoGoalY,
      ]);

      playerSpace += 2;
    }

    const boundaryX = [pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 7];

    const boundaryY = [-1, pitchHeight / 6 + 7];

    for (const num of [5, 6, 7, 8, 9, 10]) {
      // 1. Destructure coordinates
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;

      const [xST, yST] = secondTeam.players[num].currentPOS;

      // 2. Narrow types by checking X (Y is guaranteed numeric)
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Player ${num} has invalid position data ('NP')`);
      }

      // 3. Logic: Check ST for [6-10], KOT for [5]
      if (num !== 5) {
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });

  it('freekick last sixth - Bottom team bottom left goal line', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(itlocation, [10, 1]);

    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;

    const { kickOffTeam, secondTeam } = nextJSON;

    const KOTgoalie = kickOffTeam.players[0];

    const STgoalie = secondTeam.players[0];

    let firstWallPosition = 0;

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('east');

    expect(nextJSON.ball.position).to.eql([10, 1]);

    expect(secondTeam.players[5].currentPOS).to.eql([10, 1]);

    expect(STgoalie.currentPOS).to.eql([
      STgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql(KOTgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

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
          Math.floor(pitchHeight * 0.33),
        ]);
      }

      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX,
        firstWallPosition,
      ]);

      firstWallPosition += 2;
    }

    const boundaryX = [pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 7];

    const boundaryY = [-1, pitchHeight / 6 + 7];

    for (const num of [5, 6, 7, 8, 9, 10]) {
      // 1. Destructure coordinates
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;

      const [xST, yST] = secondTeam.players[num].currentPOS;

      // 2. Validate only X (Y is known to be number)
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Player ${num} is missing X coordinate ('NP')`);
      }

      // 3. Logic: Check ST for [6-10] and KOT for [5]
      if (num !== 5) {
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });

  it('freekick last sixth - Bottom team bottom right goal line', async () => {
    const itlocation = './src/init_config/iteration.json';

    const nextJSON = await setfreekicks.setBottomFreekick(itlocation, [600, 1]);

    const [pitchWidth, pitchHeight] = nextJSON.pitchSize;

    const { kickOffTeam, secondTeam } = nextJSON;

    const KOTgoalie = kickOffTeam.players[0];

    const STgoalie = secondTeam.players[0];

    let firstWallPosition = 0;

    expect(nextJSON).to.be.an('object');

    expect(nextJSON.ball.direction).to.eql('west');

    expect(nextJSON.ball.position).to.eql([600, 1]);

    expect(secondTeam.players[5].currentPOS).to.eql([600, 1]);

    expect(STgoalie.currentPOS).to.eql([
      STgoalie.originPOS[0],
      Math.floor(pitchHeight * 0.75),
    ]);

    expect(KOTgoalie.currentPOS).to.eql(KOTgoalie.originPOS);
    for (const num of [1, 2, 3, 4]) {
      const thisPlayer = secondTeam.players[num];

      const thatPlayer = kickOffTeam.players[num];

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
          Math.floor(pitchHeight * 0.33),
        ]);
      }

      expect(thatPlayer.currentPOS).to.eql([
        midWayFromBalltoGoalX,
        firstWallPosition,
      ]);

      firstWallPosition += 2;
    }

    const boundaryX = [pitchWidth / 4 - 5, pitchWidth - pitchWidth / 4 + 7];

    const boundaryY = [-1, pitchHeight / 6 + 7];

    for (const num of [5, 6, 7, 8, 9, 10]) {
      // 1. Destructure coordinates immediately
      const [xKOT, yKOT] = kickOffTeam.players[num].currentPOS;

      const [xST, yST] = secondTeam.players[num].currentPOS;

      // 2. Validate against 'NP' to narrow types to 'number'
      if (xKOT === 'NP' || xST === 'NP') {
        throw new Error(`Position data missing ('NP') for player index ${num}`);
      }

      // 3. Perform boundary checks using the narrowed numeric variables
      // Logic: Check ST for [6,7,8,9,10] and KOT for [5]
      if (num !== 5) {
        expect(common.isBetween(xST, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yST, boundaryY[0], boundaryY[1])).toBe(true);
      } else {
        expect(common.isBetween(xKOT, boundaryX[0], boundaryX[1])).toBe(true);

        expect(common.isBetween(yKOT, boundaryY[0], boundaryY[1])).toBe(true);
      }
    }
  });
});
