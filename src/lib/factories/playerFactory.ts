import { initializePlayerObject } from '../playerDefaults.js';
import type { Player, BallPosition } from '../types.js';

export function createPlayer(position: string): Player {
  return initializePlayerObject(position);
}

export function setBPlayer(ballPos: BallPosition): Player {
  const [ballX, ballY] = ballPos;

  const pos: [number, number] = [ballX, ballY];

  const player = createPlayer('LB');

  const patch: Partial<Player> = {
    name: `Ball`,
    position: `LB`,
    rating: `100`,
    skill: {
      passing: 100,
      shooting: 100,
      saving: 100,
      tackling: 100,
      agility: 100,
      strength: 100,
      penalty_taking: 100,
      jumping: 100,
    },
    originPOS: pos,
    currentPOS: pos,
    injured: false,
  };

  return { ...player, ...patch };
}
