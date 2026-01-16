import * as setBottomFreekicks from '../../lib/setBottomFreekicks.js';
import * as setTopFreekicks from '../../lib/setTopFreekicks.js';
import type { MatchDetails } from '../../lib/types.js';

import { readMatchDetails } from './utils.js';

async function setTopFreekick(
  iterationFile: string,
  ballPosition: [number, number, number?],
): Promise<MatchDetails> {
  const matchDetails = await readMatchDetails(iterationFile);

  matchDetails.ball.position = [...ballPosition];

  return setTopFreekicks.setTopFreekick(matchDetails);
}

async function setBottomFreekick(
  iterationFile: string,
  ballPosition: [number, number, number?],
): Promise<MatchDetails> {
  const matchDetails = await readMatchDetails(iterationFile);

  matchDetails.ball.position = [...ballPosition];

  return setBottomFreekicks.setBottomFreekick(matchDetails);
}

export default {
  setTopFreekick,
  setBottomFreekick,
};
