# Story 2.7: City-Wide Budget Dashboard

**Story ID:** STORY-2.7
**Epic:** Epic 2 - City Manager Reviews Plans
**Status:** ✅ Completed
**Priority:** P0 (High - MVP)
**Story Points:** 13
**Completed:** January 2025

---

## User Story

**As a** City Manager
**I want to** see consolidated budget data across all department strategic plans
**So that** I can understand total city investment and make informed resource allocation decisions

---

## Acceptance Criteria

- [x] Dashboard displays summary cards: Total Budget, Total Initiatives, Total Departments, Total Plans
- [x] Chart showing budget breakdown by fiscal year (bar chart)
- [x] Chart showing budget by department (horizontal bar chart, top 10)
- [x] Chart showing budget by funding source (pie chart with percentages)
- [x] Chart showing budget by category (if available)
- [x] Table of top 10 initiatives by budget with drill-down links
- [x] User can filter by: Fiscal Year, Department, Priority Level
- [x] Dashboard updates dynamically based on filter selections
- [x] All currency values formatted properly ($X,XXX,XXX)
- [x] Charts are responsive and visually clear

---

## Implementation Details

### Files Created:

1. **`/app/actions/city-budget.ts`** - Budget aggregation server action
   - `getCityWideBudget()` - Aggregates budget across all plans
   - Supports filtering by fiscal year, department, priority
   - Returns summary stats and breakdowns by multiple dimensions

2. **`/components/city-budget/BudgetSummaryCards.tsx`** - Summary stat cards
   - Four cards: Total Budget, Initiatives, Departments, Plans
   - Icons and formatted currency

3. **`/components/city-budget/BudgetByYearChart.tsx`** - Fiscal year bar chart
   - Uses recharts library
   - Shows budget distribution across years

4. **`/components/city-budget/BudgetByDepartmentChart.tsx`** - Department bar chart
   - Horizontal bars for top 10 departments
   - Color-coded for visual distinction

5. **`/components/city-budget/BudgetByFundingSourceChart.tsx`** - Funding pie chart
   - Shows percentage breakdown
   - Custom labels with amounts and percentages

6. **`/components/city-budget/BudgetFilters.tsx`** - Interactive filters
   - Multi-select checkboxes for departments, fiscal years, priorities
   - Active filter badges with remove option
   - Apply/Clear buttons

7. **`/components/city-budget/TopInitiativesTable.tsx`** - Top 10 table
   - Shows highest-budget initiatives
   - Links to initiative details

8. **`/components/city-budget/BudgetDashboardContent.tsx`** - Main dashboard component
   - Client component managing state
   - Coordinates all sub-components

9. **`/app/(dashboard)/city-manager/budget/page.tsx`** - Budget dashboard page
   - Role-based access control
   - Server component for data fetching

### Key Features:

- **Multi-Dimensional Analysis:** Budget by year, department, funding, category
- **Interactive Filtering:** Real-time updates based on filter selections
- **Visual Analytics:** Multiple chart types for easy comprehension
- **Drill-Down Capability:** Click to view initiative details
- **Performance Optimized:** Efficient aggregation queries

### Data Aggregation:

Aggregates data from:
- `strategic_plans` → `goals` → `initiatives` → `initiative_budgets`
- Calculates totals across multiple dimensions
- Handles filtering at query level for performance

---

## Testing Notes

**Test Scenarios:**
1. ✅ Dashboard displays all summary cards correctly
2. ✅ All charts render with accurate data
3. ✅ Filters update dashboard dynamically
4. ✅ Top initiatives table shows correct data
5. ✅ Currency formatting is consistent
6. ✅ Only City Manager and Admin can access

**Performance:**
- Dashboard loads in < 3 seconds with 100+ initiatives
- Charts are responsive on mobile devices

---

## Related Stories

- Story 2.8: City-Wide Initiative Summary (similar dashboard pattern)
- Story 2.10: Export Budget Data to Excel (export functionality)

---

## Technical Decisions

**Chart Library:** recharts
- Reason: React-native, good TypeScript support, customizable

**Data Fetching:** Server Actions
- Reason: Role-based access control, server-side aggregation

**State Management:** React useState/useEffect
- Reason: Simple, no need for global state

---

## Notes

- Budget dashboard is a key decision-making tool for City Manager
- Provides visibility into resource allocation across departments
- Filtering allows for scenario analysis (e.g., "what if we cut Grants?")
- Future enhancement: Historical trend comparison across years
