import { readFile } from '../../lib/fileReader.js';
import setFreekick from '../../lib/setFreekicks.js';

async function setTopFreekick(iterationFile: any, ballPosition: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  matchDetails.ball.position = ballPosition.map((x: any) => x);
  return setFreekick.setTopFreekick(matchDetails);
}
async function setBottomFreekick(iterationFile: any, ballPosition: any) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  matchDetails.ball.position = ballPosition.map((x: any) => x);
  return setFreekick.setBottomFreekick(matchDetails);
}

export default {
  setTopFreekick,
  setBottomFreekick,
};
