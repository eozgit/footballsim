'use strict';
const common = require(`../lib/common.js`);
const setPositions = require(`../lib/setPositions.js`);

function moveBall(matchDetails) {
  if (
    matchDetails.ball.ballOverIterations === undefined ||
    matchDetails.ball.ballOverIterations.length === 0
  ) {
    matchDetails.ball.direction = `wait`;
    return matchDetails;
  }
  const { ball } = matchDetails;
  const bPosition = ball.position;
  const { kickOffTeam, secondTeam } = matchDetails;
  const ballPos = ball.ballOverIterations[0];
  getBallDirection(matchDetails, ballPos);
  const power = ballPos[2];
  ballPos.splice();
  const bPlayer = setBPlayer(ballPos);
  const endPos = resolveBallMovement(
    bPlayer,
    bPosition,
    ballPos,
    power,
    kickOffTeam,
    secondTeam,
    matchDetails,
  );
  if (matchDetails.endIteration === true) return matchDetails;
  matchDetails.ball.ballOverIterations.shift();
  matchDetails.iterationLog.push(
    `ball still moving from previous kick: ${endPos}`,
  );
  matchDetails.ball.position = endPos;
  checkGoalScored(matchDetails);
  return matchDetails;
}

function setBPlayer(ballPos) {
  return {
    name: `Ball`,
    position: `LB`,
    rating: `100`,
    skill: {
      passing: `100`,
      shooting: `100`,
      saving: `100`,
      tackling: `100`,
      agility: `100`,
      strength: `100`,
      penalty_taking: `100`,
      jumping: `100`,
    },
    originPOS: ballPos,
    currentPOS: ballPos,
    injured: false,
  };
}

function ballKicked(matchDetails, team, player) {
  const { position } = matchDetails.ball;
  let { direction } = matchDetails.ball;
  const [, pitchHeight] = matchDetails.pitchSize;
  matchDetails.iterationLog.push(`ball kicked by: ${player.name}`);
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  let newPos = [0, 0];
  const teamShootingToTop = [
    `wait`,
    `north`,
    `north`,
    `north`,
    `north`,
    `east`,
    `east`,
    `west`,
    `west`,
  ];
  const teamShootingToTop2 = [
    `northeast`,
    `northeast`,
    `northeast`,
    `northwest`,
    `northwest`,
    `northwest`,
  ];
  const topTeamDirection = teamShootingToTop.concat(teamShootingToTop2);
  const teamShootingToBottom = [
    `wait`,
    `south`,
    `south`,
    `south`,
    `south`,
    `east`,
    `east`,
    `west`,
    `west`,
  ];
  const teamShootingToBottom2 = [
    `southeast`,
    `southeast`,
    `southeast`,
    `southwest`,
    `southwest`,
    `southwest`,
  ];
  const bottomTeamDirection = teamShootingToBottom.concat(
    teamShootingToBottom2,
  );
  const power = common.calculatePower(player.skill.strength);
  if (player.originPOS[1] > pitchHeight / 2) {
    direction =
      topTeamDirection[common.getRandomNumber(0, topTeamDirection.length - 1)];
    newPos = getTopKickedPosition(direction, position, power);
  } else {
    direction =
      bottomTeamDirection[
        common.getRandomNumber(0, bottomTeamDirection.length - 1)
      ];
    newPos = getBottomKickedPosition(direction, position, power);
  }
  return calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    newPos,
    player,
  );
}

function getTopKickedPosition(direction, position, power) {
  if (direction === `wait`)
    return newKickedPosition(position, 0, power / 2, 0, power / 2);
  else if (direction === `north`)
    return newKickedPosition(position, -20, 20, -power, -(power / 2));
  else if (direction === `east`)
    return newKickedPosition(position, power / 2, power, -20, 20);
  else if (direction === `west`)
    return newKickedPosition(position, -power, -(power / 2), -20, 20);
  else if (direction === `northeast`)
    return newKickedPosition(position, 0, power / 2, -power, -(power / 2));
  else if (direction === `northwest`)
    return newKickedPosition(position, -(power / 2), 0, -power, -(power / 2));
}

