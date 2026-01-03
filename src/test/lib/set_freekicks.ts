import { MatchDetails } from '../../lib/types.js';

import setFreekick from '../../lib/setFreekicks.js';

import { readMatchDetails } from './utils.js';

async function setTopFreekick(
  iterationFile: string,
  ballPosition: [number, number, number?],
): Promise<MatchDetails> {
  const matchDetails = await readMatchDetails(iterationFile);

  matchDetails.ball.position = [...ballPosition];

  return setFreekick.setTopFreekick(matchDetails);
}

async function setBottomFreekick(
  iterationFile: string,
  ballPosition: [number, number, number?],
): Promise<MatchDetails> {
  const matchDetails = await readMatchDetails(iterationFile);

  matchDetails.ball.position = [...ballPosition];

  return setFreekick.setBottomFreekick(matchDetails);
}

export default {
  setTopFreekick,
  setBottomFreekick,
};
