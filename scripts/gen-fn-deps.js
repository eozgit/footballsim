import { Project, SyntaxKind, Node } from 'ts-morph';
import path from 'path';

/**
 * --- CONFIGURATION ---
 */
const args = process.argv.slice(2);
const formatArg = args.find((arg) => arg.startsWith('--format='));
const format = formatArg ? formatArg.split('=')[1] : 'text'; // Default to text

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths('src/**/*.ts');

const functionData = [];

/**
 * PHASE 1: COLLECT ALL FUNCTIONS
 */
project.getSourceFiles().forEach((sourceFile) => {
  const filePath = path.relative(process.cwd(), sourceFile.getFilePath());

  // Detect standard functions and variable-based arrow functions
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

  allFunctions.forEach((fnNode) => {
    let name;
    let nodeToAnalyze;

    if (Node.isVariableDeclaration(fnNode)) {
      name = fnNode.getName();
      nodeToAnalyze = fnNode.getInitializer();
    } else {
      name = fnNode.getName() || '<anonymous>';
      nodeToAnalyze = fnNode;
    }

    const start = fnNode.getStartLineNumber();
    const end = fnNode.getEndLineNumber();

    functionData.push({
      name,
      file: filePath,
      lineCount: end - start + 1,
      internalCalls: new Set(),
      node: nodeToAnalyze,
    });
  });
});

/**
 * PHASE 2: TRACK SAME-FILE DEPENDENCIES
 */
functionData.forEach((data) => {
  // Get all call expressions within the function body
  data.node.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
    const symbol = call.getExpression().getSymbol();
    if (symbol) {
      const declarations = symbol.getDeclarations();
      declarations.forEach((decl) => {
        const declFile = path.relative(process.cwd(), decl.getSourceFile().getFilePath());

        // Filter: only include calls to functions within the same file
        if (declFile === data.file) {
          const declName = symbol.getName();
          if (declName !== data.name) {
            data.internalCalls.add(declName);
          }
        }
      });
    }
  });
});

/**
 * PHASE 3: OUTPUT
 */
const output = functionData.map(({ name, file, lineCount, internalCalls }) => ({
  function: name,
  file,
  lineCount,
  callsInFile: Array.from(internalCalls),
}));

if (format === 'json') {
  console.log(JSON.stringify(output, null, 2));
} else {
  // Table View
  console.log(''.padEnd(120, '-'));
  console.log(
    `${'Function'.padEnd(30)} | ${'Lines'.padEnd(6)} | ${'File'.padEnd(30)} | ${'Internal Calls'}`,
  );
  console.log(''.padEnd(120, '-'));

  output
    .sort((a, b) => b.lineCount - a.lineCount)
    .forEach((item) => {
      console.log(
        `${item.function.padEnd(30)} | ` +
          `${String(item.lineCount).padEnd(6)} | ` +
          `${item.file.padEnd(30)} | ` +
          `${item.callsInFile.join(', ')}`,
      );
    });
}
