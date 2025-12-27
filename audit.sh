#!/bin/bash

echo "--- 1. Checking for Loose Equality (== or !=) ---"
# We exclude the 'danger zone' playerMovement.js and common '== null' patterns
EQUALS_ERRORS=$(grep -rnE '([[:space:]]|^)(==|!=)([[:space:]]|$)' lib/ test/ \
  --include="*.js" \
  --exclude="playerMovement.js" |
  grep -vE '^[[:space:]]*(\*|//|.*== null)')

if [ -z "$EQUALS_ERRORS" ]; then
  echo "✅ No loose equality found (outside danger zones)."
else
  echo "❌ Found loose equality in:"
  echo "$EQUALS_ERRORS"
fi

echo -e "\n--- 2. Checking for 'let' that should be 'const' ---"
CONST_ERRORS=$(npx eslint "lib/**/*.js" --quiet --rule '{"prefer-const": "error"}' | grep "prefer-const")

if [ -z "$CONST_ERRORS" ]; then
  echo "✅ All variables properly declared as const."
else
  echo "❌ Reassignment audit failed:"
  echo "$CONST_ERRORS"
fi

echo -e "\n--- 3. Running Test Suite ---"
npm test