function getBottomKickedPosition(direction, position, power) {
  if (direction === `wait`)
    return newKickedPosition(position, 0, power / 2, 0, power / 2);
  else if (direction === `south`)
    return newKickedPosition(position, -20, 20, power / 2, power);
  else if (direction === `east`)
    return newKickedPosition(position, power / 2, power, -20, 20);
  else if (direction === `west`)
    return newKickedPosition(position, -power, -(power / 2), -20, 20);
  else if (direction === `southeast`)
    return newKickedPosition(position, 0, power / 2, power / 2, power);
  else if (direction === `southwest`)
    return newKickedPosition(position, -(power / 2), 0, power / 2, power);
}

function newKickedPosition(pos, lowX, highX, lowY, highY) {
  const newPosition = [0, 0];
  newPosition[0] = pos[0] + common.getRandomNumber(lowX, highX);
  newPosition[1] = pos[1] + common.getRandomNumber(lowY, highY);
  return newPosition;
}

function shotMade(matchDetails, team, player) {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  matchDetails.iterationLog.push(`Shot Made by: ${player.name}`);
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  const shotPosition = [0, 0];
  const shotPower = common.calculatePower(player.skill.strength);
  const PlyPos = player.currentPOS;
  let thisTeamStats;
  if (common.isEven(matchDetails.half))
    thisTeamStats = matchDetails.kickOffTeamStatistics;
  else if (common.isOdd(matchDetails.half))
    thisTeamStats = matchDetails.secondTeamStatistics;
  else throw new Error(`You cannot supply 0 as a half`);
  common.debug('bm1', thisTeamStats.shots);
  common.debug('bm2', player.stats.shots);
  thisTeamStats.shots.total++;
  player.stats.shots.total++;
  let shotReachGoal;
  if (player.originPOS[1] > pitchHeight / 2) {
    shotReachGoal = !(PlyPos[1] - shotPower > 0);
  } else {
    shotReachGoal = !(PlyPos[1] + shotPower < pitchHeight);
  }
  if (shotReachGoal && player.skill.shooting > common.getRandomNumber(0, 40)) {
    thisTeamStats.shots.on++;
    player.stats.shots.on++;
    shotPosition[0] = common.getRandomNumber(
      pitchWidth / 2 - 50,
      pitchWidth / 2 + 50,
    );
    matchDetails.iterationLog.push(
      `Shot On Target at X Position ${shotPosition[0]}`,
    );
    if (player.originPOS[1] > pitchHeight / 2) shotPosition[1] = -1;
    else shotPosition[1] = pitchHeight + 1;
  } else {
    thisTeamStats.shots.off++;
    player.stats.shots.off++;
    const left = common.getRandomNumber(0, 10) > 5;
    const leftPos = common.getRandomNumber(0, pitchWidth / 2 - 55);
    const righttPos = common.getRandomNumber(pitchWidth / 2 + 55, pitchWidth);
    shotPosition[0] = left ? leftPos : righttPos;
    matchDetails.iterationLog.push(
      `Shot Off Target at X Position ${shotPosition[0]}`,
    );
    if (player.originPOS[1] > pitchHeight / 2)
      shotPosition[1] = PlyPos[1] - shotPower;
    else shotPosition[1] = PlyPos[1] + shotPower;
  }
  const endPos = calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    shotPosition,
    player,
  );
  checkGoalScored(matchDetails);
  return endPos;
}

