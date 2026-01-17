import { Project, SyntaxKind, Node, CallExpression, ParameterDeclaration, ts } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(process.cwd());

function getCallExpression(node: Node): CallExpression | undefined {
  let current: Node | undefined = node;
  while (current && !Node.isSourceFile(current)) {
    if (Node.isCallExpression(current)) return current;
    current = current.getParent();
  }
  return undefined;
}

function applyDecisions() {
  const decisionPath = path.join(PROJECT_ROOT, 'decisions.json');
  if (!fs.existsSync(decisionPath)) return;

  const decisions = JSON.parse(fs.readFileSync(decisionPath, 'utf-8'));
  const project = new Project({ tsConfigFilePath: path.join(PROJECT_ROOT, 'tsconfig.json') });

  // Aggressively load all TS files in the project
  console.log("🔍 Loading all project files...");
  project.addSourceFilesAtPaths(["**/*.ts"]);

  for (const decision of decisions) {
    console.log(`\n🚀 Refactoring: ${decision.functionName}`);

    // Resolve definition
    const sourceFile = project.getSourceFile(f => f.getFilePath().endsWith(decision.filePath));
    if (!sourceFile) {
      console.error(`❌ Could not find definition file: ${decision.filePath}`);
      continue;
    }

    const fnNode = sourceFile.getDescendantAtPos(
      sourceFile.compilerNode.getPositionOfLineAndCharacter(decision.line - 1, 0)
    )?.getFirstAncestor(n => n.getKind() === SyntaxKind.FunctionDeclaration) as any;

    if (!fnNode) continue;

    // 1. UPDATE DEFINITION
    fnNode.getParameters().forEach((p: ParameterDeclaration) => p.remove());
    fnNode.addParameter({ name: decision.contextParamName, type: decision.contextType });

    const body = fnNode.getBody();
    if (body) {
      // IMPROVED: Generate aliased destructuring (e.g., { ballX: bXPOS })
      const destructureItems = decision.paramsToGroup.map((pName: string) => {
        const keyName = (decision.mappings && decision.mappings[pName]) || pName;
        return keyName !== pName ? `${keyName}: ${pName}` : pName;
      });

      const destructureCode = `const { ${destructureItems.join(', ')} } = ${decision.contextParamName};`;

      // Check if a similar destructuring already exists to avoid duplication
      if (!body.getText().includes(destructureCode)) {
        body.insertStatements(0, destructureCode);
      }
    }

    // 2. UPDATE CALL SITES
    const nameNode = fnNode.getNameNode();
    if (nameNode) {
      const references = nameNode.findReferencesAsNodes();
      console.log(`  Found ${references.length} potential references...`);

      references.forEach((node: Node<ts.Node>) => {
        const call = getCallExpression(node);
        if (!call) return;

        // Skip the declaration itself
        if (node.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) === fnNode &&
          node.getParent()?.getKind() === SyntaxKind.FunctionDeclaration) return;

        const args = call.getArguments();
        const groupedProps: string[] = [];
        const spreadArgIdx = args.findIndex(a => a.getText().startsWith('...'));

        decision.originalParamOrder.forEach((pName: string, idx: number) => {
          if (!decision.paramsToGroup.includes(pName)) return;
          const keyName = (decision.mappings && decision.mappings[pName]) || pName;

          if (spreadArgIdx !== -1 && idx >= spreadArgIdx) {
            const arrayName = args[spreadArgIdx].getText().replace('...', '');
            groupedProps.push(`${keyName}: ${arrayName}[${idx - spreadArgIdx}]`);
          } else if (args[idx]) {
            groupedProps.push(`${keyName}: ${args[idx].getText()}`);
          }
        });

        while (call.getArguments().length > 0) call.removeArgument(0);
        call.addArgument(`{ ${groupedProps.join(', ')} }`);
        console.log(`  ✅ Updated call in ${node.getSourceFile().getBaseName()}`);
      });
    }
  }

  console.log("\n💾 Saving all changes...");
  project.saveSync();
  console.log("✨ Done.");
}

applyDecisions();
