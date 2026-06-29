#!/usr/bin/env bash
# lint-check.sh — Run ESLint and TypeScript type-check on a project
# Usage: bash lint-check.sh [project_dir]
set -euo pipefail

PROJECT_DIR="${1:-.}"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "ERROR: Directory '$PROJECT_DIR' does not exist."
  exit 1
fi

echo "=== Coding Standards Lint Check ==="
echo "Project: $PROJECT_DIR"
echo ""

# Check for package.json
if [ ! -f "$PROJECT_DIR/package.json" ]; then
  echo "ERROR: No package.json found in $PROJECT_DIR"
  exit 1
fi

ERRORS=0

# Run ESLint if available
if [ -f "$PROJECT_DIR/node_modules/.bin/eslint" ] || command -v npx &>/dev/null; then
  echo "[1/3] Running ESLint..."
  if npx --prefix "$PROJECT_DIR" eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0 2>&1; then
    echo "  PASS: No ESLint errors"
  else
    echo "  FAIL: ESLint errors detected"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "[1/3] SKIP: ESLint not installed"
fi

# Run TypeScript type-check if tsconfig exists
if [ -f "$PROJECT_DIR/tsconfig.json" ]; then
  echo "[2/3] Running TypeScript type-check..."
  if npx --prefix "$PROJECT_DIR" tsc --noEmit 2>&1; then
    echo "  PASS: No type errors"
  else
    echo "  FAIL: Type errors detected"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "[2/3] SKIP: No tsconfig.json found"
fi

# Check for 'any' type usage
echo "[3/3] Scanning for 'any' type usage..."
ANY_COUNT=$(grep -r ': any' "$PROJECT_DIR/src" --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l || echo "0")
if [ "$ANY_COUNT" -gt 0 ]; then
  echo "  WARN: Found $ANY_COUNT instances of 'any' type in src/"
  grep -rn ': any' "$PROJECT_DIR/src" --include='*.ts' --include='*.tsx' 2>/dev/null | head -20
else
  echo "  PASS: No 'any' type usage found"
fi

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "RESULT: FAILED ($ERRORS check(s) failed)"
  exit 1
else
  echo "RESULT: PASSED"
  exit 0
fi