function penaltyTaken(matchDetails, team, player) {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  player.action = `none`;
  matchDetails.iterationLog.push(`Penalty Taken by: ${player.name}`);
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  const shotPosition = [0, 0];
  const shotPower = common.calculatePower(player.skill.strength);
  const PlyPos = player.currentPOS;
  let thisTeamStats;
  if (common.isEven(matchDetails.half))
    thisTeamStats = matchDetails.kickOffTeamStatistics;
  else if (common.isOdd(matchDetails.half))
    thisTeamStats = matchDetails.secondTeamStatistics;
  else throw new Error(`You cannot supply 0 as a half`);
  common.debug('bm3', thisTeamStats.shots);
  common.debug('bm4', player.stats.shots);
  thisTeamStats.shots.total++;
  player.stats.shots.total++;
  if (player.skill.penalty_taking > common.getRandomNumber(0, 100)) {
    thisTeamStats.shots.on++;
    player.stats.shots.on++;
    shotPosition[0] = common.getRandomNumber(
      pitchWidth / 2 - 50,
      pitchWidth / 2 + 50,
    );
    matchDetails.iterationLog.push(
      `Shot On Target at X Position ${shotPosition[0]}`,
    );
  } else {
    thisTeamStats.shots.off++;
    player.stats.shots.off++;
    const left = common.getRandomNumber(0, 10) > 5;
    const leftPos = common.getRandomNumber(0, pitchWidth / 2 - 55);
    const righttPos = common.getRandomNumber(pitchWidth / 2 + 55, pitchWidth);
    shotPosition[0] = left ? leftPos : righttPos;
    matchDetails.iterationLog.push(
      `Shot Off Target at X Position ${shotPosition[0]}`,
    );
  }
  if (player.originPOS[1] > pitchHeight / 2)
    shotPosition[1] = PlyPos[1] - shotPower;
  else shotPosition[1] = PlyPos[1] + shotPower;
  const endPos = calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    shotPosition,
    player,
  );
  checkGoalScored(matchDetails);
  return endPos;
}

function checkGoalScored(matchDetails) {
  const { ball, half, kickOffTeam, secondTeam } = matchDetails;
  const [pitchWidth, pitchHeight, goalWidth] = matchDetails.pitchSize;
  const centreGoal = pitchWidth / 2;
  const goalEdge = goalWidth / 2;
  const goalX = common.isBetween(
    ball.position[0],
    centreGoal - goalEdge,
    centreGoal + goalEdge,
  );
  const KOGoalie = kickOffTeam.players[0];
  const STGoalie = secondTeam.players[0];
  const ballProx = 8;
  const [ballX, ballY] = ball.position;
  const nearKOGoalieX = common.isBetween(
    ballX,
    KOGoalie.currentPOS[0] - ballProx,
    KOGoalie.currentPOS[0] + ballProx,
  );
  const nearKOGoalieY = common.isBetween(
    ballY,
    KOGoalie.currentPOS[1] - ballProx,
    KOGoalie.currentPOS[1] + ballProx,
  );
  const nearSTGoalieX = common.isBetween(
    ballX,
    STGoalie.currentPOS[0] - ballProx,
    STGoalie.currentPOS[0] + ballProx,
  );
  const nearSTGoalieY = common.isBetween(
    ballY,
    STGoalie.currentPOS[1] - ballProx,
    STGoalie.currentPOS[1] + ballProx,
  );
  if (
    nearKOGoalieX &&
    nearKOGoalieY &&
    KOGoalie.skill.saving > common.getRandomNumber(0, 100)
  ) {
    matchDetails = setPositions.setGoalieHasBall(matchDetails, KOGoalie);
    if (
      common.inTopPenalty(matchDetails, ball.position) ||
      common.inBottomPenalty(matchDetails, ball.position)
    ) {
      matchDetails.iterationLog.push(
        `ball saved by ${KOGoalie.name} possesion to ${kickOffTeam.name}`,
      );
      KOGoalie.stats.saves++;
    }
  } else if (
    nearSTGoalieX &&
    nearSTGoalieY &&
    STGoalie.skill.saving > common.getRandomNumber(0, 100)
  ) {
    matchDetails = setPositions.setGoalieHasBall(matchDetails, STGoalie);
    if (
      common.inTopPenalty(matchDetails, ball.position) ||
      common.inBottomPenalty(matchDetails, ball.position)
    ) {
      matchDetails.iterationLog.push(
        `ball saved by ${STGoalie.name} possesion to ${secondTeam.name}`,
      );
      STGoalie.stats.saves++;
    }
  } else if (goalX) {
    if (ball.position[1] < 1) {
      if (half === 0) throw new Error('cannot set half as 0');
      else if (common.isOdd(half))
        matchDetails = setPositions.setSecondTeamGoalScored(matchDetails);
      else matchDetails = setPositions.setKickOffTeamGoalScored(matchDetails);
    } else if (ball.position[1] >= pitchHeight) {
      if (half === 0) throw new Error('cannot set half as 0');
      else if (common.isOdd(half))
        matchDetails = setPositions.setKickOffTeamGoalScored(matchDetails);
      else matchDetails = setPositions.setSecondTeamGoalScored(matchDetails);
    }
  }
}

