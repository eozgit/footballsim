import { readFile } from '../../lib/fileReader.js';
import { MatchDetails, Player } from '../../lib/types.js';

/**
 * Helper to handle the boilerplate of reading and casting JSON files
 */
async function readJson<T>(path: string): Promise<T> {
  try {
    const data = await readFile(path);
    return data as T;
  } catch (err: any) {
    // Providing a cleaner error message including the path
    throw new Error(`Failed to read JSON at ${path}: ${err.message || err}`);
  }
}

export async function readMatchDetails(path: string): Promise<MatchDetails> {
  return readJson<MatchDetails>(path);
}

export async function readPlayer(path: string): Promise<Player> {
  return readJson<Player>(path);
}
