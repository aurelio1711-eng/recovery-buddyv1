# OpenCode Coding Standards — Usage References

## Quick Reference: Prompts That Trigger This Skill

| Prompt Pattern | Category |
|----------------|----------|
| "Review this file for coding standards violations" | Code Review |
| "Refactor this function — it's too long" | Refactoring |
| "Replace all `any` types with proper interfaces" | Type Safety |
| "Add error handling to this function" | Error Handling |
| "Create a Zod schema for this request body" | Input Validation |
| "Check this code for code smells" | Quality Audit |
| "Enforce naming conventions for these files" | File Organization |
| "Optimize this React component" | Performance |
| "Write tests following AAA pattern" | Testing Standards |

---

## Example 1: Code Review for Standards Violations

**Prompt:**
```
Review this file for coding standards violations: src/components/MarketCard.tsx
```

**What the skill does:**
- Reads the file and applies the code review checklist
- Classifies issues as critical, major, or minor
- Identifies: mutable mutations, `any` types, magic numbers, deep nesting, missing error handling
- Provides refactored code with inline comments

**Expected output:**
A categorized list of violations with severity levels, code snippets showing each issue, and corrected code suggestions.

---

## Example 2: Refactor a Long Function

**Prompt:**
```
Refactor the processMarketData function in src/lib/markets.ts — it's over 80 lines. Split it into smaller functions following the coding-standards skill.
```

**What the skill does:**
- Identifies logical sections within the function
- Extracts each section into a named function with a single responsibility
- Uses early returns for validation guards
- Ensures each function is under 50 lines

---

## Example 3: Enforce Type Safety

**Prompt:**
```
Replace all 'any' types in src/types/api.ts with proper interfaces following the coding-standards skill.
```

**What the skill does:**
- Scans for `any` type annotations
- Infers appropriate types from usage context
- Creates interfaces for complex objects
- Updates all references

---

## Example 4: Add Input Validation with Zod

**Prompt:**
```
Create a Zod validation schema for the CreateOrder request body following our API design standards: fields are email (string), items (array of {productId: string, quantity: number}), and shippingAddress (string).
```

**What the skill does:**
- Builds a Zod schema with proper constraints
- Integrates with the API handler
- Returns structured validation errors

---

## Example 5: Fix React Anti-Patterns

**Prompt:**
```
Optimize src/components/Dashboard.tsx — check for unnecessary re-renders, missing memoization, and anti-patterns. Follow the coding-standards skill.
```

**What the skill does:**
- Adds `useMemo` for expensive computations
- Wraps callbacks with `useCallback`
- Splits conditional rendering into separate guards
- Verifies `key` props on lists

---

## Running Scripts Manually

### Lint a project directory
```bash
bash scripts/lint-check.sh /path/to/project
```

### Scan for code smells
```bash
bash scripts/scan-code-smells.sh /path/to/project
```

### Run naming conventions check
```bash
bash scripts/check-naming-conventions.sh /path/to/project
```

---

*Generated with OpenCode Coding Standards Skill*
