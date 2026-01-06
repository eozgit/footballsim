import * as fs from 'fs';

/**
 * Reads a JSON file and parses its content.
 * @template T - The expected shape of the JSON data.
 */
function readFile<T>(filePath: string): Promise<T> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          // data is a string because of the 'utf8' encoding
          const json: T = JSON.parse(data);
          resolve(json);
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}

export { readFile };
