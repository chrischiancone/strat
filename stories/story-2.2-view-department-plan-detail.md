# Story 2.2: View Department Plan Detail (Read-Only)

**Story ID:** STORY-2.2
**Epic:** Epic 2 - City Manager Reviews Plans
**Status:** ✅ Completed
**Priority:** P0 (Critical - MVP)
**Story Points:** 5
**Completed:** January 2025

---

## User Story

**As a** City Manager
**I want to** view a department's strategic plan in detail
**So that** I can review their goals, initiatives, and budgets

---

## Acceptance Criteria

- [x] City Manager can navigate to any department's plan
- [x] Plan displays all sections: Overview, SWOT, Goals, Initiatives, Budgets, KPIs
- [x] View is read-only (City Manager cannot edit plan content)
- [x] Navigation allows jumping to specific sections (goals, initiatives)
- [x] Breadcrumb navigation shows: Dashboard > Department > Plan

---

## Implementation Details

### Files Created/Modified:

1. **`/app/(dashboard)/plans/[id]/page.tsx`** - Plan detail page
   - Displays full plan details
   - Role-based read access for City Manager
   - Tab navigation for different sections

2. **Plan already uses existing Epic 1 components:**
   - `PlanOverview` - Basic plan information
   - `SwotAnalysis` - SWOT analysis display
   - `GoalsList` - Strategic goals
   - `InitiativesList` - Initiatives with budgets
   - `KPIsList` - Key performance indicators

### Access Control:

**City Manager can:**
- View all plans from all departments (read-only)
- Add comments on plans (Story 2.3)
- Approve/reject plans (Story 2.6)

**City Manager cannot:**
- Edit plan content
- Delete plans
- Create goals or initiatives

### Key Features:

- **Full Visibility:** City Manager sees everything Department Director sees
- **Read-Only Mode:** Editing controls hidden for City Manager role
- **Comment Integration:** Can add feedback via comments (Story 2.3)
- **Approval Actions:** Approve/reject buttons visible (Story 2.6)

### RLS Policies:

Modified `strategic_plans` RLS to allow:
```sql
-- City Manager can SELECT all plans
CREATE POLICY "city_manager_view_all_plans" ON strategic_plans
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users
      WHERE role IN ('city_manager', 'admin')
    )
  );
```

---

## Testing Notes

**Test Scenarios:**
1. ✅ City Manager can view plans from any department
2. ✅ All plan sections display correctly
3. ✅ Edit buttons are hidden for City Manager
4. ✅ Navigation between sections works
5. ✅ Breadcrumb shows correct path
6. ✅ City Manager cannot access edit routes

**Security:**
- Verified RLS prevents City Manager from updating plans
- API routes enforce read-only access

---

## Related Stories

- Story 2.1: View All Department Plans Dashboard (entry point)
- Story 2.3: Add Comments (feedback mechanism)
- Story 2.6: Approve/Reject Plans (approval actions)

---

## Notes

- Reuses Epic 1 components (DRY principle)
- Read-only access is enforced at multiple levels:
  - UI: No edit buttons shown
  - RLS: Database prevents updates
  - API: Server actions check permissions
- City Manager gets same detailed view as Department Director
- Future enhancement: Side-by-side plan comparison
