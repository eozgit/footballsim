export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;

  // 1. Find and replace common.readFile(...) calls
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: 'common' },
        property: { name: 'readFile' },
      },
    })
    .forEach((path) => {
      changed = true;
      // Change common.readFile() to just readFile()
      j(path).replaceWith(
        j.callExpression(j.identifier('readFile'), path.node.arguments),
      );
    });

  if (changed) {
    // 2. Add the import at the top
    // Logic to determine relative path based on file location
    const importPath = file.path.includes('test/')
      ? '../lib/fileReader.js'
      : './fileReader.js';

    const importDecl = j.importDeclaration(
      [j.importSpecifier(j.identifier('readFile'))],
      j.literal(importPath),
    );

    // Check if it's already there to avoid duplicates
    const existingImport = root.find(j.ImportDeclaration, {
      source: { value: importPath },
    });

    if (existingImport.length === 0) {
      root.get().node.program.body.unshift(importDecl);
    }
  }

  return root.toSource({ quote: 'single' });
}
