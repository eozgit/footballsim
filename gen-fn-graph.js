import { Project, SyntaxKind } from 'ts-morph';

// --- CONFIGURATION SWITCH ---
const CONFIG = {
  sanitizeIds: false, // Set to false to disable sanitization
  filterCoreLibs: true, // Set to false to include standard libraries
};

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const sourceFiles = project.getSourceFiles('src/**/*.ts');
const functionMap = new Map();

console.log(
  `Analyzing internal dependencies (Sanitization: ${CONFIG.sanitizeIds ? 'ON' : 'OFF'})...`,
);

sourceFiles.forEach((sourceFile) => {
  const fileName = sourceFile.getBaseName();

  sourceFile.getFunctions().forEach((fn) => {
    const fnName = fn.getName();
    if (!fnName) return;

    const fullFnName = `${fileName}:${fnName}`;
    if (!functionMap.has(fullFnName)) {
      functionMap.set(fullFnName, new Set());
    }

    fn.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
      const symbol = call.getExpression().getSymbol();

      if (symbol) {
        const declarations = symbol.getDeclarations();
        declarations.forEach((decl) => {
          const declSourceFile = decl.getSourceFile();
          const declFilePath = declSourceFile.getFilePath();

          // Apply core library filter based on config
          const isInternal =
            declFilePath.includes('/lib/') && !declFilePath.endsWith('.d.ts');

          if (!CONFIG.filterCoreLibs || isInternal) {
            const declName = symbol.getName();
            const declFileName = declSourceFile.getBaseName();
            functionMap.get(fullFnName).add(`${declFileName}:${declName}`);
          }
        });
      }
    });
  });
});

// Generate Mermaid Output
console.log('\nflowchart TD');

functionMap.forEach((dependencies, fn) => {
  // Use the switch to determine the ID format
  const fnId = CONFIG.sanitizeIds ? fn.replace(/[:.]/g, '_') : `"${fn}"`;

  dependencies.forEach((dep) => {
    const depId = CONFIG.sanitizeIds ? dep.replace(/[:.]/g, '_') : `"${dep}"`;

    // In Mermaid, ID["Label"] is the safest way to handle special characters in labels
    console.log(`  ${fnId}["${fn}"] --> ${depId}["${dep}"]`);
  });
});
