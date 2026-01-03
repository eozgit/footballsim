import { Project } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths('src/**/*.ts');

const symbolMap = new Map<string, string[]>();

console.log('=== GLOBAL SYMBOL COLLISION CHECK ===\n');

project.getSourceFiles().forEach((sourceFile) => {
  const fileName = sourceFile.getBaseName();

  // 1. Collect all Top-Level Declarations (Internal + Exported)
  const declarations = [
    ...sourceFile.getFunctions(),
    ...sourceFile.getClasses(),
    ...sourceFile.getVariableDeclarations(),
    ...sourceFile.getInterfaces(),
    ...sourceFile.getEnums(),
    ...sourceFile.getTypeAliases(),
  ];

  declarations.forEach((decl) => {
    const name = decl.getName();
    if (!name) {
      return;
    }

    // Check if this specific node is a re-export (to avoid false positives in engine.ts)
    // We only care about things actually DEFINED in this file
    if (!symbolMap.has(name)) {
      symbolMap.set(name, []);
    }

    const currentFiles = symbolMap.get(name)!;
    if (!currentFiles.includes(fileName)) {
      currentFiles.push(fileName);
    }
  });
});

// Identify and print conflicts
let conflictCount = 0;
symbolMap.forEach((files, symbolName) => {
  if (files.length > 1) {
    conflictCount++;
    console.warn(
      `[CONFLICT] "${symbolName}" is declared in ${files.length} files:`,
    );
    files.forEach((file) => console.log(`  - ${file}`));
    console.log('');
  }
});

if (conflictCount === 0) {
  console.log('✅ No naming conflicts found across all symbols!');
} else {
  console.log(`❌ Found ${conflictCount} naming conflicts.`);
}
