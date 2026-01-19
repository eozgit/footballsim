import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths(['src/**/*.ts', '!src/test/**/*.ts']);

const summaries = {};

project.getSourceFiles().forEach((sourceFile) => {
  const fileName = sourceFile.getBaseName();
  summaries[fileName] = [];

  sourceFile.getFunctions().forEach((fn) => {
    const summary = {
      name: fn.getName(),
      params: fn.getParameters().map((p) => p.getText()),
      calls: fn
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .map((c) => c.getExpression().getText())
        .slice(0, 10), // Only top 10 calls to keep it short
      logicNodes: fn.getDescendantsOfKind(SyntaxKind.IfStatement).length,
      // Create a "Pseudo-code" version
      pseudo: `${fn.getName()}(${fn
        .getParameters()
        .map((p) => p.getName())
        .join(', ')}) {
        // Logic branches: ${fn.getDescendantsOfKind(SyntaxKind.IfStatement).length}
        // Key actions: ${[...new Set(fn.getDescendantsOfKind(SyntaxKind.CallExpression).map((c) => c.getExpression().getText()))].join(', ')}
      }`,
    };
    summaries[fileName].push(summary);
  });
});

fs.writeFileSync('function-summaries.json', JSON.stringify(summaries, null, 2));
console.log('Summarization complete. Created function-summaries.json');
