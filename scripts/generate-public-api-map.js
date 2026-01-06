import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const graph = [];

// 1. Analyze every source file
project.getSourceFiles().forEach((sourceFile) => {
  const filePath = sourceFile.getFilePath();

  // 2. Find all exported functions
  const exportedFunctions = sourceFile.getExportedDeclarations();

  exportedFunctions.forEach((declarations, name) => {
    declarations.forEach((decl) => {
      // We only care about functions for this "notch down" approach
      if (
        decl.getKind() === SyntaxKind.FunctionDeclaration ||
        decl.getKind() === SyntaxKind.ArrowFunction
      ) {
        // 3. Find where this specific function is referenced
        const referencedSymbols = decl.findReferences();
        const importers = [];

        referencedSymbols.forEach((refSymbol) => {
          refSymbol.getReferences().forEach((ref) => {
            const refFilePath = ref.getSourceFile().getFilePath();

            // Only count it as an "import" if it's in a different file
            if (refFilePath !== filePath && !ref.isDefinition()) {
              importers.push(refFilePath);
            }
          });
        });

        graph.push({
          functionName: name,
          definedIn: filePath,
          importedBy: [...new Set(importers)], // De-duplicate
          usageCount: importers.length,
        });
      }
    });
  });
});

console.log(JSON.stringify(graph, null, 2));
