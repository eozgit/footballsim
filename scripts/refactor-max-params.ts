import { Project, SyntaxKind, Node, CallExpression, ParameterDeclaration } from 'ts-morph';
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

function applyDecisions() {
  const decisionPath = path.join(PROJECT_ROOT, 'decisions.json');
  if (!fs.existsSync(decisionPath)) {
    console.error("❌ Error: decisions.json not found.");
    return;
  }

  const decisions = JSON.parse(fs.readFileSync(decisionPath, 'utf-8'));
  const project = new Project({
    tsConfigFilePath: path.join(PROJECT_ROOT, 'tsconfig.json'),
  });

  console.log("🔍 Loading project files (including tests)...");
  project.addSourceFilesAtPaths(["src/**/*.ts", "src/test/**/*.ts"]);

  for (const decision of decisions) {
    console.log(`\n🚀 Processing Function: ${decision.functionName}`);

    const sourceFile = project.getSourceFile(decision.filePath);
    if (!sourceFile) {
      console.error(`❌ Definition file not found: ${decision.filePath}`);
      continue;
    }

    const fnNode = sourceFile.getDescendantAtPos(
      sourceFile.compilerNode.getPositionOfLineAndCharacter(decision.line - 1, 0)
    )?.getFirstAncestor(n => n.getKind() === SyntaxKind.FunctionDeclaration) as any;

    if (!fnNode) {
      console.error(`❌ Function declaration not found at ${decision.filePath}:${decision.line}`);
      continue;
    }

    // 1. UPDATE DEFINITION
    console.log(`🛠️  Updating signature in ${sourceFile.getBaseName()}`);
    fnNode.getParameters().forEach((p: ParameterDeclaration) => p.remove());
    fnNode.addParameter({
      name: decision.contextParamName,
      type: decision.contextType,
    });

    const body = fnNode.getBody();
    if (body) {
      const firstLine = body.getStatements()[0];
      const destructureCode = `const { ${decision.paramsToGroup.join(', ')} } = ${decision.contextParamName};`;
      if (!(firstLine && firstLine.getText().includes(`} = ${decision.contextParamName}`))) {
        body.insertStatements(0, destructureCode);
      }
    }
    sourceFile.saveSync();

    // 2. UPDATE CALL SITES
    const nameNode = fnNode.getNameNode();
    if (nameNode) {
      nameNode.findReferences().forEach((symbol: { getReferences: () => any[]; }) => {
        symbol.getReferences().forEach((ref: { getNode: () => any; isDefinition: () => any; }) => {
          const node = ref.getNode();
          const call = getCallExpression(node);

          // Skip if not a call or if it's the definition we just modified
          if (!call || ref.isDefinition()) return;

          const refFile = node.getSourceFile();
          const lineNum = node.getStartLineNumber();
          const args = call.getArguments();
          const groupedProps: string[] = [];

          console.log(`  📡 Inspecting call at ${refFile.getBaseName()}:${lineNum}`);

          const spreadArgIdx = args.findIndex(a => a.getText().startsWith('...'));
          const spreadArg = spreadArgIdx !== -1 ? args[spreadArgIdx] : null;

          decision.originalParamOrder.forEach((pName: string, idx: number) => {
            if (!decision.paramsToGroup.includes(pName)) return;

            const keyName = (decision.mappings && decision.mappings[pName]) ? decision.mappings[pName] : pName;

            if (spreadArg && idx >= spreadArgIdx) {
              const arrayName = spreadArg.getText().replace('...', '');
              const relativeIdx = idx - spreadArgIdx;
              console.log(`    🔗 Mapping [Spread] ${pName} -> ${arrayName}[${relativeIdx}]`);
              groupedProps.push(`${keyName}: ${arrayName}[${relativeIdx}]`);
            } else if (args[idx]) {
              console.log(`    🔗 Mapping [Direct] ${pName} -> ${args[idx].getText()}`);
              groupedProps.push(`${keyName}: ${args[idx].getText()}`);
            }
          });

          // Replace arguments
          while (call.getArguments().length > 0) {
            call.removeArgument(0);
          }

          const finalObjectText = `{ ${groupedProps.join(', ')} }`;
          call.addArgument(finalObjectText);

          console.log(`  ✅ Refactored: ${decision.functionName}(${finalObjectText})`);
          refFile.saveSync();
        });
      });
    }
  }
  console.log("\n✨ Refactor complete.");
}

applyDecisions();
