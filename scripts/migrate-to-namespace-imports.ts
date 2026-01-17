import { Project, Node } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths('src/**/*.ts');

const sourceFiles = project.getSourceFiles();

for (const sourceFile of sourceFiles) {
  const defaultExportSymbol = sourceFile.getDefaultExportSymbol();
  if (!defaultExportSymbol) {
    continue;
  }

  const declaration = defaultExportSymbol.getDeclarations()[0];
  if (!declaration || !Node.isExportAssignment(declaration)) {
    continue;
  }

  const expr = declaration.getExpression();
  if (Node.isObjectLiteralExpression(expr)) {
    const members = expr
      .getProperties()
      .filter(Node.isShorthandPropertyAssignment)
      .map((p) => p.getName());

    // 1. Add Named Exports
    sourceFile.addExportDeclaration({ namedExports: members });

    const filePath = sourceFile.getFilePath();

    // 2. Update Consumers
    project.getSourceFiles().forEach((cf) => {
      cf.getImportDeclarations().forEach((id) => {
        if (id.getModuleSpecifierSourceFile()?.getFilePath() === filePath) {
          const defaultImport = id.getDefaultImport();
          if (defaultImport) {
            const name = defaultImport.getText();
            const moduleSpecifier = id.getModuleSpecifierValue();

            if (id.getNamedImports().length > 0) {
              // CONFLICT: Has named imports. Create a separate line.
              id.removeDefaultImport();
              cf.addImportDeclaration({
                moduleSpecifier: moduleSpecifier,
                namespaceImport: name,
              });
              console.log(`[SPLIT] Handled mixed import in ${cf.getBaseName()}: * as ${name}`);
            } else {
              // SAFE: No named imports. Just convert in place.
              id.removeDefaultImport();
              id.setNamespaceImport(name);
              console.log(`[SAFE] Migrated ${cf.getBaseName()} to namespace import: ${name}`);
            }
          }
        }
      });
    });
  }
}

project.saveSync();