function throughBall(matchDetails, team, player) {
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  const [, pitchHeight] = matchDetails.pitchSize;
  const { position } = matchDetails.ball;
  let closePlyPos = [0, 0];
  const playersInDistance = getPlayersInDistance(
    team,
    player,
    matchDetails.pitchSize,
  );
  const tPlyr =
    playersInDistance[common.getRandomNumber(0, playersInDistance.length - 1)];
  matchDetails.iterationLog.push(
    `through ball passed by: ${player.name} to: ${tPlyr.name}`,
  );
  player.stats.passes.total++;
  const bottomThird = position[1] > pitchHeight - pitchHeight / 3;
  const middleThird = !!(
    position[1] > pitchHeight / 3 && position[1] < pitchHeight - pitchHeight / 3
  );
  if (player.skill.passing > common.getRandomNumber(0, 100)) {
    if (player.originPOS[1] > pitchHeight / 2)
      closePlyPos = setTargetPlyPos(tPlyr.position, 0, 0, -20, -10);
    else closePlyPos = setTargetPlyPos(tPlyr.position, 0, 0, 10, 30);
  } else if (player.originPOS[1] > pitchHeight / 2) {
    if (bottomThird)
      closePlyPos = setTargetPlyPos(tPlyr.position, -10, 10, -10, 10);
    else if (middleThird)
      closePlyPos = setTargetPlyPos(tPlyr.position, -20, 20, -50, 50);
    else closePlyPos = setTargetPlyPos(tPlyr.position, -30, 30, -100, 100);
  } else if (bottomThird)
    closePlyPos = setTargetPlyPos(tPlyr.position, -30, 30, -100, 100);
  else if (middleThird)
    closePlyPos = setTargetPlyPos(tPlyr.position, -20, 20, -50, 50);
  else closePlyPos = setTargetPlyPos(tPlyr.position, -10, 10, -10, 10);
  return calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    closePlyPos,
    player,
  );
}

function getPlayersInDistance(team, player, pitchSize) {
  const [pitchWidth, pitchHeight] = pitchSize;
  const playersInDistance = [];
  for (const teamPlayer of team.players) {
    if (teamPlayer.name !== player.name) {
      const onPitchX = common.isBetween(
        teamPlayer.currentPOS[0],
        -1,
        pitchWidth + 1,
      );
      const onPitchY = common.isBetween(
        teamPlayer.currentPOS[1],
        -1,
        pitchHeight + 1,
      );
      if (onPitchX && onPitchY) {
        const playerToPlayerX = player.currentPOS[0] - teamPlayer.currentPOS[0];
        const playerToPlayerY = player.currentPOS[1] - teamPlayer.currentPOS[1];
        const proximityToBall = Math.abs(playerToPlayerX + playerToPlayerY);
        playersInDistance.push({
          position: teamPlayer.currentPOS,
          proximity: proximityToBall,
          name: teamPlayer.name,
        });
      }
    }
  }
  playersInDistance.sort(function (a, b) {
    return a.proximity - b.proximity;
  });
  return playersInDistance;
}

