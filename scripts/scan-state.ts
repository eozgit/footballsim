import { Project, Node, SyntaxKind } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

project.addSourceFilesAtPaths('src/**/*.ts');

console.log('=== SCANNING FOR EXPORTED MUTABLE STATE ===\n');

let dangerCount = 0;

project.getSourceFiles().forEach((sourceFile) => {
  const fileName = sourceFile.getBaseName();

  // 1. Check for inline exports: export let x = 1;
  sourceFile.getVariableStatements().forEach((statement) => {
    if (statement.isExported()) {
      const declarationKind = statement.getDeclarationKind();
      if (declarationKind !== 'const') {
        statement.getDeclarations().forEach((decl) => {
          console.warn(
            `[DANGER] ${fileName}: Inline mutable export -> ${declarationKind} ${decl.getName()}`,
          );
          dangerCount++;
        });
      }
    }
  });

  // 2. Check for block exports: let x = 1; export { x };
  sourceFile.getExportDeclarations().forEach((exportDecl) => {
    exportDecl.getNamedExports().forEach((namedExport) => {
      const name = namedExport.getName();

      // Look for the local declaration of this name in the same file
      const localDeclaration = sourceFile.getVariableDeclaration(name);

      if (localDeclaration) {
        const statement = localDeclaration.getFirstAncestorByKind(
          SyntaxKind.VariableStatement,
        );
        const kind = statement?.getDeclarationKind();

        if (kind && kind !== 'const') {
          console.warn(
            `[DANGER] ${fileName}: Exported via block, but declared as mutable -> ${kind} ${name}`,
          );
          dangerCount++;
        }
      }
    });
  });
});

if (dangerCount === 0) {
  console.log('✅ No exported mutable variables found via direct exports.');
  console.log(
    'If tests still fail, check if you are mutating properties on exported objects.',
  );
} else {
  console.log(`\nFound ${dangerCount} potential state issues.`);
  console.log('Consider converting these to get/set functions or constants.');
}
