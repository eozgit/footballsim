export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // 1. Convert require (literals and template literals) to imports
  root.find(j.VariableDeclaration).forEach((path) => {
    const decl = path.node.declarations[0];
    if (
      decl &&
      decl.init &&
      decl.init.type === 'CallExpression' &&
      decl.init.callee.name === 'require'
    ) {
      const arg = decl.init.arguments[0];
      let source = '';

      if (arg.type === 'Literal' || arg.type === 'StringLiteral')
        source = arg.value;
      if (arg.type === 'TemplateLiteral') source = arg.quasis[0].value.cooked;

      if (source) {
        // Handle destructuring: const { x } = require('...')
        if (decl.id.type === 'ObjectPattern') {
          const specifiers = decl.id.properties.map((p) =>
            j.importSpecifier(j.identifier(p.key.name)),
          );
          path.replace(j.importDeclaration(specifiers, j.literal(source)));
        } else {
          // Handle default: const x = require('...')
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

  // 2. Convert module.exports = { ... } to export default
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
      const exportValue = path.node.expression.right;
      path.replace(j.exportDefaultDeclaration(exportValue));
    });

  return root.toSource({ quote: 'single' });
}
