#!/bin/bash

echo "--- 1. ESM Integrity Check (No CommonJS) ---"
# After flipping to "type": "module", 'require' and 'module.exports' will throw errors.
CJS_USAGE=$(grep -rE "require\(|module.exports" lib/ test/ --include="*.js")

if [ -z "$CJS_USAGE" ]; then
  echo "✅ No legacy CommonJS syntax found."
else
  echo "❌ Legacy CommonJS found (will crash in ESM mode):"
  echo "$CJS_USAGE"
fi

echo -e "\n--- 2. AST-Based Syntax Audit ---"
# We check for the strictness we established in v2
LINT_REPORT=$(npx eslint "lib/**/*.js" --quiet --rule '{"eqeqeq": "error", "prefer-const": "error", "object-shorthand": "error"}')

if [ -z "$LINT_REPORT" ]; then
  echo "✅ AST Audit Passed: No logic-risk patterns found."
else
  echo "❌ AST Audit Failed:"
  echo "$LINT_REPORT"
fi

echo -e "\n--- 3. Complexity Baseline ---"
# We monitor the complexity so it doesn't creep up during the hybrid transition
COMPLEXITY_WARNINGS=$(npx eslint "lib/**/*.js" --quiet | grep -cE "complexity|max-lines" || echo "0")
echo "📊 Current Complexity Warnings: $COMPLEXITY_WARNINGS"

echo -e "\n--- 4. Engine Vitality (565 Tests) ---"
npm test
