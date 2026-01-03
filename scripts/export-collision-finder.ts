import { Project } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths('src/**/*.ts');

const exportMap = new Map<string, string[]>();

console.log('=== EXPORT COLLISION CHECK ===\n');

project.getSourceFiles().forEach((sourceFile) => {
  // Get all named exports
  const exportedDeclarations = sourceFile.getExportedDeclarations();

  exportedDeclarations.forEach((declarations, name) => {
    if (name === 'default') return;

    declarations.forEach((decl) => {
      // Check if the declaration is actually defined in THIS file
      // If it's a re-export, ts-morph can tell you the original source
      const isReExport =
        decl.getSourceFile().getFilePath() !== sourceFile.getFilePath();

      if (isReExport) {
        // Logic: If it's a re-export in engine.ts, it's NOT a conflict
        return;
      }

      if (!exportMap.has(name)) exportMap.set(name, []);
      exportMap.get(name)?.push(sourceFile.getBaseName());
    });
  });
});

// Identify and print conflicts
let conflictCount = 0;
exportMap.forEach((files, exportName) => {
  if (files.length > 1) {
    conflictCount++;
    console.warn(`[CONFLICT] "${exportName}" is exported from multiple files:`);
    files.forEach((file) => console.log(`  - ${file}`));
    console.log('');
  }
});

if (conflictCount === 0) {
  console.log('✅ No naming conflicts found in exports!');
} else {
  console.log(`❌ Found ${conflictCount} naming conflicts.`);
}
