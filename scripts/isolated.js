import { Project, SyntaxKind } from 'ts-morph';
import path from 'path';

/**
 * CONFIGURATION
 */
const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths('src/**/*.ts');

const isolationReport = [];

/**
 * PHASE 1: IDENTIFY ISOLATED FUNCTIONS
 */
project.getSourceFiles().forEach((sourceFile) => {
  const filePath = path.relative(process.cwd(), sourceFile.getFilePath());
  const functions = sourceFile.getFunctions();

  // Map of all function names in this specific file
  const localFnNames = new Set(functions.map((f) => f.getName()));

  functions.forEach((fn) => {
    const fnName = fn.getName();
    if (!fnName) return;

    // 1. Check if this function calls any OTHER function in the same file
    const callsLocal = fn.getDescendantsOfKind(SyntaxKind.CallExpression).some((call) => {
      const name = call.getExpression().getText();
      return localFnNames.has(name) && name !== fnName;
    });

    // 2. Check if any OTHER function in the same file calls this function
    const isCalledLocally = functions.some((otherFn) => {
      if (otherFn === fn) return false;
      return otherFn.getDescendantsOfKind(SyntaxKind.CallExpression).some((call) => {
        return call.getExpression().getText() === fnName;
      });
    });

    // An "Isolated" function neither calls nor is called by its neighbors
    if (!callsLocal && !isCalledLocally) {
      isolationReport.push({
        name: fnName,
        currentFile: filePath,
        lineCount: fn.getEndLineNumber() - fn.getStartLineNumber(),
        mostNeededIn: determinePrimaryConsumer(fnName, filePath),
      });
    }
  });
});

/**
 * PHASE 2: DETERMINE EXTERNAL CONSUMPTION (The "Most Needed In" logic)
 * Uses cross-file references to find which file calls this function the most.
 */
function determinePrimaryConsumer(fnName, sourcePath) {
  const consumers = {};

  project.getSourceFiles().forEach((file) => {
    const filePath = path.relative(process.cwd(), file.getFilePath());
    if (filePath === sourcePath) return;

    const callCount = file
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((c) => c.getExpression().getText().includes(fnName)).length;

    if (callCount > 0) consumers[filePath] = callCount;
  });

  const topConsumer = Object.entries(consumers).sort((a, b) => b[1] - a[1])[0];
  return topConsumer ? topConsumer[0] : 'Utility/Standalone';
}

/**
 * OUTPUT
 */
console.log('Isolated Functions (No local dependencies/dependents):');
console.table(isolationReport);