function resolveBallMovement(
  player,
  thisPOS,
  newPOS,
  power,
  team,
  opp,
  matchDetails,
) {
  common.removeBallFromAllPlayers(matchDetails);
  const lineToEndPosition = common.getBallTrajectory(thisPOS, newPOS, power);
  for (const thisPos of lineToEndPosition) {
    const checkPos = [
      common.round(thisPos[0], 0),
      common.round(thisPos[1], 0),
      thisPos[2],
    ];
    const playerInfo1 = setPositions.closestPlayerToPosition(
      player,
      team,
      checkPos,
    );
    const playerInfo2 = setPositions.closestPlayerToPosition(
      player,
      opp,
      checkPos,
    );
    const thisPlayerProx = Math.max(
      playerInfo1.proxToBall,
      playerInfo2.proxToBall,
    );
    const thisPlayer =
      thisPlayerProx === playerInfo1.proxToBall
        ? playerInfo1.thePlayer
        : playerInfo2.thePlayer;
    const thisTeam = thisPlayerProx === playerInfo1.proxToBall ? team : opp;
    if (thisPlayer)
      thisPlayerIsInProximity(
        matchDetails,
        thisPlayer,
        thisPOS,
        thisPos,
        power,
        thisTeam,
      );
  }
  const lastTeam = matchDetails.ball.lastTouch.teamID;
  matchDetails = setPositions.keepInBoundaries(matchDetails, lastTeam, newPOS);
  if (matchDetails.endIteration === true) return;
  const lastPOS = matchDetails.ballIntended || matchDetails.ball.position;
  delete matchDetails.ballIntended;
  return [common.round(lastPOS[0], 2), common.round(lastPOS[1], 2)];
}

function thisPlayerIsInProximity(
  matchDetails,
  thisPlayer,
  thisPOS,
  thisPos,
  power,
  thisTeam,
) {
  const checkPos = [
    common.round(thisPos[0], 0),
    common.round(thisPos[1], 0),
    thisPos[2],
  ];
  const isGoalie = thisPlayer.position === 'GK';
  const xPosProx = common.isBetween(
    thisPlayer.currentPOS[0],
    thisPos[0] - 3,
    thisPos[0] + 3,
  );
  const yPosProx = common.isBetween(
    thisPlayer.currentPOS[1],
    thisPos[1] - 3,
    thisPos[1] + 3,
  );
  const goaliexPosProx = common.isBetween(
    thisPlayer.currentPOS[0],
    thisPos[0] - 11,
    thisPos[0] + 11,
  );
  const goalieyPosProx = common.isBetween(
    thisPlayer.currentPOS[1],
    thisPos[1] - 2,
    thisPos[1] + 2,
  );
  if (isGoalie && goaliexPosProx && goalieyPosProx) {
    if (common.isBetween(checkPos[2], -1, thisPlayer.skill.jumping + 1)) {
      const saving = thisPlayer.skill.saving || '';
      if (saving && saving > common.getRandomNumber(0, power)) {
        setBallMovementMatchDetails(
          matchDetails,
          thisPlayer,
          thisPos,
          thisTeam,
        );
        matchDetails.iterationLog.push(`Ball saved`);
        thisPlayer.stats.saves++;
        return thisPos;
      }
    }
  } else if (xPosProx && yPosProx) {
    if (common.isBetween(checkPos[2], -1, thisPlayer.skill.jumping + 1)) {
      const deflectPos = thisPlayer.currentPOS;
      const newPOS = resolveDeflection(
        power,
        thisPOS,
        deflectPos,
        thisPlayer,
        thisTeam.name,
        matchDetails,
      );
      matchDetails.iterationLog.push(`Ball deflected`);
      return [common.round(newPOS[0], 2), common.round(newPOS[1], 2)];
    }
  }
}

function setBallMovementMatchDetails(
  matchDetails,
  thisPlayer,
  thisPos,
  thisTeam,
) {
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.Player = thisPlayer.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.lastTouch.playerName = thisPlayer.name;
  matchDetails.ball.lastTouch.playerID = thisPlayer.playerID;
  matchDetails.ball.lastTouch.teamID = thisTeam.teamID;
  matchDetails.ball.withTeam = thisTeam.teamID;
  const tempArray = thisPos;
  matchDetails.ball.position = tempArray.map((x) => x);
  thisPlayer.currentPOS = tempArray.map((x) => x);
}

function resolveDeflection(
  power,
  thisPOS,
  defPosition,
  defPlayer,
  defTeam,
  matchDetails,
) {
  const xMovement = (thisPOS[0] - defPosition[0]) ** 2;
  const yMovement = (thisPOS[1] - defPosition[1]) ** 2;
  const movementDistance = Math.sqrt(xMovement + yMovement);
  const newPower = power - movementDistance;
  let tempPosition = ['', ''];
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
  matchDetails = setPositions.keepInBoundaries(
    matchDetails,
    lastTeam.name,
    tempPosition,
  );
  const intended = matchDetails.ballIntended;
  const lastPOS = intended
    ? intended.map((x) => x)
    : matchDetails.ball.position.map((x) => x);
  delete matchDetails.ballIntended;
  return lastPOS;
}

