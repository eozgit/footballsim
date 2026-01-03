import { Team } from '../../lib/types.js';

import { readFile } from '../../lib/fileReader.js';
import * as setVariables from '../../lib/setVariables.js';

async function setTeam(teamLocation: string) {
  const team = await readFile(teamLocation).catch(function (err) {
    throw err.stack;
  });
  return setVariables.setGameVariables(team as Team);
}

export default {
  setTeam,
};
