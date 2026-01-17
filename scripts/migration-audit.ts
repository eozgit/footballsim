import { Project, SyntaxKind, Node } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths('src/**/*.ts');

console.log('=== REFINED MODULE MIGRATION AUDIT ===\n');

project.getSourceFiles().forEach((sourceFile) => {
  const fileName = sourceFile.getBaseName();
  const imports = sourceFile.getImportDeclarations();

  // 1. SUSPECT: Same-Name Shadows (Recursion Risk)
  const functions = sourceFile.getFunctions();
  functions.forEach((fn) => {
    const fnName = fn.getName();
    if (!fnName) {
      return;
    }
    imports.forEach((imp) => {
      imp.getNamedImports().forEach((ni) => {
        if (ni.getName() === fnName) {
          console.warn(
            `[RECURSION RISK] ${fileName}: Local function "${fnName}" shadows an import.`,
          );
        }
      });
    });
  });

  // 2. SUSPECT: Top-Level Side Effects
  sourceFile.getStatements().forEach((statement) => {
    // Skip safe declarations
    if (
      Node.isFunctionDeclaration(statement) ||
      Node.isClassDeclaration(statement) ||
      Node.isExportDeclaration(statement) ||
      Node.isImportDeclaration(statement) ||
      Node.isVariableStatement(statement) ||
      Node.isExportAssignment(statement) ||
      Node.isInterfaceDeclaration(statement) ||
      Node.isTypeAliasDeclaration(statement) ||
      Node.isEnumDeclaration(statement) ||
      Node.isModuleDeclaration(statement)
    ) {
      return;
    }

    // Skip test blocks and hooks
    if (Node.isExpressionStatement(statement)) {
      const expr = statement.getExpression();
      if (Node.isCallExpression(expr)) {
        const text = expr.getExpression().getText();
        const vitestHooks = [
          'describe',
          'it',
          'test',
          'beforeAll',
          'afterAll',
          'beforeEach',
          'afterEach',
          'vi.mock',
          'vi.stubGlobal',
        ];
        if (vitestHooks.some((hook) => text.startsWith(hook))) {
          return;
        }
      }
    }

    console.log(
      `[INIT ORDER RISK] ${fileName}: Top-level logic at line ${statement.getStartLineNumber()}.`,
    );
  });

  // 3. SUSPECT: Mutable Property Mutation
  // We use the file-level descendants here to avoid scope issues
  sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach((bin) => {
    if (bin.getOperatorToken().getKind() === SyntaxKind.EqualsToken) {
      const left = bin.getLeft();
      if (Node.isPropertyAccessExpression(left)) {
        const name = left.getExpression().getText();
        const isNamespaceImport = imports.some((i) => i.getNamespaceImport()?.getText() === name);
        if (isNamespaceImport) {
          console.warn(
            `[READ-ONLY VIOLATION] ${fileName}: Mutating imported namespace property "${left.getText()}".`,
          );
        }
      }
    }
  });
});

console.log('\nAudit Complete.');
