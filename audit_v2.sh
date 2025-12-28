#!/bin/bash

echo "--- 1. Checking for Strict Equality (eqeqeq) ---"
# We now include ALL files. If playerMovement.js is a 'danger zone',
# we should fix it, not ignore it.
EQUALS_ERRORS=$(npx eslint "lib/**/*.js" --quiet --rule '{"eqeqeq": "error"}')

if [ -z "$EQUALS_ERRORS" ]; then
  echo "✅ All comparisons use strict equality (===)."
else
  echo "❌ Found loose equality errors:"
  echo "$EQUALS_ERRORS"
fi

echo -e "\n--- 2. Checking for Modern Syntax (Shorthand & Templates) ---"
MODERN_ERRORS=$(npx eslint "lib/**/*.js" --quiet --rule '{"object-shorthand": "error", "prefer-template": "error"}')

if [ -z "$MODERN_ERRORS" ]; then
  echo "✅ Modern syntax standards met."
else
  echo "❌ Legacy syntax found:"
  echo "$MODERN_ERRORS"
fi

echo -e "\n--- 3. Complexity & Length Audit (Warnings) ---"
# This checks for those 46 warnings regarding function length and complexity
COMPLEXITY_COUNT=$(npx eslint "lib/**/*.js" --quiet | grep -cE "complexity|max-lines")
echo "⚠️ There are $COMPLEXITY_COUNT functions exceeding complexity/length limits."

echo -e "\n--- 4. Final Vitality Check (565 Tests) ---"
npm test
