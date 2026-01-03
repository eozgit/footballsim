import { Project, SyntaxKind, Node } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

project.addSourceFilesAtPaths('src/**/*.ts');

const sourceFiles = project.getSourceFiles();

// 1. Map out every file that provides a default export
const defaultExportMap = new Map<
  string,
  { members: string[]; filePath: string }
>();

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

    defaultExportMap.set(sourceFile.getFilePath(), {
      members,
      filePath: sourceFile.getFilePath(),
    });
  }
}

// 2. Iterate through consumers to update code and imports
for (const sourceFile of sourceFiles) {
  const importDeclarations = sourceFile.getImportDeclarations();

  for (const importDecl of importDeclarations) {
    const moduleSource = importDecl.getModuleSpecifierSourceFile();
    if (!moduleSource) {
      continue;
    }

    const exportData = defaultExportMap.get(moduleSource.getFilePath());
    const importClause = importDecl.getImportClause();
    const defaultImport = importClause?.getDefaultImport();

    if (exportData && defaultImport && importClause) {
      const localAlias = defaultImport.getText();

      // 3. Replace usages in function bodies: alias.member -> member
      sourceFile
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .forEach((pa) => {
          if (pa.getExpression().getText() === localAlias) {
            const propertyName = pa.getName();
            console.log(
              `[REPLACE] In ${sourceFile.getBaseName()}: ${pa.getText()} -> ${propertyName}`,
            );
            pa.replaceWithText(propertyName);
          }
        });

      // 4. Update the import statement cleanly
      // First, add the named imports
      importDecl.addNamedImports(exportData.members);

      // Second, remove the default import (this handles the comma correctly)
      importDecl.removeDefaultImport();

      console.log(
        `[IMPORT] Successfully migrated "${localAlias}" in ${sourceFile.getBaseName()}`,
      );
    }
  }
}

// 5. Finalize Exports in the source files
for (const [path, data] of defaultExportMap) {
  const sourceFile = project.getSourceFileOrThrow(path);
  const declaration = sourceFile.getDefaultExportSymbol()?.getDeclarations()[0];

  if (declaration && Node.isExportAssignment(declaration)) {
    const existingExports = new Set(
      sourceFile
        .getExportDeclarations()
        .flatMap((d) => d.getNamedExports().map((n) => n.getName())),
    );
    // Include inline exported functions
    sourceFile
      .getFunctions()
      .forEach((f) => f.isExported() && existingExports.add(f.getName()!));

    const uniqueMembers = data.members.filter((m) => !existingExports.has(m));

    if (uniqueMembers.length > 0) {
      sourceFile.addExportDeclaration({ namedExports: uniqueMembers });
    }
    declaration.remove();
    console.log(
      `[EXPORT] Converted default export in ${sourceFile.getBaseName()}`,
    );
  }
}

project.saveSync();
console.log('\nRefactor finished successfully.');
