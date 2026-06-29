#!/usr/bin/env bash
# scan-code-smells.sh — Scan for common code smells (long functions, deep nesting, magic numbers, mutations)
# Usage: bash scan-code-smells.sh [project_dir]
set -euo pipefail

PROJECT_DIR="${1:-.}"
SRC_DIR="$PROJECT_DIR/src"

if [ ! -d "$SRC_DIR" ]; then
  echo "ERROR: No src/ directory found in $PROJECT_DIR"
  exit 1
fi

echo "=== Code Smell Scanner ==="
echo "Project: $PROJECT_DIR"
echo ""

TOTAL_ISSUES=0

# 1. Detect direct object mutations (.push, .splice, direct assignment)
echo "[1/4] Checking for mutable array/object operations..."
MUTATIONS=$(grep -rn '\.push(\|\.splice(\|\.pop(\|\.shift(\|\.unshift(' "$SRC_DIR" \
  --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' 2>/dev/null | \
  grep -v 'test\.\|spec\.\|\.test\.\|\.spec\.' | wc -l || echo "0")
if [ "$MUTATIONS" -gt 0 ]; then
  echo "  WARN: $MUTATIONS potential mutable operations found"
  TOTAL_ISSUES=$((TOTAL_ISSUES + MUTATIONS))
else
  echo "  PASS: No mutable array operations detected"
fi

# 2. Detect magic numbers in conditionals and assignments
echo "[2/4] Checking for magic numbers..."
MAGIC=$(grep -rn 'if.*>[[:space:]]*[0-9]\{2,\}\|setTimeout.*[0-9]\{3,\}\|=[[:space:]]*[0-9]\{4,\}' "$SRC_DIR" \
  --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' 2>/dev/null | wc -l || echo "0")
if [ "$MAGIC" -gt 0 ]; then
  echo "  WARN: $MAGIC potential magic numbers found"
  TOTAL_ISSUES=$((TOTAL_ISSUES + MAGIC))
else
  echo "  PASS: No obvious magic numbers detected"
fi

# 3. Detect deeply nested code (4+ levels of indentation)
echo "[3/4] Checking for deep nesting..."
DEEP=$(awk '
  /^[[:space:]]{16,}/ { depth++ }
  depth > 3 { count++; depth=0 }
  END { print count+0 }
' $(find "$SRC_DIR" -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' 2>/dev/null) 2>/dev/null || echo "0")
if [ "$DEEP" -gt 0 ]; then
  echo "  WARN: $DEEP code blocks with 4+ levels of indentation"
  TOTAL_ISSUES=$((TOTAL_ISSUES + DEEP))
else
  echo "  PASS: No deeply nested code detected"
fi

# 4. Detect functions exceeding 50 lines
echo "[4/4] Checking for long functions (>50 lines)..."
LONG_FUNCS=$(awk '
  /^export (async )?function |^async function |^function / { start=NR; name=$0 }
  /^}/ { if (start && NR-start > 50) { print FILENAME ":" start ": " name; count++ }; start=0 }
  END { if (count) print count; else print 0 }
' $(find "$SRC_DIR" -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' 2>/dev/null) 2>/dev/null || echo "0")
if [ "$LONG_FUNCS" != "0" ]; then
  echo "  WARN: Functions exceeding 50 lines found:"
  echo "$LONG_FUNCS"
  TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
else
  echo "  PASS: All functions under 50 lines"
fi

echo ""
echo "=== Summary ==="
echo "Total issues found: $TOTAL_ISSUES"
if [ "$TOTAL_ISSUES" -gt 0 ]; then
  echo "RESULT: ISSUES DETECTED — review warnings above"
  exit 1
else
  echo "RESULT: CLEAN"
  exit 0
fi
