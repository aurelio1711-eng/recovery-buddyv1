# Refactoring Summary Report

## Header
- **Date:** YYYY-MM-DD
- **Scope:** [module/feature/file being refactored]
- **Reason:** [performance / readability / type safety / maintainability]
- **Reviewer:** OpenCode (coding-standards skill)

---

## Before / After

### Target
- **File:** `path/to/file.ts`
- **Function/Component:** `[name]`
- **Lines Before:** X
- **Lines After:** X

### Changes Applied

| Change | Before | After |
|--------|--------|-------|
| Direct mutation | `items.push(x)` | `const updated = [...items, x]` |
| `any` types | `id: any` | `id: string` |
| Sequential awaits | 3x `await` | `Promise.all(...)` |
| Deep nesting | 5 levels | Early returns |
| Magic numbers | `> 3` | `> MAX_RETRIES` |

---

## Verification

### Checks Performed
- [ ] `npm run lint` — PASS
- [ ] `npm run typecheck` — PASS
- [ ] `npm test` — PASS (X/X tests)
- [ ] Manual smoke test — PASS

### Regression Risk
- **Low** / **Medium** / **High**
- **Reason:** [explanation]

---

## Impact

- **Performance:** [improved / unchanged / measurable gain]
- **Readability:** [improved / unchanged]
- **Type Safety:** [improved / unchanged]
- **Test Coverage:** [unchanged / increased]

---

## Recommendations

1. [Follow-up action if any]
2. [Related files that may benefit from similar refactoring]

---
*Generated with OpenCode Coding Standards Skill*
