import { Project, SyntaxKind, Node } from 'ts-morph';
import path from 'path';

// --- CONFIGURATION ---
const SOURCE_PATH = 'src/**/*.ts'; // Adjust to your source directory
const TS_CONFIG = 'tsconfig.json';

const project = new Project({ tsConfigFilePath: TS_CONFIG });
project.addSourceFilesAtPaths(SOURCE_PATH);

const functionStats = [];

/**
 * Iterates through all source files to extract function length data.
 */
project.getSourceFiles().forEach((sourceFile) => {
  const filePath = path.relative(process.cwd(), sourceFile.getFilePath());
  const fileTotalLines = sourceFile.getEndLineNumber();

  // Find all functions and variable-based arrow functions/expressions
  const allFunctions = [
    ...sourceFile.getFunctions(),
    ...sourceFile
      .getVariableDeclarations()
      .filter(
        (v) =>
          v.getInitializerIfKind(SyntaxKind.ArrowFunction) ||
          v.getInitializerIfKind(SyntaxKind.FunctionExpression),
      ),
  ];

  allFunctions.forEach((fn) => {
    let name;
    if (Node.isVariableDeclaration(fn)) {
      name = fn.getName();
    } else {
      name = fn.getName() || '<anonymous>';
    }

    const startLine = fn.getStartLineNumber();
    const endLine = fn.getEndLineNumber();
    const lineCount = endLine - startLine + 1;

    functionStats.push({
      name,
      file: filePath,
      lineCount,
      fileTotalLines,
    });
  });
});

// Sort by function line count descending
functionStats.sort((a, b) => b.lineCount - a.lineCount);

/**
 * --- OUTPUT REPORT ---
 */
console.log(''.padEnd(100, '-'));
console.log(
  `${'Function Name'.padEnd(35)} | ${'Lines'.padEnd(8)} | ${'File Total'.padEnd(12)} | ${'File Location'}`,
);
console.log(''.padEnd(100, '-'));

// Show top 20 or adjust as needed
functionStats.slice(0, 20).forEach((stat) => {
  console.log(
    `${stat.name.padEnd(35)} | ` +
      `${String(stat.lineCount).padEnd(8)} | ` +
      `${String(stat.fileTotalLines).padEnd(12)} | ` +
      `${stat.file}`,
  );
});

console.log(''.padEnd(100, '-'));
