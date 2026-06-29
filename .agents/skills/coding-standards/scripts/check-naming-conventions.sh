#!/usr/bin/env bash
# check-naming-conventions.sh — Verify file and component naming conventions
# Usage: bash check-naming-conventions.sh [project_dir]
set -euo pipefail

PROJECT_DIR="${1:-.}"
SRC_DIR="$PROJECT_DIR/src"

if [ ! -d "$SRC_DIR" ]; then
  echo "ERROR: No src/ directory found in $PROJECT_DIR"
  exit 1
fi

echo "=== Naming Convention Checker ==="
echo "Project: $PROJECT_DIR"
echo ""

VIOLATIONS=0

# Check React components (should be PascalCase .tsx)
echo "[1/3] Checking React component filenames..."
while IFS= read -r file; do
  basename=$(basename "$file" .tsx)
  if [[ ! "$basename" =~ ^[A-Z] ]]; then
    echo "  VIOLATION: $file — component files must be PascalCase (e.g., ${basename^}.tsx)"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done < <(find "$SRC_DIR/components" -name '*.tsx' 2>/dev/null)

# Check hooks (should start with 'use' prefix, camelCase)
echo "[2/3] Checking hook filenames..."
while IFS= read -r file; do
  basename=$(basename "$file" .ts)
  if [[ ! "$basename" =~ ^use[A-Z] ]]; then
    echo "  VIOLATION: $file — hook files must start with 'use' prefix (e.g., use${basename^}.ts)"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done < <(find "$SRC_DIR/hooks" -name '*.ts' 2>/dev/null)

# Check utility files (should be camelCase, not snake_case)
echo "[3/3] Checking utility filenames..."
while IFS= read -r file; do
  basename=$(basename "$file" .ts)
  if [[ "$basename" == *_* ]]; then
    camel=$(echo "$basename" | sed -r 's/_([a-z])/\U\1/g')
    echo "  VIOLATION: $file — use camelCase (e.g., ${camel}.ts) not snake_case"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done < <(find "$SRC_DIR/lib" "$SRC_DIR/utils" -name '*.ts' 2>/dev/null)

echo ""
if [ "$VIOLATIONS" -gt 0 ]; then
  echo "RESULT: $VIOLATIONS naming convention violation(s) found"
  exit 1
else
  echo "RESULT: All naming conventions are correct"
  exit 0
fi