function setDeflectionDirectionPos(direction, defPosition, newPower) {
  const tempPosition = [0, 0];
  if (
    direction === `east` ||
    direction === `northeast` ||
    direction === `southeast`
  ) {
    if (direction === `east`)
      tempPosition[1] = common.getRandomNumber(
        defPosition[1] - 3,
        defPosition[1] + 3,
      );
    tempPosition[0] = defPosition[0] - newPower / 2;
  } else if (
    direction === `west` ||
    direction === `northwest` ||
    direction === `southwest`
  ) {
    if (direction === `west`)
      tempPosition[1] = common.getRandomNumber(
        defPosition[1] - 3,
        defPosition[1] + 3,
      );
    tempPosition[0] = defPosition[0] + newPower / 2;
  }
  if (
    direction === `north` ||
    direction === `northeast` ||
    direction === `northwest`
  ) {
    if (direction === `north`)
      tempPosition[0] = common.getRandomNumber(
        defPosition[0] - 3,
        defPosition[0] + 3,
      );
    tempPosition[1] = defPosition[1] + newPower / 2;
  } else if (
    direction === `south` ||
    direction === `southeast` ||
    direction === `southwest`
  ) {
    if (direction === `south`)
      tempPosition[0] = common.getRandomNumber(
        defPosition[0] - 3,
        defPosition[0] + 3,
      );
    tempPosition[1] = defPosition[1] - newPower / 2;
  }
  if (direction === `wait`) {
    tempPosition[0] = common.getRandomNumber(-newPower / 2, newPower / 2);
    tempPosition[1] = common.getRandomNumber(-newPower / 2, newPower / 2);
  }
  return tempPosition;
}

function setDeflectionPlayerHasBall(matchDetails, defPlayer, defTeam) {
  defPlayer.hasBall = true;
  matchDetails.ball.lastTouch.playerName = defPlayer.name;
  matchDetails.ball.lastTouch.playerID = defPlayer.playerID;
  matchDetails.ball.lastTouch.teamID = defTeam.teamID;
  if (defPlayer.offside === true) {
    setDeflectionPlayerOffside(matchDetails, defTeam, defPlayer);
    return matchDetails.ball.position;
  }
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.Player = defPlayer.playerID;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = defTeam.teamID;
  const tempArray = defPlayer.currentPOS;
  matchDetails.ball.position = tempArray.map((x) => x);
}

function setDeflectionPlayerOffside(matchDetails, defTeam, defPlayer) {
  defPlayer.offside = false;
  defPlayer.hasBall = false;
  matchDetails.ball.Player = '';
  matchDetails.ball.withPlayer = false;
  matchDetails.ball.withTeam = '';
  matchDetails.iterationLog.push(
    `${defPlayer.name} is offside. Set piece given`,
  );
  if (defTeam.name === matchDetails.kickOffTeam.name)
    matchDetails = setPositions.setSetpieceSecondTeam(matchDetails);
  else matchDetails = setPositions.setSetpieceKickOffTeam(matchDetails);
}

function getBallDirection(matchDetails, nextPOS) {
  const thisPOS = matchDetails.ball.position;
  const movementX = thisPOS[0] - nextPOS[0];
  const movementY = thisPOS[1] - nextPOS[1];
  if (movementX === 0) {
    if (movementY === 0) matchDetails.ball.direction = `wait`;
    else if (movementY < 0) matchDetails.ball.direction = `south`;
    else if (movementY > 0) matchDetails.ball.direction = `north`;
  } else if (movementY === 0) {
    if (movementX < 0) matchDetails.ball.direction = `east`;
    else if (movementX > 0) matchDetails.ball.direction = `west`;
  } else if (movementX < 0 && movementY < 0)
    matchDetails.ball.direction = `southeast`;
  else if (movementX > 0 && movementY > 0)
    matchDetails.ball.direction = `northwest`;
  else if (movementX > 0 && movementY < 0)
    matchDetails.ball.direction = `southwest`;
  else if (movementX < 0 && movementY > 0)
    matchDetails.ball.direction = `northeast`;
}

