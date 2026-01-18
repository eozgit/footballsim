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
 * PHASE 1: COLLECT ALL FUNCTIONS & FILE METRICS
 */
project.getSourceFiles().forEach((sourceFile) => {
  const filePath = path.relative(process.cwd(), sourceFile.getFilePath());
  const fileTotalLines = sourceFile.getEndLineNumber();

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
      fileTotalLines,
      internalCalls: new Set(), // What this function calls
      calledByCount: 0, // How many times this is called in-file
      node: nodeToAnalyze,
    });
  });
});

/**
 * PHASE 2: TRACK SAME-FILE DEPENDENCIES & USAGE
 */
functionData.forEach((data) => {
  data.node.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
    const symbol = call.getExpression().getSymbol();
    if (symbol) {
      const declarations = symbol.getDeclarations();
      declarations.forEach((decl) => {
        const declFile = path.relative(process.cwd(), decl.getSourceFile().getFilePath());

        // Filter: only interested in relationships within the same file
        if (declFile === data.file) {
          const declName = symbol.getName();
          if (declName !== data.name) {
            data.internalCalls.add(declName);

            // Increment the 'calledByCount' for the target function
            const targetFn = functionData.find((f) => f.name === declName && f.file === data.file);
            if (targetFn) targetFn.calledByCount++;
          }
        }
      });
    }
  });
});

/**
 * PHASE 3: REFACTOR PRIORITY CALCULATION
 */
const processedOutput = functionData.map((d) => {
  const isCalledInFile = d.calledByCount > 0;

  // SMARTER WEIGHTED SORT:
  // We want functions in bloated files (>300) to bubble up.
  // We want functions that are EASY to move (isCalledInFile = false) to bubble up.
  // We want functions that have NO internal dependencies to bubble up.
  const fileBloatFactor = Math.max(1, d.fileTotalLines / 300);
  const extractionEase = isCalledInFile ? 1 : 10; // 10x priority for "loose" functions
  const dependencyPenalty = d.internalCalls.size + 1;

  const refactorScore = (d.lineCount * fileBloatFactor * extractionEase) / dependencyPenalty;

  return {
    function: d.name,
    file: d.file,
    lineCount: d.lineCount,
    fileLines: d.fileTotalLines,
    callCount: d.internalCalls.size,
    isCalledInFile,
    callsInFile: Array.from(d.internalCalls),
    refactorScore,
  };
});

// Sort by Refactor Score (Descending)
processedOutput.sort((a, b) => b.refactorScore - a.refactorScore);

const finalOutput = processedOutput.slice(0, limit);

/**
 * PHASE 4: OUTPUT
 */
if (format === 'json') {
  console.log(JSON.stringify(finalOutput, null, 2));
} else {
  console.log(''.padEnd(155, '-'));
  console.log(
    `${'Function'.padEnd(30)} | ${'Lines'.padEnd(6)} | ${'File (T)'.padEnd(10)} | ${'Local?'.padEnd(6)} | ${'Deps'.padEnd(5)} | ${'File'.padEnd(30)} | ${'Internal Dependency Names'}`,
  );
  console.log(''.padEnd(155, '-'));

  finalOutput.forEach((item) => {
    const localFlag = item.isCalledInFile ? 'YES' : '--';
    const fileLabel = `${item.fileLines}`.padEnd(10);

    console.log(
      `${item.function.padEnd(30)} | ` +
        `${String(item.lineCount).padEnd(6)} | ` +
        `${fileLabel} | ` +
        `${localFlag.padEnd(6)} | ` +
        `${String(item.callCount).padEnd(5)} | ` +
        `${item.file.padEnd(30)} | ` +
        `${item.callsInFile.join(', ')}`,
    );
  });

  if (processedOutput.length > limit) {
    console.log(''.padEnd(155, '-'));
    console.log(
      `... shown ${limit} of ${processedOutput.length} functions. Use --limit=all to see all.`,
    );
  }
}
