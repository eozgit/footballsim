import { readFile } from '../../lib/fileReader.js';
import setVariables from '../../lib/setVariables';
import common from '../../lib/common';

async function setTeam(teamLocation) {
  const team = await readFile(teamLocation).catch(function (err) {
    throw err.stack;
  });
  const teamReady = setVariables.setGameVariables(team);
  return teamReady;
}

export default {
  setTeam,
};
