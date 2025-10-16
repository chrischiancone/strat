# System Bug Report and Fixes

## Date: 2025-10-16

## Critical Issues

### 1. Comment Functions Disabled ❌ CRITICAL
**Location**: `app/actions/comments.ts`
**Status**: Update, delete, and resolve comment functions are commented out

**Issue**: Lines 201-418 contain disabled functionality with TODO comments about "Supabase type inference issues"

**Impact**: Users cannot:
- Edit their comments
- Delete comments
- Mark comments as resolved

**Fix**: Enable these functions with proper TypeScript typing

---

### 2. Plan Creation May Fail Due to Constraint ⚠️ HIGH
**Location**: Database schema / `supabase/migrations/20250109000002_create_planning_tables.sql`
**Status**: Constraint `strategic_plans_years_valid` requires different start/end fiscal years

**Issue**: Line 28 of the migration has:
```sql
CONSTRAINT strategic_plans_years_valid CHECK (start_fiscal_year_id != end_fiscal_year_id)
```

But the code in `app/actions/strategic-plans.ts` (lines 231-232) sets them to the same value:
```typescript
start_fiscal_year_id: input.fiscal_year_id,
end_fiscal_year_id: input.fiscal_year_id,
```

**Impact**: Creating single-year strategic plans fails with database constraint violation

**Fix Applied**: Migration `20251014000002_allow_single_fiscal_year_plans.sql` removes this constraint
**Action Needed**: Verify migration is applied with `npm run db:reset` or manually apply it

---

### 3. Collaboration API Authentication Disabled ⚠️ MEDIUM
**Location**: `middleware.ts` lines 227-234
**Status**: Collaboration API bearer token auth is commented out

**Issue**: The middleware that validates bearer tokens for `/api/collaboration/*` routes is disabled

**Impact**: 
- Collaboration API routes have no token validation
- Security vulnerability for real-time collaboration features
- Comments system may have inconsistent auth

**Recommendation**: Re-enable after ensuring it doesn't conflict with cookie-based auth for server actions

---

## Medium Priority Issues

### 4. Database Reset Wipes Auth Users 🔄 MEDIUM
**Location**: Development workflow
**Status**: `npx supabase db reset` clears `auth.users` table

**Issue**: Every database reset requires recreating all test users

**Impact**: Frequent login failures during development

**Mitigation Applied**: 
- Created `scripts/reset-specific-user-password.ts` for quick password resets
- Added backup/restore scripts (`scripts/backup-data.sh`, `scripts/restore-data.sh`)
- Created `DATABASE_MIGRATION_GUIDE.md` with best practices

---

### 5. Rate Limiting Too Aggressive 🚦 MEDIUM
**Location**: `middleware.ts` and `app/actions/auth.ts`
**Status**: Rate limits may be blocking legitimate users

**Current Limits**:
- General API: 100 requests per 15 minutes per IP
- Login: Configurable (default likely 5-10 attempts per 15 minutes)
- Signup: 3 attempts per hour per IP
- Password change: 3 attempts per hour per user

**Issue**: Supabase's built-in rate limiting + app rate limiting = double restriction

**Impact**: Users getting "Too many login attempts" errors frequently

