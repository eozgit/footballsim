import { Project, SyntaxKind, Node } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths('src/**/*.ts');

console.log('=== MODULE MIGRATION AUDIT ===\n');

project.getSourceFiles().forEach((sourceFile) => {
  const fileName = sourceFile.getBaseName();
  let fileHasIssues = false;

  // 1. SUSPECT: Same-Name Shadows (Recursion Risk)
  // Finds if a file has a local function with the same name as a module it imports
  const imports = sourceFile.getImportDeclarations();
  const functions = sourceFile.getFunctions();

  functions.forEach((fn) => {
    const fnName = fn.getName();
    imports.forEach((imp) => {
      imp.getNamedImports().forEach((ni) => {
        if (ni.getName() === fnName) {
          console.warn(
            `[RECURSION RISK] ${fileName}: Local function "${fnName}" shadows an imported named export.`,
          );
          fileHasIssues = true;
        }
      });
    });
  });

  // 2. SUSPECT: 'this' Usage in Export Objects
  // Finds 'this' keywords inside object literal exports (will break when unwrapped)
  sourceFile
    .getDescendantsOfKind(SyntaxKind.ExportAssignment)
    .forEach((exp) => {
      const obj = exp.getExpression();
      if (Node.isObjectLiteralExpression(obj)) {
        const thisUsages = obj.getDescendantsOfKind(SyntaxKind.ThisKeyword);
        if (thisUsages.length > 0) {
          console.warn(
            `[THIS CONTEXT LOSS] ${fileName}: Default export object uses 'this'. Unwrapping will break these calls.`,
          );
          fileHasIssues = true;
        }
      }
    });

  // 3. SUSPECT: Top-Level Side Effects
  // Finds logic that runs immediately on import (Initialization Order Risk)
  sourceFile.getStatements().forEach((statement) => {
    if (
      !Node.isFunctionDeclaration(statement) &&
      !Node.isClassDeclaration(statement) &&
      !Node.isExportDeclaration(statement) &&
      !Node.isImportDeclaration(statement) &&
      !Node.isVariableStatement(statement)
    ) {
      console.log(
        `[INIT ORDER RISK] ${fileName}: Found top-level execution logic at line ${statement.getStartLineNumber()}.`,
      );
    }
  });

  // 4. SUSPECT: Mutable Property Mutation
  // Finds where code tries to change a property on an imported object
  sourceFile
    .getDescendantsOfKind(SyntaxKind.BinaryExpression)
    .forEach((bin) => {
      if (bin.getOperatorToken().getKind() === SyntaxKind.EqualsToken) {
        const left = bin.getLeft();
        if (Node.isPropertyAccessExpression(left)) {
          // Check if the base of the property access is an imported namespace
          const name = left.getExpression().getText();
          const isImported = imports.some(
            (i) =>
              i.getDefaultImport()?.getText() === name ||
              i.getNamespaceImport()?.getText() === name,
          );
          if (isImported) {
            console.warn(
              `[READ-ONLY VIOLATION] ${fileName}: Attempting to mutate imported property "${left.getText()}".`,
            );
            fileHasIssues = true;
          }
        }
      }
    });
});

console.log('\nAudit Complete.');
