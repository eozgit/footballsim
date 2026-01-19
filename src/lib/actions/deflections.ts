import * as common from '../common.js'
import { calculateDeflectionVector } from "../physics.js";
import { keepInBoundaries, setSetpieceSecondTeam, setSetpieceKickOffTeam } from '../setPositions.js';
import type { Player, Team, MatchDetails, BallPosition } from "../types.js";

export function resolveDeflection(deflectionConfig: {
  power: number;
  startPos: [number, number];
  defPosition: [number, number];
  player: Player;
  team: Team;
  matchDetails: MatchDetails;
}): BallPosition {
  const {
    power,
    startPos: thisPOS,
    defPosition,
    player: defPlayer,
    team: defTeam,
  } = deflectionConfig;

  let { matchDetails } = deflectionConfig;

  const xMovement = (thisPOS[0] - defPosition[0]) ** 2;

  const yMovement = (thisPOS[1] - defPosition[1]) ** 2;

  const movementDistance = Math.sqrt(xMovement + yMovement);

  const newPower = power - movementDistance;

  let tempPosition: BallPosition = [0, 0];

  const { direction } = matchDetails.ball;

  if (newPower < 75) {
    setDeflectionPlayerHasBall(matchDetails, defPlayer, defTeam);

    return defPosition;
  }

  defPlayer.hasBall = false;
  matchDetails.ball.Player = '';
  matchDetails.ball.withPlayer = false;
  matchDetails.ball.withTeam = '';
  tempPosition = setDeflectionDirectionPos(direction, defPosition, newPower);
  const lastTeam = matchDetails.ball.lastTouch.teamID;

  matchDetails = keepInBoundaries(matchDetails, `Team: ${lastTeam}`, tempPosition);
  const intended = matchDetails.ballIntended;

  const lastPOS = structuredClone(intended ?? matchDetails.ball.position);

  delete matchDetails.ballIntended;

  return lastPOS;
}



export function setDeflectionPlayerHasBall(
  matchDetails: MatchDetails,
  defPlayer: Player,
  defTeam: Team,
): BallPosition | undefined {
  defPlayer.hasBall = true;
  matchDetails.ball.lastTouch.playerName = defPlayer.name;
  matchDetails.ball.lastTouch.playerID = defPlayer.playerID;
  matchDetails.ball.lastTouch.teamID = defTeam.teamID;

  if (defPlayer.offside === true) {
    matchDetails = setDeflectionPlayerOffside(matchDetails, defTeam, defPlayer);

    return matchDetails.ball.position;
  }

  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.Player = defPlayer.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = defTeam.teamID;
  const [posX, posY] = common.destructPos(defPlayer.currentPOS);

  matchDetails.ball.position = [posX, posY];

  return undefined;
}



export function setDeflectionDirectionPos(
  direction: string,
  defPosition: [number, number],
  newPower: number,
): [number, number] {
  return calculateDeflectionVector(direction, defPosition, newPower);
}




export function setDeflectionPlayerOffside(
  matchDetails: MatchDetails,
  defTeam: Team,
  defPlayer: Player,
): MatchDetails {
  defPlayer.offside = false;
  defPlayer.hasBall = false;
  matchDetails.ball.Player = '';
  matchDetails.ball.withPlayer = false;
  matchDetails.ball.withTeam = '';
  matchDetails.iterationLog.push(`${defPlayer.name} is offside. Set piece given`);

  if (defTeam.name === matchDetails.kickOffTeam.name) {
    matchDetails = setSetpieceSecondTeam(matchDetails);
  } else {
    matchDetails = setSetpieceKickOffTeam(matchDetails);
  }

  return matchDetails;
}
