# TypeScript Error Fixes

**Date:** 2025-10-16  
**Total Errors:** 409 errors in 64 files  
**Status:** In Progress

---

## Summary of Issues

### Categories of Errors

1. **Missing Dependencies** (FIXED ✅)
   - @hello-pangea/dnd
   - react-grid-layout
   - @jest/globals

2. **Missing Component** (FIXED ✅)
   - components/ui/date-picker.tsx

3. **Database Schema Issues** (Requires DB Migration - DEFERRED)
   - 2FA fields (two_factor_secret, two_factor_enabled, two_factor_backup_codes)
   - Collaboration tables (collaboration_sessions, activity_feed, notifications)
   - Council goals table

4. **Type Safety Issues** (In Progress)
   - Unknown/never types in database queries
   - Recharts type mismatches
   - Nullable field issues

5. **Import Issues** (To Fix)
   - React UMD global reference
   - Supabase types

---

## Quick Fixes Applied

### 1. Installed Missing Dependencies

```bash
npm install @hello-pangea/dnd react-grid-layout @jest/globals --save-dev
```

**Result:** Fixes 6+ import errors

### 2. Created DatePicker Component

Created `components/ui/date-picker.tsx` with proper typing.

**Result:** Fixes 4 errors in FilterBar.tsx

---

## Remaining Fixes Needed

### Priority 1: Critical Fixes (Non-Breaking)

#### A. Fix React Import in performance.ts

**File:** `lib/performance.ts`  
**Lines:** 163, 167  
**Error:** 'React' refers to a UMD global  
**Fix:** Add React import

```typescript
// Add at top of file
import React from 'react'
```

#### B. Fix Button Size Type

**File:** `components/plans/GeneratePlanPdfButton.tsx`  
**Line:** 123  
**Error:** Type '"md"' is not assignable  
**Fix:** Change size prop or update button variant

```typescript
// Change from:
size={size} // where size can be 'md'

// To:
size={size === 'md' ? 'default' : size}
```

#### C. Fix AddInitiativeForm

**File:** `components/initiatives/AddInitiativeForm.tsx`  
**Line:** 112  
**Error:** Cannot find name 'value'  
**Fix:** Add missing parameter

```typescript
// Likely missing from a function, need to see context
const formatCurrency = (value: string) => {
  const number = parseFloat(value.replace(/[^0-9.-]+/g, ''))
  // ...
}
```

#### D. Fix ProfileSecurityContent

**File:** `components/profile/ProfileSecurityContent.tsx`  
**Line:** 91  
**Error:** Type 'boolean | undefined' is not assignable  
**Fix:** Provide default value

```typescript
// Change from:
isEnabled={isEnabled}

// To:
isEnabled={isEnabled ?? false}
```

### Priority 2: Database Schema Issues (Requires Migration)

These errors are due to missing database columns. These need database migrations and cannot be fixed with code changes alone.

**Files Affected:**
- `app/actions/2fa-actions.ts` (5 errors)
- `lib/auth/2fa.ts` (10 errors)
- `lib/auth/2fa-middleware.ts` (3 errors)
- `lib/collaboration/*.ts` (50+ errors)
- `lib/reporting/dashboard-engine.ts` (22 errors)
- `lib/services/backup.ts` (30 errors)

**Recommended Approach:**
1. Create database migrations for missing tables/columns
2. Run migrations in development
3. Update type definitions
4. Retest

**Or Temporarily:**
Add `// @ts-expect-error` comments with explanations for schema work in progress.

### Priority 3: Recharts Type Issues

**Files Affected:**
- `components/finance/FundingSourcePieChart.tsx`
- `components/city-budget/BudgetByFundingSourceChart.tsx`
- `components/dashboard/BudgetBySourceChart.tsx`

**Issue:** Recharts types have changed in newer versions

**Fix Options:**
1. Update Recharts to latest version
2. Adjust formatter types to match new API
3. Use type assertions for compatibility

```typescript
// Change from:
formatter={(value, entry: { payload?: { value: number } }) => {

// To:
formatter={(value: any, entry: any) => {
  const payload = entry?.payload
  // ...
```

### Priority 4: Unknown/Never Types

These are caused by Supabase generated types being outdated or database schema not matching type definitions.

**Quick Fix:** Add type assertions where safe

```typescript
// Change from:
'Funding Source': fund.funding_source,

// To:
'Funding Source': (fund as any).funding_source,
```

**Better Fix:** Regenerate Supabase types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

---

## Execution Plan

### Phase 1: Non-Breaking Fixes (30 minutes)

```bash
# 1. Fix React import
# 2. Fix button size
# 3. Fix nullable boolean
# 4. Add type assertions for unknown types
# 5. Fix Recharts formatters
```

### Phase 2: Database Schema (2-4 hours)

```bash
# 1. Create migration for 2FA columns
# 2. Create migration for collaboration tables
# 3. Create migration for council_goals table
# 4. Run migrations
# 5. Regenerate Supabase types
# 6. Retest
```

### Phase 3: Comprehensive Type Safety (Ongoing)

```bash
# 1. Add proper type definitions for all API responses
# 2. Update database query type assertions
# 3. Add unit tests for type safety
# 4. Document type patterns for team
```

---

## Files to Fix Immediately

### Quick Fixes (Copy/Paste Ready)

#### 1. lib/performance.ts
```typescript
// Add at line 1:
import React from 'react'
```

#### 2. components/plans/GeneratePlanPdfButton.tsx
```typescript
// Line 123, change:
size={size === 'md' ? 'default' : size as "lg" | "sm" | "default" | "icon"}
```

#### 3. components/profile/ProfileSecurityContent.tsx
```typescript
// Line 91, change:
isEnabled={isEnabled ?? false}
```

#### 4. components/reporting/FilterBar.tsx
```typescript
// Line 162, 177, 188, change:
onDateChange={(date: Date | undefined) => updateFilter(filter.id, date?.toISOString())}
```

---

## Testing After Fixes

```bash
# Run type check
npm run type-check

# Expected result after Phase 1:
# ~350 errors (down from 409)

# Run lint
npm run lint

# Run dev server and smoke test
npm run dev
# Test: Login, navigate to dashboard, admin settings
```

---

## Notes

1. **Don't fix everything at once** - Risk of breaking working code
2. **Test after each fix** - Ensure no regressions
3. **Database schema issues require migrations** - Cannot be fixed with code alone
4. **Some errors are acceptable short-term** - Focus on P0 features first
5. **Document workarounds** - Help future developers understand temporary solutions

---

## Current Status

- [x] Installed missing dependencies
- [x] Created DatePicker component
- [ ] Fixed React import (performance.ts)
- [ ] Fixed button size (GeneratePlanPdfButton.tsx)
- [ ] Fixed nullable boolean (ProfileSecurityContent.tsx)
- [ ] Fixed date picker types (FilterBar.tsx)
- [ ] Added type assertions for unknown types
- [ ] Fixed Recharts formatter types
- [ ] Created database migrations
- [ ] Regenerated Supabase types

---

## Next Steps

1. Apply quick fixes above (30 min)
2. Run `npm run type-check` to verify improvement
3. Decide on database migration timeline
4. Create migration scripts
5. Test in development environment
6. Deploy fixes gradually

---

**Questions?** See COMPREHENSIVE_TESTING_PLAN.md Section 4 for more details on fixing TypeScript errors.
