export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.CallExpression, { callee: { name: 'require' } })
    .forEach((path) => {
      const arg = path.node.arguments[0];
      if (!arg) return;

      // Handle standard string literals
      if (
        (arg.type === 'StringLiteral' || arg.type === 'Literal') &&
        typeof arg.value === 'string'
      ) {
        if (
          arg.value.startsWith('.') &&
          !arg.value.endsWith('.js') &&
          !arg.value.endsWith('.json')
        ) {
          arg.value = `${arg.value}.js`;
        }
      }

      // Handle template literals (backticks)
      if (arg.type === 'TemplateLiteral' && arg.quasis.length === 1) {
        const rawValue = arg.quasis[0].value.raw;
        if (
          rawValue.startsWith('.') &&
          !rawValue.endsWith('.js') &&
          !rawValue.endsWith('.json')
        ) {
          arg.quasis[0].value.raw = `${rawValue}.js`;
          arg.quasis[0].value.cooked = `${rawValue}.js`;
        }
      }
    });

  return root.toSource();
}
