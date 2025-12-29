import { expect, it, describe } from 'vitest';
import { readFile } from '../lib/fileReader.js';
import common from '../lib/common.js';
import setPos from '../lib/setPositions.js';

describe('intentPOSitionsDefence()', function () {
  it('kickoff team defensive players move towards ball on opposite side', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTinOwnHalf2.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerKOTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    const ballPosition = matchDetails.ball.position;
    if (ballPosition[2] >= 0) ballPosition.pop();
    expect(matchDetails).to.be.an('object');
    for (const player of matchDetails.kickOffTeam.players) {
      if (player.playerID === closestPlayer.playerID)
        expect(player.intentPOS).to.eql(ballPosition);
      else
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          player.currentPOS[1] - 20,
        ]);
    }
  });
  it('kickoff team defensive players move towards ball on opposite side with player near', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTinOwnHalf3.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerKOTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    const ballPosition = matchDetails.ball.position;
    if (ballPosition[2] >= 0) ballPosition.pop();
    expect(matchDetails).to.be.an('object');
    for (const player of matchDetails.kickOffTeam.players) {
      const diffXPOSplayerandball = ballPosition[0] - player.currentPOS[0];
      const diffYPOSplayerandball = ballPosition[1] - player.currentPOS[1];
      const xPosProx = common.isBetween(diffXPOSplayerandball, -40, 40);
      const yPosProx = common.isBetween(diffYPOSplayerandball, -40, 40);
      if (player.playerID === closestPlayer.playerID)
        expect(player.intentPOS).to.eql(ballPosition);
      else if (xPosProx && yPosProx)
        expect(player.intentPOS).to.eql(ballPosition);
      else
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          player.currentPOS[1] - 20,
        ]);
    }
  });
  it('secondteam defensive players move towards ball on opposite side', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTinOwnHalf.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerSTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    const ballPosition = matchDetails.ball.position;
    if (ballPosition[2] >= 0) ballPosition.pop();
    expect(matchDetails).to.be.an('object');
    for (const player of matchDetails.secondTeam.players) {
      if (player.playerID === closestPlayer.playerID)
        expect(player.intentPOS).to.eql(ballPosition);
      else
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          player.currentPOS[1] - 20,
        ]);
    }
  });
  it('kickoff team defensive players ball in own half', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTinDEFHalf2.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerKOTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    expect(matchDetails).to.be.an('object');
    const ballPosition = matchDetails.ball.position;
    if (ballPosition[2] >= 0) ballPosition.pop();
    for (const playerNum of [0, 1, 2, 3, 4]) {
      const thisPlayer = matchDetails.kickOffTeam.players[playerNum];
      if (thisPlayer.playerID === closestPlayer.playerID)
        expect(thisPlayer.intentPOS).to.eql(ballPosition);
      else expect(thisPlayer.intentPOS).to.eql(thisPlayer.originPOS);
    }
    for (const playerNum of [5, 6, 7, 8, 9, 10]) {
      const thisPlayer = matchDetails.kickOffTeam.players[playerNum];
      expect(thisPlayer.intentPOS).to.eql(thisPlayer.originPOS);
    }
  });
  it('second team defensive players ball in own half', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTinDEFHalf.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerSTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    const ballPosition = matchDetails.ball.position;
    ballPosition.pop();
    expect(matchDetails).to.be.an('object');
    for (const player of matchDetails.secondTeam.players) {
      if (player.playerID === closestPlayer.playerID)
        expect(player.intentPOS).to.eql(ballPosition);
      else expect(player.intentPOS).to.eql(player.originPOS);
    }
  });
});
describe('intentPOSitionsAttacking()', function () {
  it('kickoff team attacking from behind originPOS', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTbehindOrigin.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerKOTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    for (const player of matchDetails.kickOffTeam.players) {
      expect(player.intentPOS).to.eql([
        player.originPOS[0],
        player.currentPOS[1] + 20,
      ]);
    }
  });
  it('kickoff team attacking from originPOS', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTfromOrigin.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerKOTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    for (const player of matchDetails.kickOffTeam.players) {
      expect(player.intentPOS).to.eql([
        player.originPOS[0],
        player.currentPOS[1] + 20,
      ]);
    }
  });
  it('kickoff team attacking from ahead of originPOS', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTaheadOfOrigin.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerKOTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    for (const player of matchDetails.kickOffTeam.players) {
      expect(player.intentPOS).to.eql([
        player.originPOS[0],
        player.currentPOS[1] + 20,
      ]);
    }
  });
  it('second team attacking from behind originPOS', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTbehindOrigin2.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerSTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    for (const player of matchDetails.secondTeam.players) {
      expect(player.intentPOS).to.eql([
        player.originPOS[0],
        player.currentPOS[1] - 20,
      ]);
    }
  });
  it('second team attacking from originPOS', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTfromOrigin2.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerSTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    for (const player of matchDetails.secondTeam.players) {
      expect(player.intentPOS).to.eql([
        player.originPOS[0],
        player.currentPOS[1] - 20,
      ]);
    }
  });
  it('second team attacking from ahead of originPOS', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTaheadOfOrigin2.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerSTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    for (const player of matchDetails.secondTeam.players) {
      expect(player.intentPOS).to.eql([
        player.originPOS[0],
        player.currentPOS[1] - 20,
      ]);
    }
  });
  it('kickoff team attacking in own half from top', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTinOwnHalf4.json',
    );
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerKOTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    expect(matchDetails).to.be.an('object');
    for (const player of matchDetails.kickOffTeam.players) {
      if (!player.hasBall) {
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          player.currentPOS[1] + 20,
        ]);
      }
    }
  });
  it('kickoff team deep in opposition half do not exceed forward limits', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTdeep.json',
    );
    const [, pitchHeight] = matchDetails.pitchSize;
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerKOTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    expect(matchDetails).to.be.an('object');
    for (const player of matchDetails.kickOffTeam.players) {
      if (player.position === 'GK') {
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          parseInt(pitchHeight * 0.15, 10),
        ]);
      } else if (player.position === 'CB') {
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          parseInt(pitchHeight * 0.25, 10),
        ]);
      } else if (player.position === 'LB' || player.position === 'RB') {
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          parseInt(pitchHeight * 0.66, 10),
        ]);
      } else if (player.position === 'CM') {
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          parseInt(pitchHeight * 0.75, 10),
        ]);
      } else {
        expect(player.intentPOS).to.eql([player.originPOS[0], 985]);
      }
    }
  });
  it('second team deep in opposition half do not exceed forward limits', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/intentPositionATTdeep2.json',
    );
    const [, pitchHeight] = matchDetails.pitchSize;
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerSTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    expect(matchDetails).to.be.an('object');
    for (const player of matchDetails.secondTeam.players) {
      if (player.position === 'GK') {
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          parseInt(pitchHeight * 0.85, 10),
        ]);
      } else if (player.position === 'CB') {
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          parseInt(pitchHeight * 0.75, 10),
        ]);
      } else if (player.position === 'LB' || player.position === 'RB') {
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          parseInt(pitchHeight * 0.33, 10),
        ]);
      } else if (player.position === 'CM') {
        expect(player.intentPOS).to.eql([
          player.originPOS[0],
          parseInt(pitchHeight * 0.25, 10),
        ]);
      } else {
        expect(player.intentPOS).to.eql([player.originPOS[0], 30]);
      }
    }
  });
});
describe('intentPOSitionsLooseBall()', function () {
  it('kickoff team moves towards ball', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/looseBall.json',
    );
    const { kickOffTeam } = matchDetails;
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerKOTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    expect(matchDetails).to.be.an('object');
    expect(kickOffTeam.players[0].intentPOS).to.eql([
      kickOffTeam.players[0].originPOS[0],
      20,
    ]);
    expect(kickOffTeam.players[1].intentPOS).to.eql([380, 1000]);
    expect(kickOffTeam.players[2].intentPOS).to.eql([
      kickOffTeam.players[2].originPOS[0],
      101,
    ]);
    expect(kickOffTeam.players[3].intentPOS).to.eql([
      kickOffTeam.players[3].originPOS[0],
      101,
    ]);
    expect(kickOffTeam.players[4].intentPOS).to.eql([
      kickOffTeam.players[4].originPOS[0],
      287,
    ]);
    expect(kickOffTeam.players[5].intentPOS).to.eql([
      kickOffTeam.players[5].originPOS[0],
      465,
    ]);
    expect(kickOffTeam.players[6].intentPOS).to.eql([
      kickOffTeam.players[6].originPOS[0],
      484,
    ]);
    expect(kickOffTeam.players[7].intentPOS).to.eql([
      kickOffTeam.players[7].originPOS[0],
      482,
    ]);
    expect(kickOffTeam.players[8].intentPOS).to.eql([
      kickOffTeam.players[8].originPOS[0],
      481,
    ]);
    expect(kickOffTeam.players[9].intentPOS).to.eql([
      kickOffTeam.players[9].originPOS[0],
      724,
    ]);
    expect(kickOffTeam.players[10].intentPOS).to.eql([
      kickOffTeam.players[10].originPOS[0],
      733,
    ]);
  });
  it('second team moves towards ball', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/looseBall2.json',
    );
    const { secondTeam } = matchDetails;
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerSTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    expect(matchDetails).to.be.an('object');
    expect(secondTeam.players[0].intentPOS).to.eql([
      secondTeam.players[0].originPOS[0],
      1030,
    ]);
    expect(secondTeam.players[1].intentPOS).to.eql([80, 485]);
    expect(secondTeam.players[2].intentPOS).to.eql([
      secondTeam.players[2].originPOS[0],
      950,
    ]);
    expect(secondTeam.players[3].intentPOS).to.eql([
      secondTeam.players[3].originPOS[0],
      950,
    ]);
    expect(secondTeam.players[4].intentPOS).to.eql([
      secondTeam.players[4].originPOS[0],
      537,
    ]);
    expect(secondTeam.players[5].intentPOS).to.eql([
      secondTeam.players[5].originPOS[0],
      415,
    ]);
    expect(secondTeam.players[6].intentPOS).to.eql([
      secondTeam.players[6].originPOS[0],
      414,
    ]);
    expect(secondTeam.players[7].intentPOS).to.eql([
      secondTeam.players[7].originPOS[0],
      412,
    ]);
    expect(secondTeam.players[8].intentPOS).to.eql([
      secondTeam.players[8].originPOS[0],
      455,
    ]);
    expect(secondTeam.players[9].intentPOS).to.eql([
      secondTeam.players[9].originPOS[0],
      205,
    ]);
    expect(secondTeam.players[10].intentPOS).to.eql([
      secondTeam.players[10].originPOS[0],
      205,
    ]);
  });
  it('second team moves towards ball player near ball', async () => {
    const matchDetails = await readFile(
      './test/input/boundaryPositions/looseBall3.json',
    );
    const { secondTeam } = matchDetails;
    const closestPlayer = await readFile(
      './test/input/closestPositions/closestPlayerSTInput.json',
    );
    setPos.setIntentPosition(matchDetails, closestPlayer);
    expect(matchDetails).to.be.an('object');
    expect(secondTeam.players[0].intentPOS).to.eql([
      secondTeam.players[0].originPOS[0],
      1030,
    ]);
    expect(secondTeam.players[1].intentPOS).to.eql([
      secondTeam.players[1].originPOS[0],
      485,
    ]);
    expect(secondTeam.players[2].intentPOS).to.eql([
      secondTeam.players[2].originPOS[0],
      950,
    ]);
    expect(secondTeam.players[3].intentPOS).to.eql([
      secondTeam.players[3].originPOS[0],
      950,
    ]);
    expect(secondTeam.players[4].intentPOS).to.eql([
      secondTeam.players[4].originPOS[0],
      537,
    ]);
    expect(secondTeam.players[5].intentPOS).to.eql([
      secondTeam.players[5].originPOS[0],
      415,
    ]);
    expect(secondTeam.players[6].intentPOS).to.eql([
      secondTeam.players[6].originPOS[0],
      414,
    ]);
    expect(secondTeam.players[7].intentPOS).to.eql([
      secondTeam.players[7].originPOS[0],
      412,
    ]);
    expect(secondTeam.players[8].intentPOS).to.eql([
      secondTeam.players[8].originPOS[0],
      455,
    ]);
    expect(secondTeam.players[9].intentPOS).to.eql([
      secondTeam.players[9].originPOS[0],
      205,
    ]);
    expect(secondTeam.players[10].intentPOS).to.eql([341, 10]);
  });
});
