# Story 2.1: View All Department Plans Dashboard

**Story ID:** STORY-2.1
**Epic:** Epic 2 - City Manager Reviews Plans
**Status:** ✅ Completed
**Priority:** P0 (Critical - MVP)
**Story Points:** 8
**Completed:** January 2025

---

## User Story

**As a** City Manager
**I want to** see a dashboard of all department strategic plans
**So that** I can quickly understand the status of city-wide strategic planning

---

## Acceptance Criteria

- [x] Dashboard displays table/cards of all departments' plans
- [x] Each entry shows: Department name, Plan title, Status, Fiscal years, Total budget, Initiative count
- [x] User can filter by: Status, Fiscal Year, Department
- [x] User can sort by: Department, Budget, Status, Last updated
- [x] User can click a plan to drill into detail view
- [x] Dashboard shows summary stats at top: Total plans, Plans by status, Total city-wide budget

---

## Implementation Details

### Files Created/Modified:

1. **`/app/(dashboard)/city-manager/page.tsx`** - Main City Manager dashboard page
   - Displays all strategic plans across departments
   - Role-based access control (City Manager and Admin only)
   - Server component fetching plans data

2. **`/app/actions/strategic-plans.ts`** - Plan data server actions
   - `getCityManagerDashboard()` - Fetches all plans with filters
   - Supports filtering by status, fiscal year, department
   - Supports sorting by multiple fields
   - Returns summary statistics

3. **`/components/city-manager/DashboardStats.tsx`** - Summary statistics cards
   - Shows total plans, plans by status, total budget
   - Color-coded status indicators

4. **`/components/city-manager/PlansTable.tsx`** - Plans data table
   - Displays all plan details in sortable table
   - Department, title, status badges, fiscal year, budget, initiative count
   - Clickable rows to view plan details

5. **`/components/city-manager/DashboardFilters.tsx`** - Filter controls
   - Dropdown filters for status, fiscal year, department
   - Active filter indicators
   - Clear filters button

### Key Features:

- **Comprehensive View:** All department plans in one dashboard
- **Status Tracking:** Visual badges for plan status (draft, under_review, approved, etc.)
- **Budget Visibility:** Total budget displayed for each plan
- **Quick Navigation:** Click any plan to view details
- **Flexible Filtering:** Multi-dimensional filtering capabilities
- **Sortable Columns:** Sort by any metric

### Data Sources:

Queries `strategic_plans` table with joins to:
- `departments` - Department information
- `fiscal_years` - Fiscal year details
- `goals` - To count goals
- `initiatives` - To count initiatives and sum budgets

---

## Testing Notes

**Test Scenarios:**
1. ✅ Dashboard displays all plans from all departments
2. ✅ Summary cards show accurate totals
3. ✅ Filters update table correctly
4. ✅ Sorting works for all columns
5. ✅ Click plan row navigates to detail page
6. ✅ Only City Manager and Admin can access
7. ✅ Empty state displays when no plans exist

**Performance:**
- Dashboard loads in < 2 seconds with 20+ plans

---

## Related Stories

- Story 2.2: View Department Plan Detail (navigation target)
- Story 2.6: Approve/Reject Plans (status management)
- Story 2.7: City-Wide Budget Dashboard (related dashboard)

---

## Notes

- This is the primary landing page for City Manager
- Provides oversight of all department strategic planning activity
- Critical for identifying plans that need review or approval
- Future enhancement: Export plan list to Excel
