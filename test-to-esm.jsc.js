export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.VariableDeclaration).forEach((path) => {
    const decl = path.node.declarations[0];

    // Check if it's a require call
    if (
      decl &&
      decl.init &&
      decl.init.type === 'CallExpression' &&
      decl.init.callee.name === 'require'
    ) {
      const arg = decl.init.arguments[0];
      let source = '';

      // Extract path from '' or ``
      if (arg.type === 'Literal' || arg.type === 'StringLiteral')
        source = arg.value;
      if (arg.type === 'TemplateLiteral') source = arg.quasis[0].value.cooked;

      if (source) {
        // 1. Fix missing extensions for local files
        if (
          source.startsWith('.') &&
          !source.endsWith('.js') &&
          !source.endsWith('.json')
        ) {
          source = `${source}.js`;
        }

        // 2. Handle Destructuring: const { expect } = require('chai')
        if (decl.id.type === 'ObjectPattern') {
          const specifiers = decl.id.properties.map((p) =>
            j.importSpecifier(j.identifier(p.key.name)),
          );
          path.replace(j.importDeclaration(specifiers, j.literal(source)));
        }
        // 3. Handle Default: const common = require('./common')
        else if (decl.id.type === 'Identifier') {
          path.replace(
            j.importDeclaration(
              [j.importDefaultSpecifier(j.identifier(decl.id.name))],
              j.literal(source),
            ),
          );
        }
      }
    }
  });

  return root.toSource({ quote: 'single' });
}
