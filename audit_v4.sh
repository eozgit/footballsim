#!/bin/bash

echo "--- 1. Environment Check ---"
if grep -q '"type": "module"' package.json; then
  echo "◈ Mode: ES Modules (ESM)"
  EXT=".js"
else
  echo "◈ Mode: CommonJS (CJS)"
  EXT=""
fi

echo -e "\n--- 2. Syntax & Integrity Scan ---"
# We check if the code matches the package.json mode
if [[ "$EXT" == ".js" ]]; then
  CJS_COUNT=$(grep -r "require(" lib/ test/ | wc -l)
  if [ "$CJS_COUNT" -gt 0 ]; then
    echo "❌ ERROR: Found $CJS_COUNT legacy 'require' calls in ESM mode."
  else
    echo "✅ PASS: No legacy syntax found."
  fi
else
  echo "ℹ️ INFO: Running in legacy mode, skipping ESM integrity check."
fi

echo -e "\n--- 3. Complexity Debt (Target: > 10) ---"
# We use --no-error-on-unmatched-pattern to prevent the script from crashing
# We pipe to awk to get a clean count and list
COMPLEXITY_RESULTS=$(npx eslint "lib/**/*.js" --quiet --rule '{"complexity": ["error", 10]}' | grep "complexity of")

if [ -z "$COMPLEXITY_RESULTS" ]; then
  echo "📊 Current Complexity Warnings: 0 (Check syntax if this is unexpected)"
else
  COUNT=$(echo "$COMPLEXITY_RESULTS" | wc -l)
  echo "📊 Current Complexity Warnings: $COUNT"
  echo "$COMPLEXITY_RESULTS" | sed 's/.*Function/  - Function/'
fi

echo -e "\n--- 4. Engine Vitality (Tests) ---"
npm test -- --run | grep -E "Test Files|Tests|Duration"