function ballPassed(matchDetails, team, player) {
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  const [, pitchHeight] = matchDetails.pitchSize;
  const side = player.originPOS[1] > pitchHeight / 2 ? 'bottom' : 'top';
  const { position } = matchDetails.ball;
  let closePlyPos = [0, 0];
  const playersInDistance = getPlayersInDistance(
    team,
    player,
    matchDetails.pitchSize,
  );
  const tPlyr = getTargetPlayer(playersInDistance, side, pitchHeight);
  const bottomThird = position[1] > pitchHeight - pitchHeight / 3;
  const middleThird = !!(
    position[1] > pitchHeight / 3 && position[1] < pitchHeight - pitchHeight / 3
  );
  if (player.skill.passing > common.getRandomNumber(0, 100))
    closePlyPos = tPlyr.position;
  else if (player.originPOS[1] > pitchHeight / 2) {
    if (bottomThird)
      closePlyPos = setTargetPlyPos(tPlyr.position, -10, 10, -10, 10);
    else if (middleThird)
      closePlyPos = setTargetPlyPos(tPlyr.position, -50, 50, -50, 50);
    else closePlyPos = setTargetPlyPos(tPlyr.position, -100, 100, -100, 100);
  } else if (bottomThird)
    closePlyPos = setTargetPlyPos(tPlyr.position, -100, 100, -100, 100);
  else if (middleThird)
    closePlyPos = setTargetPlyPos(tPlyr.position, -50, 50, -50, 50);
  else closePlyPos = setTargetPlyPos(tPlyr.position, -10, 10, -10, 10);
  matchDetails.iterationLog.push(
    `ball passed by: ${player.name} to: ${tPlyr.name}`,
  );
  player.stats.passes.total++;
  return calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    closePlyPos,
    player,
  );
}

function setTargetPlyPos(tplyr, lowX, highX, lowY, highY) {
  const closePlyPos = [0, 0];
  const [targetPlayerXPos, targetPlayerYPos] = tplyr;
  closePlyPos[0] = common.round(
    targetPlayerXPos + common.getRandomNumber(lowX, highX),
    0,
  );
  closePlyPos[1] = common.round(
    targetPlayerYPos + common.getRandomNumber(lowY, highY),
    0,
  );
  return closePlyPos;
}

function getTargetPlayer(playersArray, side, pitchHeight) {
  let tempArray = [];
  for (const tempPlayer of playersArray) {
    if (tempPlayer.proximity < pitchHeight / 2) tempArray.push(tempPlayer);
  }
  if (tempArray.length === 0) tempArray = playersArray;
  let thisRand = common.getRandomNumber(0, tempArray.length - 1);
  let thisPlayer = tempArray[thisRand];
  if (thisRand > 5) thisRand = common.getRandomNumber(0, tempArray.length - 1);
  if (side === 'top' && tempArray[thisRand].proximity > thisPlayer.proximity) {
    thisPlayer = tempArray[thisRand];
  } else if (
    side === 'bottom' &&
    tempArray[thisRand].proximity < thisPlayer.proximity
  ) {
    thisPlayer = tempArray[thisRand];
  }
  if (thisRand > 5) thisRand = common.getRandomNumber(0, tempArray.length - 1);
  if (side === 'top' && tempArray[thisRand].proximity > thisPlayer.proximity) {
    thisPlayer = tempArray[thisRand];
  } else if (
    side === 'bottom' &&
    tempArray[thisRand].proximity < thisPlayer.proximity
  ) {
    thisPlayer = tempArray[thisRand];
  }
  return thisPlayer;
}

