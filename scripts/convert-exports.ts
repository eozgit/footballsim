import { Project, SyntaxKind, Node } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

// Load the whole project so ts-morph can find and update import references
project.addSourceFilesAtPaths('src/**/*.ts');

const sourceFiles = project.getSourceFiles();

for (const sourceFile of sourceFiles) {
  const defaultExportSymbol = sourceFile.getDefaultExportSymbol();
  if (!defaultExportSymbol) continue;

  const declaration = defaultExportSymbol.getDeclarations()[0];
  if (!declaration) continue;

  // 1. Identify what is being exported from the default export
  let membersToExport: string[] = [];
  let isObjectLiteral = false;

  if (Node.isExportAssignment(declaration)) {
    const expr = declaration.getExpression();
    if (Node.isObjectLiteralExpression(expr)) {
      // Handles: export default { a, b, c };
      isObjectLiteral = true;
      membersToExport = expr
        .getProperties()
        .filter(Node.isShorthandPropertyAssignment)
        .map((p) => p.getName());
    } else {
      // Handles: export default myVar;
      membersToExport = [expr.getText()];
    }
  } else if (
    Node.isFunctionDeclaration(declaration) ||
    Node.isClassDeclaration(declaration)
  ) {
    // Handles: export default function name() {}
    const name = declaration.getName();
    if (name) membersToExport = [name];
  }

  if (membersToExport.length === 0) continue;

  // 2. Find and update all files importing this default export
  const referencedSymbols = project
    .getLanguageService()
    .findReferences(declaration);

  for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
      const sourceNode = reference.getNode();
      const importClause = sourceNode.getFirstAncestorByKind(
        SyntaxKind.ImportClause,
      );

      if (importClause) {
        const defaultImport = importClause.getDefaultImport();
        if (defaultImport) {
          const importDeclaration = importClause.getParentIfKindOrThrow(
            SyntaxKind.ImportDeclaration,
          );
          const currentLocalName = defaultImport.getText();

          // Convert 'import X from "./y"' to 'import { X } from "./y"'
          importDeclaration.addNamedImport(currentLocalName);
          defaultImport.remove();
        }
      }
    }
  }

  // 3. Remove the Default Export and replace with a safe Named Export block
  // We filter out members that are ALREADY exported elsewhere in the file
  const existingNamedExports = new Set<string>();

  // Check for inline exports: export function foo() {}
  sourceFile
    .getFunctions()
    .forEach((f) => f.isExported() && existingNamedExports.add(f.getName()!));
  sourceFile
    .getClasses()
    .forEach((c) => c.isExported() && existingNamedExports.add(c.getName()!));
  sourceFile
    .getVariableDeclarations()
    .forEach((v) => v.isExported() && existingNamedExports.add(v.getName()));

  // Check for existing export blocks: export { foo, bar };
  sourceFile.getExportDeclarations().forEach((ed) => {
    ed.getNamedExports().forEach((ne) =>
      existingNamedExports.add(ne.getName()),
    );
  });

  const uniqueMembers = membersToExport.filter(
    (m) => !existingNamedExports.has(m),
  );

  if (uniqueMembers.length > 0) {
    sourceFile.addExportDeclaration({
      namedExports: uniqueMembers,
    });
  }

  // Finally, delete the original default export line
  if (Node.isExportAssignment(declaration)) {
    declaration.remove();
  } else if (
    Node.isFunctionDeclaration(declaration) ||
    Node.isClassDeclaration(declaration)
  ) {
    declaration.setIsDefaultExport(false);
    declaration.setIsExported(true);
  }

  console.log(`Converted exports in: ${sourceFile.getBaseName()}`);
}

project.saveSync();
console.log("Refactor complete. Run 'npm run type-check' to verify.");
