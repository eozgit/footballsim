import { readFile } from '../../lib/fileReader.js';
import * as setVariables from '../../lib/setVariables.js';
import type { Team } from '../../lib/types.js';

async function setTeam(teamLocation: string): Promise<Team> {
  const team = (await readFile(teamLocation).catch(function (err) {
    throw err.stack;
  })) as Team;
  return setVariables.setGameVariables(team);
}

export default {
  setTeam,
};
