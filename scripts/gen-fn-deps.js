import { Project, SyntaxKind, Node } from 'ts-morph';
import path from 'path';

/**
 * --- CONFIGURATION & ARGUMENTS ---
 */
const args = process.argv.slice(2);

// Format Switch: --format=json or --format=text (default)
const formatArg = args.find((arg) => arg.startsWith('--format='));
const format = formatArg ? formatArg.split('=')[1] : 'text';

// Limit Switch: --limit=number or --limit=all (default: 20)
const limitArg = args.find((arg) => arg.startsWith('--limit='));
let limit = 20;
if (limitArg) {
  const val = limitArg.split('=')[1];
  limit = val === 'all' ? Number.MAX_SAFE_INTEGER : parseInt(val, 10);
}

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths('src/**/*.ts');

const functionData = [];

/**
 * PHASE 1: COLLECT ALL FUNCTIONS
 */
project.getSourceFiles().forEach((sourceFile) => {
  const filePath = path.relative(process.cwd(), sourceFile.getFilePath());

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
  data.node.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
    const symbol = call.getExpression().getSymbol();
    if (symbol) {
      const declarations = symbol.getDeclarations();
      declarations.forEach((decl) => {
        const declFile = path.relative(process.cwd(), decl.getSourceFile().getFilePath());
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
 * PHASE 3: WEIGHTED SORTING & OUTPUT
 * Sort Priority:
 * 1. Internal Call Count (Ascending) - Find functions that don't depend on much
 * 2. Line Count (Descending) - Find the biggest ones among those
 */
const processedOutput = functionData.map(({ name, file, lineCount, internalCalls }) => ({
  function: name,
  file,
  lineCount,
  callCount: internalCalls.size,
  callsInFile: Array.from(internalCalls),
}));

processedOutput.sort((a, b) => {
  if (a.callCount !== b.callCount) {
    return a.callCount - b.callCount; // Lower call count first
  }
  return b.lineCount - a.lineCount; // Then higher line count
});

const finalOutput = processedOutput.slice(0, limit);

if (format === 'json') {
  console.log(JSON.stringify(finalOutput, null, 2));
} else {
  console.log(''.padEnd(140, '-'));
  console.log(
    `${'Function'.padEnd(30)} | ${'Lines'.padEnd(6)} | ${'Calls'.padEnd(5)} | ${'File'.padEnd(30)} | ${'Internal Dependency Names'}`
  );
  console.log(''.padEnd(140, '-'));

  finalOutput.forEach((item) => {
    console.log(
      `${item.function.padEnd(30)} | ` +
      `${String(item.lineCount).padEnd(6)} | ` +
      `${String(item.callCount).padEnd(5)} | ` +
      `${item.file.padEnd(30)} | ` +
      `${item.callsInFile.join(', ')}`
    );
  });

  if (processedOutput.length > limit) {
    console.log(''.padEnd(140, '-'));
    console.log(`... shown ${limit} of ${processedOutput.length} functions. Use --limit=all to see all.`);
  }
}
