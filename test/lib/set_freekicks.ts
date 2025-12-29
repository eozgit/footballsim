import { readFile } from '../../lib/fileReader.js';
import setFreekick from '../../lib/setFreekicks.js';

async function setTopFreekick(iterationFile, ballPosition) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  matchDetails.ball.position = ballPosition.map((x) => x);
  return setFreekick.setTopFreekick(matchDetails);
}
async function setBottomFreekick(iterationFile, ballPosition) {
  const matchDetails = await readFile(iterationFile).catch(function (err) {
    throw err.stack;
  });
  matchDetails.ball.position = ballPosition.map((x) => x);
  return setFreekick.setBottomFreekick(matchDetails);
}

export default {
  setTopFreekick,
  setBottomFreekick,
};
