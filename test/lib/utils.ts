import { readFile } from '../../lib/fileReader.js';
import { MatchDetails } from '../../lib/types.js';

export async function readMatchDetails(path: string): Promise<MatchDetails> {
  try {
    const data = await readFile(path);
    return data as MatchDetails;
  } catch (err: any) {
    throw err.stack;
  }
}
