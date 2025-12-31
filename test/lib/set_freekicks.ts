import { MatchDetails } from 'lib/types.ts';
import setFreekick from '../../lib/setFreekicks.js';
import { readMatchDetails } from './utils.ts';

async function setTopFreekick(
  iterationFile: string,
  ballPosition: number[],
): Promise<MatchDetails> {
  const matchDetails = await readMatchDetails(iterationFile);

  // No more @ts-expect-error needed here
  matchDetails.ball.position = [...ballPosition];

  return setFreekick.setTopFreekick(matchDetails);
}

async function setBottomFreekick(
  iterationFile: string,
  ballPosition: number[],
): Promise<MatchDetails> {
  const matchDetails = await readMatchDetails(iterationFile);

  matchDetails.ball.position = [...ballPosition];

  return setFreekick.setBottomFreekick(matchDetails);
}

export default {
  setTopFreekick,
  setBottomFreekick,
};