**Recommendation**: 
- Increase limits or disable app-level rate limiting (rely on Supabase's)
- Clear rate limit on Supabase restart: `npx supabase stop && npx supabase start`

---

## Low Priority / Code Quality Issues

### 6. Inconsistent Error Handling 📝 LOW
**Issue**: Some functions throw generic "Failed to..." errors without detailed logging

**Examples**:
- `app/actions/comments.ts` line 184: `throw new Error('Failed to create comment')`
- `app/actions/strategic-plans.ts` line 95: `throw new Error('Failed to fetch strategic plans')`

**Recommendation**: Add more contextual error information and better user-facing messages

---

### 7. Missing Null Checks in Data Transformations 🔍 LOW
**Location**: Various data fetching functions
**Issue**: Some transformations assume data exists without null checks

**Example**: `app/actions/strategic-plans.ts` lines 114-127

**Recommendation**: Add defensive null checking for all optional/joined data

---

### 8. Disabled Update Triggers 🛠️ LOW
**Location**: Database schema
**Issue**: Some tables might not have `updated_at` triggers properly set

**Recommendation**: Verify all tables with `updated_at` columns have corresponding triggers

---

## Authentication Flow Review ✅

### Login System - Status: GOOD ✅
**Location**: `app/actions/auth.ts` and `components/auth/LoginForm.tsx`

**Working correctly**:
- Input validation (client and server)
- Rate limiting (may need adjustment)
- Security auditing and logging
- 2FA check integration
- Session management via Supabase SSR

**No issues found**

---

### Middleware Security - Status: GOOD ✅
**Location**: `middleware.ts` and `lib/supabase/middleware.ts`

**Working correctly**:
- Session refresh via Supabase SSR
- Rate limiting per endpoint
- Suspicious activity detection
- Security headers (CSP, HSTS, etc.)
- IP whitelisting (when enabled)

**One issue**: Collaboration API auth disabled (see #3 above)

---

## Database Schema Review

### RLS Policies - Status: NEEDS VERIFICATION ⚠️
**Location**: `supabase/migrations/20250109000005_enable_rls_policies.sql`

**Concerns**:
1. **Comments RLS** - Recently fixed to allow proper access based on department/municipality
2. **Strategic Plans Insert** - Requires department match or admin/manager role (seems correct)
3. **Strategic Plans Select** - Uses JOIN to verify municipality access (correct)

**Actions Taken**:
- Migration `20251015000003_fix_comments_policy.sql` created to fix overly restrictive comment insert policy
- Now allows inserts if user's department and municipality match the resource's

**Recommendation**: Test all RLS policies with different user roles

---

## Recommended Immediate Actions

1. **Fix Comment Functions** ✅ HIGH PRIORITY
   - Re-enable update, delete, and resolve functions
   - Fix TypeScript type issues
   - Test thoroughly

2. **Verify Plan Creation Works** ✅ HIGH PRIORITY  
   - Apply migration to remove fiscal year constraint
   - Test creating single-year plans
   - Test multi-year plans still work

3. **Adjust Rate Limiting** 📋 MEDIUM PRIORITY
   - Increase login attempt limits or disable app-level limiting
   - Document clearing rate limits for development

4. **Re-enable Collaboration API Auth** 📋 MEDIUM PRIORITY
   - Test that it doesn't interfere with server actions
   - Ensure both cookie and bearer token auth work correctly

5. **Add Better Error Messages** 📋 LOW PRIORITY
   - Add contextual error information throughout
   - Improve user-facing error messages

---

## Testing Checklist

### Critical Flows to Test:
- [ ] User login with various roles
- [ ] Creating strategic plans (single and multi-year)
- [ ] Adding goals to plans
- [ ] Creating initiatives
- [ ] Adding comments
- [ ] Editing comments
- [ ] Deleting comments
- [ ] Resolving comments
- [ ] User management (admin features)
- [ ] Department data display
- [ ] Navigation and routing

---

## Code Quality Improvements

### Type Safety
- Add proper TypeScript interfaces for all database queries
- Use Zod or similar for runtime validation
- Fix "any" types throughout codebase

### Error Handling
- Create consistent error response format
- Add error boundaries in React components
- Implement proper error logging

### Documentation
- Add JSDoc comments to complex functions
- Document RLS policies and their intent
- Create API documentation for routes

---

## Notes

- Auth system is solid with good security practices
- Database schema is well-structured
- Main issues are disabled functionality and constraint mismatches
- Overall code quality is good with room for improvements

---

## Next Steps

1. Enable disabled comment functions
2. Verify database migrations applied
3. Test critical user flows
4. Adjust rate limiting
5. Add comprehensive error handling
