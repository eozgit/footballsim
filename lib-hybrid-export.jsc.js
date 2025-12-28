// Save as lib-hybrid-export.jsc.js
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Target: module.exports = { ... }
  root
    .find(j.ExpressionStatement, {
      expression: {
        left: {
          object: { name: 'module' },
          property: { name: 'exports' },
        },
      },
    })
    .forEach((path) => {
      const obj = path.node.expression.right;
      if (obj.type === 'ObjectExpression') {
        const names = obj.properties.map((p) => p.key.name);

        const namedExport = j.exportNamedDeclaration(
          null,
          names.map((name) =>
            j.exportSpecifier.from({
              local: j.identifier(name),
              exported: j.identifier(name),
            }),
          ),
        );

        const defaultExport = j.exportDefaultDeclaration(obj);
        // Replace the single module.exports with both ESM types
        path.replace(namedExport, defaultExport);
      }
    });

  return root.toSource({ quote: 'single' });
}