function ballCrossed(matchDetails, team, player) {
  matchDetails.ball.lastTouch.playerName = player.name;
  matchDetails.ball.lastTouch.playerID = player.playerID;
  matchDetails.ball.lastTouch.teamID = team.teamID;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const ballIntended = [];
  if (player.originPOS[1] > pitchHeight / 2) {
    ballIntended[1] = common.getRandomNumber(0, pitchHeight / 5);
    if (player.currentPOS[0] < pitchWidth / 2)
      ballIntended[0] = common.getRandomNumber(pitchWidth / 3, pitchWidth);
    else
      ballIntended[0] = common.getRandomNumber(0, pitchWidth - pitchWidth / 3);
  } else {
    ballIntended[1] = common.getRandomNumber(
      pitchHeight - pitchHeight / 5,
      pitchHeight,
    );
    if (player.currentPOS[0] < pitchWidth / 2)
      ballIntended[0] = common.getRandomNumber(pitchWidth / 3, pitchWidth);
    else
      ballIntended[0] = common.getRandomNumber(0, pitchWidth - pitchWidth / 3);
  }
  matchDetails.iterationLog.push(`ball crossed by: ${player.name}`);
  player.stats.passes.total++;
  return calcBallMovementOverTime(
    matchDetails,
    player.skill.strength,
    ballIntended,
    player,
  );
}

function calcBallMovementOverTime(
  matchDetails,
  strength,
  nextPosition,
  player,
) {
  const { kickOffTeam, secondTeam } = matchDetails;
  const { position } = matchDetails.ball;
  const power = common.calculatePower(strength);
  const changeInX = nextPosition[0] - position[0];
  const changeInY = nextPosition[1] - position[1];
  const totalChange = Math.max(Math.abs(changeInX), Math.abs(changeInY));
  let movementIterations = common.round(
    totalChange / common.getRandomNumber(2, 3),
    0,
  );
  if (movementIterations < 1) movementIterations = 1;
  const powerArray = splitNumberIntoN(power, movementIterations);
  const xArray = splitNumberIntoN(changeInX, movementIterations);
  const yArray = splitNumberIntoN(changeInY, movementIterations);
  const BOIts = mergeArrays(
    powerArray.length,
    position,
    nextPosition,
    xArray,
    yArray,
    powerArray,
  );
  matchDetails.ball.ballOverIterations = BOIts;
  const endPos = resolveBallMovement(
    player,
    position,
    BOIts[0],
    power,
    kickOffTeam,
    secondTeam,
    matchDetails,
  );
  if (matchDetails.endIteration === true) return matchDetails;
  matchDetails.ball.ballOverIterations.shift();
  matchDetails.iterationLog.push(`resolving ball movement`);
  return endPos;
}

function splitNumberIntoN(number, n) {
  const arrayN = Array.from(Array(n).keys());
  const splitNumber = [];
  for (const thisn of arrayN) {
    const nextNum = common.aTimesbDividedByC(n - thisn, number, n);
    if (nextNum === 0) splitNumber.push(1);
    else splitNumber.push(common.round(nextNum, 0));
  }
  return splitNumber;
}

function mergeArrays(arrayLength, oldPos, newPos, array1, array2, array3) {
  let tempPos = [oldPos[0], oldPos[1]];
  const arrayN = Array.from(Array(arrayLength - 1).keys());
  const newArray = [];
  for (const thisn of arrayN) {
    newArray.push([
      tempPos[0] + array1[thisn],
      tempPos[1] + array2[thisn],
      array3[thisn],
    ]);
    tempPos = [tempPos[0] + array1[thisn], tempPos[1] + array2[thisn]];
  }
  newArray.push([newPos[0], newPos[1], array3[array3.length - 1]]);
  return newArray;
}

module.exports = {
  ballKicked,
  shotMade,
  penaltyTaken,
  throughBall,
  resolveBallMovement,
  resolveDeflection,
  getBallDirection,
  ballPassed,
  ballCrossed,
  moveBall,
  mergeArrays,
  splitNumberIntoN,
  calcBallMovementOverTime,
  setDeflectionDirectionPos,
  setDeflectionPlayerOffside,
  getTargetPlayer,
  setDeflectionPlayerHasBall,
  setBallMovementMatchDetails,
  thisPlayerIsInProximity,
  setTargetPlyPos,
  setBPlayer,
  checkGoalScored,
  getTopKickedPosition,
  getBottomKickedPosition,
};
