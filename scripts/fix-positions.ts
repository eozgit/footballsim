import { Project, SyntaxKind, Node } from 'ts-morph';

/**
 * scripts/fix-positions.ts
 * * Refactors Player.currentPOS assignments to use safety utilities.
 * Handles:
 * 1. Literal: p.currentPOS = [x, y]          -> common.setPlayerXY(p, x, y)
 * 2. Tuple:   p.currentPOS = otherPos       -> common.setPlayerPos(p, otherPos)
 * 3. Element: p.currentPOS[1] = 50          -> common.setPlayerXY(p, p.currentPOS[0], 50)
 */

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const BAIL = process.argv.includes('--bail');

async function refactor() {
  const sourceFiles = project.getSourceFiles();

  for (const file of sourceFiles) {
    let changed = false;

    // We process BinaryExpressions (assignments using '=')
    file
      .getDescendantsOfKind(SyntaxKind.BinaryExpression)
      .filter((be) => be.getOperatorToken().getKind() === SyntaxKind.EqualsToken)
      .forEach((assignment) => {
        const left = assignment.getLeft();
        const right = assignment.getRight();

        // --- CASE A: Full property assignment (p.currentPOS = ...) ---
        if (Node.isPropertyAccessExpression(left) && left.getName() === 'currentPOS') {
          const playerObj = left.getExpression().getText();

          // Smarter RHS check: Is it an array literal [x, y]?
          if (Node.isArrayLiteralExpression(right)) {
            const elements = right.getElements();
            if (elements.length === 2) {
              const x = elements[0].getText();
              const y = elements[1].getText();
              assignment.replaceWithText(`common.setPlayerXY(${playerObj}, ${x}, ${y})`);
              changed = true;
              return;
            }
          }

          // Fallback: Use setPlayerPos for variables or spreads
          const newValue = right.getText();
          assignment.replaceWithText(`common.setPlayerPos(${playerObj}, ${newValue})`);
          changed = true;
        }

        // --- CASE B: Index assignment (p.currentPOS[0] = ...) ---
        else if (Node.isElementAccessExpression(left)) {
          const expression = left.getExpression();

          // Check if the base expression is .currentPOS
          if (
            Node.isPropertyAccessExpression(expression) &&
            expression.getName() === 'currentPOS'
          ) {
            const playerObj = expression.getExpression().getText();
            const indexToken = left.getArgumentExpression();
            const index = indexToken?.getText();
            const newValue = right.getText();

            // We handle both numerical index [1] and string index ['1'] if it exists
            if (index === '0' || index === '1' || index === '"0"' || index === '"1"') {
              const cleanIdx = index.replace(/"/g, '');
              const xVal = cleanIdx === '0' ? newValue : `${playerObj}.currentPOS[0]`;
              const yVal = cleanIdx === '1' ? newValue : `${playerObj}.currentPOS[1]`;

              assignment.replaceWithText(`common.setPlayerXY(${playerObj}, ${xVal}, ${yVal})`);
              changed = true;
            }
          }
        }
      });

    if (changed) {
      console.log(`✅ Refactored: ${file.getFilePath().replace(process.cwd(), '')}`);
      await file.save();
      if (BAIL) {
        console.log('Bailing after first file as requested.');
        process.exit(0);
      }
    }
  }
  console.log('Refactor pass complete.');
}

refactor().catch((err) => {
  console.error('Refactor failed:', err);
  process.exit(1);
});
