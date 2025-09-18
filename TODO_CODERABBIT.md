# CodeRabbit Review - TODO Items

## 🚨 Critical Issues (High Priority)

### 1. Fix Empty/TODO Criteria in Official Spec
**Files:** `src/lib/score-drilldown/official-spec.json`
- **Line 177:** SPA-003 has "TODO" as criteria - replace with concrete evaluation criteria
- **Lines 83-88:** MET-006 has empty criteria field - populate with actual evaluation criteria
- **Impact:** These rules cannot be properly evaluated, affecting scoring accuracy

### 2. Remove Hardcoded Absolute Paths
**Files:**
- `scripts/parse-spec-rules.js:10`
- `src/lib/instrumentation-calculator/lib/spec-parser.ts:5`
- `src/lib/score-drilldown/spec-parser.ts:5`

**Current:** `/Users/jakub/_/instrumentation-score-spec/rules`
**Fix:** Use environment variables with sensible defaults:
```javascript
const SPEC_RULES_DIR = process.env.SPEC_RULES_DIR || path.join(__dirname, '../../instrumentation-score-spec/rules');
```

### 3. Fix React Anti-patterns
**Files:**
- `src/lib/instrumentation-calculator/components/InstrumentationCalculator.tsx`
- `src/components/calculator/InstrumentationCalculator.tsx`
- `src/lib/instrumentation-calculator/components/RuleTable.tsx`

**Issues:**
- Components defined inside other components (recreated on every render)
- Side effects inside `useMemo` hooks (violates React rules)
- Missing memoization causing redundant calculations

**Actions:**
- Extract nested components to module scope
- Move state mutations from `useMemo` to `useEffect`
- Add `React.memo` and `useMemo` for performance

### 4. Fix Unicode Handling in Base64 Encoding
**File:** `src/lib/url-state.ts`
**Lines:** 6-14, 16-24

**Issue:** `btoa()/atob()` fail with Unicode characters
**Fix:** Use proper UTF-8 encoding/decoding:
```javascript
// Encoding
return btoa(encodeURIComponent(compressed).replace(/%([0-9A-F]{2})/g,
  (_, p1) => String.fromCharCode(parseInt(p1, 16))));

// Decoding
const compressed = decodeURIComponent(Array.from(atob(encoded),
  c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
```

## ⚠️ Important Issues (Medium Priority)

### 5. Fix Data Inconsistencies
**File:** `src/data/specRules.ts:104-112`
- RES-002 has priority "normal" but official spec says "important"
- Update to match official specification

### 6. Fix Functions Ignoring Parameters
**File:** `src/lib/scoring.ts`
**Lines:** 33-41, 43-56

**Issue:** Functions accept `rules` parameter but ignore it, creating new calculator instead
**Fix:** Either use the passed rules or remove the unused parameter

### 7. Fix Package.json Configuration
**File:** `package.json:13-17`
**Issue:** Main/exports point to TypeScript files instead of built JavaScript
**Fix:**
```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 8. Remove Duplicate Components
**File:** `src/components/ScoreDisplay.tsx`
**Issue:** Nearly identical to `src/lib/instrumentation-calculator/components/ScoreDisplay.tsx`
**Fix:** Use library version instead, remove duplicate

## 🔧 Code Quality Issues (Low Priority)

### 9. Fix Naming Conventions
**File:** `src/lib/instrumentation-calculator/lib/types.ts`
**Lines:** 9-11, 16

**Issue:** Using snake_case instead of camelCase
**Fix:**
- `max_points` → `maxPoints`
- `spec_url` → `specUrl`
- `priority_weights` → `priorityWeights`

### 10. Performance Optimizations
**Files:** Various component files

**Issues:**
- Extract inline components to prevent recreation
- Add memoization for expensive calculations
- Use `React.memo` for frequently re-rendered components

**Examples:**
- Extract `FilterTabs` component in `InstrumentationCalculator.tsx:285-311`
- Extract `SignalTab` component in `RuleTable.tsx:164-192`
- Extract `RuleRow` component in `RuleTable.tsx:76-162`
- Memoize filtered results in `RuleTable.tsx:299-310`

### 11. Add Input Validation
**File:** `src/lib/url-state.ts:16-24`
**Issue:** Decoded state should be validated for security
**Fix:** Add structure validation after JSON.parse()

### 12. Extract Magic Numbers
**File:** `src/lib/instrumentation-calculator/components/RuleTable.tsx:132`
**Issue:** Magic number `90` should be a named constant
**Fix:** `const MAX_MAGNITUDE = 90;`

## 📋 Implementation Priority

1. **Immediate (Critical):** Fix empty criteria in official spec (#1)
2. **Immediate (Critical):** Remove hardcoded paths (#2)
3. **This Sprint:** Fix React anti-patterns (#3)
4. **This Sprint:** Fix Unicode handling (#4)
5. **Next Sprint:** Address data inconsistencies (#5-8)
6. **Future:** Code quality improvements (#9-12)

## 🎯 Success Criteria

- [ ] All rules in official spec have proper criteria
- [ ] Code works across different machines/environments
- [ ] No React console warnings about side effects
- [ ] Unicode characters handled correctly in URL state
- [ ] Single source of truth for components and data
- [ ] Consistent naming conventions throughout codebase
- [ ] Performance improvements through proper memoization

## 📝 Notes

- Some issues were introduced during recent refactoring and cleanup
- Legacy components/data files have been removed but imports may still reference them
- CodeRabbit found good practices violations that should be addressed for maintainability
- Consider running CodeRabbit regularly as part of CI/CD pipeline