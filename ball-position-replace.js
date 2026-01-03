import fs from 'fs';
import { globSync } from 'glob'; // You may need to npm install glob

const files = globSync('src/**/*.ts');

// Matches [number, number, number?] with flexible whitespace
const targetRegex = /:\s*\[\s*number\s*,\s*number\s*,\s*number\?\s*\]/g;

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  if (targetRegex.test(content)) {
    const updatedContent = content.replace(targetRegex, ': BallPosition');
    fs.writeFileSync(file, updatedContent, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
