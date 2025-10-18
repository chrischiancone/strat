# TypeScript & Code Quality Migration Plan

**Status:** 🔴 In Progress  
**Target Completion:** 2025-11-30  
**TypeScript Error Count:** ~350 errors  
**ESLint Error Count:** ~300 errors

## Overview

This document tracks the migration of the codebase to strict TypeScript compliance and ESLint code quality standards. Build errors are currently suppressed (`ignoreBuildErrors: true` and `ignoreDuringBuilds: true`) to allow deployment while we systematically fix issues.

## ESLint Errors (~300 errors)

Common ESLint errors that need fixing:

### Unused Variables (~150 errors)
- Unused imports (components, functions)
- Unused function parameters
- Unused variables in code

**Fix:** Remove unused code or prefix with underscore (`_unusedVar`)

### Explicit Any (~100 errors)
- `any` type usage throughout codebase

**Fix:** Replace with proper types

### React/JSX Issues (~50 errors)
- Unescaped quotes in JSX text
- Missing dependencies in useEffect
- Using `<img>` instead of `<Image>`

**Fix:** 
- Use `&apos;` or `&quot;` for quotes
- Add dependencies or disable specific warnings
- Use `next/image` where appropriate

## Error Categories

Based on the initial type-check, errors fall into these categories:

### 1. Database Type Issues (~150 errors)
**Priority:** P0 - Critical  
**Files Affected:** `app/actions/*`, `lib/collaboration/*`, `lib/services/*`

**Root Cause:** Supabase database types are too generic (`never` type) or using `Json` type instead of specific interfaces.

**Solution:**
- Regenerate Supabase types: `npx supabase gen types typescript --local > types/supabase.ts`
- Create proper TypeScript interfaces for JSON columns
- Use type assertions where necessary

**Example Fix:**
```typescript
// Before
const user = data // type is 'never'
console.log(user.full_name) // Error: Property 'full_name' does not exist

// After
interface User {
  full_name: string
  email: string
  // ...
}
const user = data as User
console.log(user.full_name) // OK
```

### 2. Missing Module Dependencies (~5 errors)
**Priority:** P0 - Critical  
**Status:** ✅ Fixed

**Issues:**
- Missing `@vitejs/plugin-react`
- Missing type declarations

**Solution:**
```bash
npm install --save-dev @vitejs/plugin-react
```

### 3. Type Mismatches (~100 errors)
**Priority:** P1 - High  
**Files Affected:** Various components and actions

**Common Issues:**
- `string | null` vs `string`
- Array type mismatches
- Optional properties treated as required
- `any` type usage

**Solution:**
- Add proper null checks
- Use union types correctly
- Make properties optional where appropriate
- Replace `any` with proper types

### 4. Collaboration Engine Types (~50 errors)
**Priority:** P1 - High  
**Files Affected:** `lib/collaboration/*`, `components/collaboration/*`

**Root Cause:** Custom collaboration types not properly defined or typed as `never`.

**Solution:**
- Define proper interfaces in `types/collaboration.ts`
- Update database schema types
- Add proper type guards

### 5. Component Prop Types (~30 errors)
**Priority:** P2 - Medium  
**Files Affected:** Various React components

**Common Issues:**
- Missing required props
- Incorrect event handler types
- Props type mismatches

**Solution:**
- Fix component prop interfaces
- Use proper React event types
- Make optional props explicit

### 6. API Response Types (~15 errors)
**Priority:** P2 - Medium  
**Files Affected:** `app/api/*`

**Solution:**
- Define response type interfaces
- Use proper error types
- Type query parameters

## Migration Strategy

### Phase 1: Critical Infrastructure (Week 1-2)
- [ ] Fix database type generation
- [ ] Install missing dependencies
- [ ] Create base type interfaces

### Phase 2: Core Features (Week 3-4)
- [ ] Fix authentication types
- [ ] Fix user management types
- [ ] Fix initiative types
- [ ] Fix budget types

### Phase 3: Advanced Features (Week 5-6)
- [ ] Fix collaboration types
- [ ] Fix reporting types
- [ ] Fix admin panel types

### Phase 4: Polish (Week 7-8)
- [ ] Fix remaining component types
- [ ] Fix test types
- [ ] Enable strict mode
- [ ] Remove `ignoreBuildErrors`

## Quick Fixes

### Regenerate Supabase Types

```bash
# Ensure Supabase is running
supabase start

# Generate types
npx supabase gen types typescript --local > types/supabase.ts

# Update imports
# Change: import { Database } from '@/types/database'
# To: import { Database } from '@/types/supabase'
```

### Common Pattern Fixes

```typescript
// 1. Null checks
// Before
const name = user.full_name
// After
const name = user.full_name ?? 'Unknown'

// 2. Optional chaining
// Before
const email = user.email
// After
const email = user.email || ''

// 3. Type assertions (use sparingly)
// Before
const data = await query()
// After
const data = await query() as ExpectedType

// 4. Array access
// Before
const item = array[0].property
// After
const item = array[0]?.property

// 5. Event handlers
// Before
onClick: (userId: string) => void
// After
onClick: (event: React.MouseEvent) => void
```

## Progress Tracking

| Category | Total Errors | Fixed | Remaining | % Complete |
|----------|--------------|-------|-----------|------------|
| Database Types | 150 | 0 | 150 | 0% |
| Type Mismatches | 100 | 0 | 100 | 0% |
| Collaboration | 50 | 0 | 50 | 0% |
| Components | 30 | 0 | 30 | 0% |
| APIs | 15 | 0 | 15 | 0% |
| Dependencies | 5 | 5 | 0 | 100% |
| **Total** | **350** | **5** | **345** | **1.4%** |

## Testing Strategy

After each phase:
1. Run `npm run type-check` to verify no new errors
2. Run `npm test` to ensure tests pass
3. Run `npm run build` to verify production build
4. Manual testing of affected features

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Supabase TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## Decision Log

### 2025-10-16: Temporary Suppression
**Decision:** Temporarily re-enable `ignoreBuildErrors: true`  
**Rationale:** 350+ errors require systematic fixing. Suppressing allows deployment while we fix incrementally.  
**Timeline:** 8 weeks to complete migration

## Next Steps

1. **Install missing dependencies:** `npm install`
2. **Regenerate database types:** `npx supabase gen types typescript --local > types/supabase.ts`
3. **Start with Phase 1:** Focus on critical infrastructure
4. **Create feature branch:** `git checkout -b fix/typescript-strict-mode`
5. **Fix incrementally:** Commit after each category of fixes

## Accountability

- **Owner:** Development Team Lead
- **Reviewers:** Senior Developers
- **Weekly Check-in:** Monday standup
- **Blocker Resolution:** Slack #dev-typescript-migration

---

**Last Updated:** 2025-10-16  
**Next Review:** 2025-10-23
