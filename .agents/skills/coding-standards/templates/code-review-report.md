# Code Standards Review Report

## Header
- **Date:** YYYY-MM-DD
- **Reviewer:** OpenCode (coding-standards skill)
- **Files Reviewed:** [list of files]
- **Severity Legend:** 🔴 Critical | 🟡 Major | 🟢 Minor

---

## Summary

| Category | Count |
|----------|-------|
| Critical Issues | X |
| Major Issues | X |
| Minor Issues | X |
| Total | X |

**Overall Assessment:** [PASS / NEEDS WORK / FAIL]

---

## Findings

### 🔴 Critical Issues

#### 1. [Issue Title]
- **File:** `path/to/file.ts:42`
- **Rule:** [e.g., No direct state mutation]
- **Current Code:**
  ```typescript
  // offending code
  ```
- **Suggested Fix:**
  ```typescript
  // corrected code
  ```

### 🟡 Major Issues

#### 1. [Issue Title]
- **File:** `path/to/file.ts:15`
- **Rule:** [e.g., No `any` type usage]
- **Current Code:**
  ```typescript
  function getData(id: any): Promise<any>
  ```
- **Suggested Fix:**
  ```typescript
  function getData(id: string): Promise<DataItem>
  ```

### 🟢 Minor Issues

#### 1. [Issue Title]
- **File:** `path/to/file.ts:8`
- **Rule:** [e.g., Use named constants instead of magic numbers]
- **Current Code:**
  ```typescript
  if (count > 3)
  ```
- **Suggested Fix:**
  ```typescript
  const MAX_RETRIES = 3
  if (count > MAX_RETRIES)
  ```

---

## Checklist Results

| Check | Status |
|-------|--------|
| Descriptive variable names | ✅ / ❌ |
| No `any` types | ✅ / ❌ |
| Immutability patterns | ✅ / ❌ |
| Error handling with try/catch | ✅ / ❌ |
| Parallel async with Promise.all | ✅ / ❌ |
| Input validation (Zod) | ✅ / ❌ |
| No magic numbers | ✅ / ❌ |
| Functions under 50 lines | ✅ / ❌ |
| Max 3 nesting levels | ✅ / ❌ |
| AAA test pattern | ✅ / ❌ |
| JSDoc on public functions | ✅ / ❌ |
| Memoization where needed | ✅ / ❌ |

---

## Recommendations

1. [Priority action item]
2. [Priority action item]
3. [Priority action item]

---
*Generated with OpenCode Coding Standards Skill*
