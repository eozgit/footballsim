import * as fs from 'fs';

/**
 * Reads a JSON file and parses its content.
 * @template T - The expected shape of the JSON data.
 */
function readFile<T>(filePath: string): Promise<T> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        // Ensure the error is passed directly or wrapped
        reject(err instanceof Error ? err : new Error(String(err)));
      } else {
        try {
          // 1. Cast to unknown first to satisfy no-unsafe-assignment
          // 2. Then cast to T as the 'contract' for the file reader
          const json = JSON.parse(data) as unknown as T;

          resolve(json);
        } catch (parseError) {
          // Ensure rejection reason is an Error instance
          reject(parseError instanceof Error ? parseError : new Error(String(parseError)));
        }
      }
    });
  });
}

export { readFile };
