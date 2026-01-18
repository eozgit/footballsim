import { round } from '../common.js';
import type { BallPosition } from '../types.js';

export function getBallTrajectory(
  thisPOS: BallPosition,
  newPOS: BallPosition,
  power: number,
): [number, number, number][] {
  const xMovement = (thisPOS[0] - newPOS[0]) ** 2;

  const yMovement = (Math.floor(thisPOS[1]) - Math.floor(newPOS[1])) ** 2;

  const movementDistance = Math.round(Math.sqrt(xMovement + yMovement));

  let arraySize = Math.round(thisPOS[1] - newPOS[1]);

  let effectivePower = power;

  if (movementDistance >= power) {
    effectivePower = Math.floor(power) + Math.floor(movementDistance);
  }

  const height = Math.sqrt(Math.abs((movementDistance / 2) ** 2 - (effectivePower / 2) ** 2));

  if (arraySize < 1) {
    arraySize = 1;
  }

  const yPlaces = Array.from({ length: Math.abs(arraySize) }, (_, i) => i);

  const trajectory: [number, number, number][] = [[thisPOS[0], thisPOS[1], 0]];

  const changeInX = (newPOS[0] - thisPOS[0]) / Math.abs(thisPOS[1] - newPOS[1]);

  const changeInY = (thisPOS[1] - newPOS[1]) / (newPOS[1] - thisPOS[1]);

  const changeInH = height / (yPlaces.length / 2);

  let elevation = 1;

  yPlaces.forEach(() => {
    const lastX = trajectory[trajectory.length - 1][0];

    const lastY = trajectory[trajectory.length - 1][1];

    const lastH = trajectory[trajectory.length - 1][2];

    const xPos = round(lastX + changeInX, 5);

    let yPos = 0;

    if (newPOS[1] > thisPOS[1]) {
      yPos = Math.floor(lastY) - Math.floor(changeInY);
    } else {
      yPos = Math.floor(lastY) + Math.floor(changeInY);
    }

    let hPos;

    if (elevation === 1) {
      hPos = round(lastH + changeInH, 5);

      if (hPos >= height) {
        elevation = 0;
        hPos = height;
      }
    } else {
      hPos = round(lastH - changeInH, 5);
    }

    trajectory.push([xPos, yPos, hPos]);
  });

  return trajectory;
}
