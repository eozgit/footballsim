import { Project, SyntaxKind, FunctionDeclaration, SourceFile, VariableDeclaration } from 'ts-morph';
import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTEXT_MAPPINGS: Record<string, string[]> = {
  ActionContext: ['player', 'matchDetails', 'team', 'opp', 'opposition', 'ballX', 'ballY'],
  MatchContext: ['matchDetails', 'team', 'opp', 'opposition'],
};

const PROJECT_ROOT = path.resolve(__dirname, '..');

async function runRefactor() {
  let stdout;
  try {
    console.log('🔍 Running ESLint on src/ to identify max-params errors...');
    // Focus on src/ to avoid config files
    stdout = execSync('npx eslint src --format json --rule "max-params: [error, 4]"').toString();
  } catch (error: any) {
    stdout = error.stdout ? error.stdout.toString() : '';
    if (!stdout && error.status !== 1) {
      console.error("❌ ESLint failed:", error.stderr?.toString());
      return;
    }
  }

  const results = JSON.parse(stdout);
  console.log(`\n📊 Found ${results.length} files in src/ with potential issues.`);

  const project = new Project({
    tsConfigFilePath: path.join(PROJECT_ROOT, 'tsconfig.json'),
  });

  let totalFixed = 0;

  for (const fileResult of results) {
    const filePath = fileResult.filePath;
    const sourceFile = project.getSourceFile(filePath);

    if (!sourceFile) continue;

    // IMPORTANT: SORT BY LINE DESCENDING (bottom to top)
    // This prevents line-shifting from breaking the position lookup.
    const errors = fileResult.messages
      .filter((m: any) => m.ruleId === 'max-params')
      .sort((a: any, b: any) => b.line - a.line);

    if (errors.length > 0) {
      console.log(`📄 Processing: ${path.relative(PROJECT_ROOT, filePath)} (${errors.length} errors)`);
    }

    for (const error of errors) {
      try {
        const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(error.line - 1, error.column - 1);
        const node = sourceFile.getDescendantAtPos(pos);

        const fnNode = node?.getFirstAncestor(n =>
          n.getKind() === SyntaxKind.FunctionDeclaration ||
          n.getKind() === SyntaxKind.VariableDeclaration
        );

        if (fnNode) {
          const success = processFunction(fnNode as any, sourceFile);
          if (success) totalFixed++;
        }
      } catch (err) {
        console.warn(`   ⚠️ Could not refactor line ${error.line}: Position might have shifted.`);
      }
    }
    // Save once per file
    sourceFile.saveSync();
  }

  console.log(`\n✅ Refactor Complete! - Functions Refactored: ${totalFixed}`);
}

function processFunction(node: FunctionDeclaration | VariableDeclaration, sourceFile: SourceFile): boolean {
  let fn: any;
  if (node.getKind() === SyntaxKind.VariableDeclaration) {
    const initializer = (node as VariableDeclaration).getInitializer();
    if (initializer?.getKind() === SyntaxKind.ArrowFunction || initializer?.getKind() === SyntaxKind.FunctionExpression) {
      fn = initializer;
    } else { return false; }
  } else { fn = node; }

  const name = (node as any).getName() || 'anonymous';
  const params = fn.getParameters();
  const paramNames = params.map((p: any) => p.getName());

  if (paramNames.includes('ctx')) return false;

  const useActionContext = paramNames.includes('player');
  const contextType = useActionContext ? 'ActionContext' : 'MatchContext';
  const mapping = CONTEXT_MAPPINGS[contextType];

  const contextParams = params.filter((p: any) => mapping.includes(p.getName()));
  const remainingParams = params.filter((p: any) => !mapping.includes(p.getName()));

  // SNAPSHOT structures BEFORE modification to avoid "node forgotten" error
  const remainingStructures = remainingParams.map((p: any) => p.getStructure());
  const contextStructures = contextParams.map((p: any) => p.getStructure());

  const destructureLines: string[] = [];
  const contextKeys = contextParams
    .map((p: any) => (p.getName() === 'opposition' ? 'opp: opposition' : p.getName()))
    .filter((pName: string): boolean => !['ballX', 'ballY'].includes(pName));

  if (contextKeys.length > 0) destructureLines.push(`const { ${contextKeys.join(', ')} } = ctx;`);
  if (paramNames.includes('ballX') || paramNames.includes('ballY')) {
    destructureLines.push(`const [ballX, ballY] = matchDetails.ball.position;`);
  }

  // Apply Changes
  fn.insertStatements(0, destructureLines.join('\n'));
  fn.getParameters().forEach((p: any) => p.remove());
  fn.addParameter({ name: 'ctx', type: contextType });
  fn.addParameters(remainingStructures);

  // Helper sister function
  const helperName = `create${contextType}For${name.charAt(0).toUpperCase() + name.slice(1)}`;
  if (name !== 'anonymous' && !sourceFile.getFunction(helperName)) {
    sourceFile.addFunction({
      name: helperName,
      parameters: contextStructures,
      returnType: contextType,
      statements: useActionContext
        ? `const { team, opp } = getPlayerTeam(player, matchDetails);\nreturn { player, matchDetails, team, opp };`
        : `return { matchDetails, team, opp };`,
      isExported: true
    });
  }

  // Import management
  const typeImport = sourceFile.getImportDeclaration(i => i.getModuleSpecifierValue().includes('types'));
  if (typeImport && !typeImport.getNamedImports().some(i => i.getName() === contextType)) {
    typeImport.addNamedImport(contextType);
  }

  return true;
}

runRefactor().catch(console.error);
