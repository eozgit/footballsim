import { Project, SyntaxKind, ParameterDeclaration, Node, CallExpression } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(process.cwd());

function getCallExpression(node: Node): CallExpression | undefined {
  const parent = node.getParent();
  if (Node.isCallExpression(parent)) return parent;
  if (Node.isPropertyAccessExpression(parent)) {
    const grandParent = parent.getParent();
    if (Node.isCallExpression(grandParent)) return grandParent;
  }
  return undefined;
}

function getDiscovery() {
  const jsonPath = path.join(PROJECT_ROOT, 'max-params.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Error: max-params.json not found.');
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const project = new Project({ tsConfigFilePath: path.join(PROJECT_ROOT, 'tsconfig.json') });

  // Ensure tests are included for call site detection
  project.addSourceFilesAtPaths(['src/**/*.ts', 'src/test/**/*.ts']);
  project.resolveSourceFileDependencies();

  const discoveryData: any[] = [];

  // Parse Limit (Measure in unique functions identified)
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

  // Track processed functions to handle --limit correctly across multiple files
  let functionsProcessedCount = 0;

  for (const fileResult of results) {
    if (functionsProcessedCount >= limit) break;

    const sourceFile = project.getSourceFile(fileResult.filePath);
    if (!sourceFile) continue;

    const errors = fileResult.messages.filter((m: any) => m.ruleId === 'max-params');

    for (const error of errors) {
      if (functionsProcessedCount >= limit) break;

      const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
        error.line - 1,
        error.column - 1,
      );
      const nodeAtPos = sourceFile.getDescendantAtPos(pos);

      const fnNode = nodeAtPos?.getFirstAncestor(
        (n) =>
          n.getKind() === SyntaxKind.FunctionDeclaration ||
          n.getKind() === SyntaxKind.VariableDeclaration,
      );

      if (fnNode) {
        let actualFn: any = fnNode;
        if (Node.isVariableDeclaration(fnNode)) {
          actualFn =
            fnNode.getInitializerIfKind(SyntaxKind.ArrowFunction) ||
            fnNode.getInitializerIfKind(SyntaxKind.FunctionExpression);
        }

        if (!actualFn || typeof actualFn.getParameters !== 'function') continue;

        const name = Node.isVariableDeclaration(fnNode)
          ? fnNode.getName()
          : (fnNode as any).getName?.();

        const callSites: any[] = [];
        const nameNode = Node.isVariableDeclaration(fnNode)
          ? fnNode.getNameNode()
          : (fnNode as any).getNameNode?.();

        if (nameNode) {
          // findReferences() returns ReferencedSymbol[]
          const symbols = nameNode.findReferences();
          for (const symbol of symbols) {
            // symbol.getReferences() returns ReferencedSymbolEntry[]
            for (const refEntry of symbol.getReferences()) {
              // CRITICAL: Must call .getNode() on the entry to get the actual AST Node
              const refNode = refEntry.getNode();
              const call = getCallExpression(refNode);

              if (call && !refEntry.isDefinition()) {
                callSites.push({
                  filePath: refNode.getSourceFile().getFilePath(),
                  line: refNode.getStartLineNumber(),
                  argCount: call.getArguments().length,
                });
              }
            }
          }
        }

        discoveryData.push({
          id: `fn-${discoveryData.length + 1}`,
          filePath: fileResult.filePath,
          functionName: name || 'anonymous',
          line: error.line,
          currentParams: actualFn.getParameters().map((p: ParameterDeclaration) => p.getName()),
          callSites: callSites,
        });

        functionsProcessedCount++;
        console.log(
          `✅ [${functionsProcessedCount}/${limit}] Collected: ${name} (${callSites.length} call sites)`,
        );
      }
    }
  }

  fs.writeFileSync('discovery.json', JSON.stringify(discoveryData, null, 2));
  console.log(
    `\n📂 Discovery complete. Results for ${discoveryData.length} functions saved to discovery.json`,
  );
}

getDiscovery();
