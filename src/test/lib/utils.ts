import { readFile } from '../../lib/fileReader.js';
import { MatchDetails, Player } from '../../lib/types.js';

/**
 * Helper to handle the boilerplate of reading and casting JSON files
 */
async function readJson<T>(path: string): Promise<T> {
  return (await readFile(path)) as T;
}

export async function readMatchDetails(path: string): Promise<MatchDetails> {
  return readJson<MatchDetails>(path);
}

export async function readPlayer(path: string): Promise<Player> {
  return readJson<Player>(path);
}
