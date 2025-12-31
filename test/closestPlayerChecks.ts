import { expect, it, describe } from 'vitest';

import { readFile } from '../lib/fileReader.js';
import playerMovement from '../lib/playerMovement.js';
import { MatchDetails } from 'lib/types.js';

describe('testClosestPlayer()', function () {
  it('find the closest player to the ball - test 1', async () => {
    const inputIteration = './test/input/closestPositions/closest1.json';
    const matchInfo = (await readFile(inputIteration)) as MatchDetails;
    const closestPlayerA = {
      name: '',
      position: 10000,
    };
    const closestPlayerB = {
      name: '',
      position: 10000,
    };
    playerMovement.closestPlayerToBall(
      closestPlayerA,
      matchInfo.kickOffTeam,
      matchInfo,
    );
    expect(closestPlayerA).to.eql({ name: 'Arthur Johnson', position: 101 });
    playerMovement.closestPlayerToBall(
      closestPlayerB,
      matchInfo.secondTeam,
      matchInfo,
    );
    expect(closestPlayerB).to.eql({ name: 'Wayne Smith', position: 229 });
  });
  it('find the closest player to the ball - test 2', async () => {
    const inputIteration = './test/input/closestPositions/closest2.json';
    const matchInfo = (await readFile(inputIteration)) as MatchDetails;
    const closestPlayerA = {
      name: '',
      position: 10000,
    };
    const closestPlayerB = {
      name: '',
      position: 10000,
    };
    playerMovement.closestPlayerToBall(
      closestPlayerA,
      matchInfo.kickOffTeam,
      matchInfo,
    );
    expect(closestPlayerA).to.eql({ name: 'Arthur Johnson', position: 97 });
    playerMovement.closestPlayerToBall(
      closestPlayerB,
      matchInfo.secondTeam,
      matchInfo,
    );
    expect(closestPlayerB).to.eql({ name: 'Wayne Smith', position: 227 });
  });
  it('find the closest player to the ball - test 3', async () => {
    const inputIteration = './test/input/closestPositions/closest3.json';
    const matchInfo = (await readFile(inputIteration)) as MatchDetails;
    const closestPlayerA = {
      name: '',
      position: 10000,
    };
    const closestPlayerB = {
      name: '',
      position: 10000,
    };
    playerMovement.closestPlayerToBall(
      closestPlayerA,
      matchInfo.kickOffTeam,
      matchInfo,
    );
    expect(closestPlayerA).to.eql({ name: 'Louise Johnson', position: 162.5 });
    playerMovement.closestPlayerToBall(
      closestPlayerB,
      matchInfo.secondTeam,
      matchInfo,
    );
    expect(closestPlayerB).to.eql({ name: 'Emily Smith', position: 66.5 });
  });
  it('find the closest player to the ball - test 4', async () => {
    const inputIteration = './test/input/closestPositions/closest4.json';
    const matchInfo = (await readFile(inputIteration)) as MatchDetails;
    const closestPlayerA = {
      name: '',
      position: 10000,
    };
    const closestPlayerB = {
      name: '',
      position: 10000,
    };
    playerMovement.closestPlayerToBall(
      closestPlayerA,
      matchInfo.kickOffTeam,
      matchInfo,
    );
    expect(closestPlayerA).to.eql({ name: 'George Johnson', position: 110 });
    playerMovement.closestPlayerToBall(
      closestPlayerB,
      matchInfo.secondTeam,
      matchInfo,
    );
    expect(closestPlayerB).to.eql({ name: 'Wayne Smith', position: 305.5 });
  });
});
