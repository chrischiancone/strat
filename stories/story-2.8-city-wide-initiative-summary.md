# Story 2.8: City-Wide Initiative Summary

**Story ID:** STORY-2.8
**Epic:** Epic 2 - City Manager Reviews Plans
**Status:** ✅ Completed
**Priority:** P0 (High - MVP)
**Story Points:** 13
**Completed:** January 2025

---

## User Story

**As a** City Manager
**I want to** see a comprehensive summary of all strategic initiatives across departments
**So that** I can track progress, identify at-risk initiatives, and ensure strategic alignment

---

## Acceptance Criteria

- [x] Dashboard displays summary cards: Total Initiatives, At-Risk Count, Total Budget, Average Budget
- [x] Prominent alert banner for at-risk initiatives (if any exist)
- [x] At-risk initiatives list with department, priority, budget, and responsible party
- [x] Bar chart showing initiative count by priority level
- [x] Bar chart showing initiative count by status
- [x] Comprehensive initiatives table with all key columns
- [x] Table columns: Department, Initiative, Goal, Priority, Status, Year 1/2/3 costs, Total, Responsible Party
- [x] User can search initiatives by name
- [x] User can sort by any column (name, priority, status, budget)
- [x] User can paginate through initiatives (50 per page)
- [x] Links to initiative detail pages
- [x] Only City Manager and Admin can access

---

## Implementation Details

### Files Created:

1. **`/app/actions/city-initiatives.ts`** - Initiatives aggregation server action
   - `getCityWideInitiatives()` - Fetches all initiatives with comprehensive data
   - Supports search, filtering, sorting, pagination
   - Returns summary stats, counts by priority/status, at-risk list

2. **`/components/city-initiatives/InitiativeSummaryCards.tsx`** - Summary stat cards
   - Four cards: Total Initiatives, At-Risk, Total Budget, Average Budget
   - Color-coded alert for at-risk initiatives

3. **`/components/city-initiatives/AtRiskAlert.tsx`** - Prominent alert banner
   - Red alert box for at-risk initiatives
   - Shows initiative details with priority badges
   - Only displays if at-risk initiatives exist

4. **`/components/city-initiatives/InitiativeCountCharts.tsx`** - Count bar charts
   - Two charts: By Priority (NEED/WANT/NICE_TO_HAVE) and By Status
   - Color-coded bars matching badge colors
   - Uses recharts library

5. **`/components/city-initiatives/InitiativesTable.tsx`** - Comprehensive table
   - 10 columns with all key initiative data
   - Search input with debouncing
   - Sortable columns with visual indicators
   - Pagination controls
   - Links to initiative detail pages
   - Priority and status badges with colors

6. **`/components/city-initiatives/InitiativesDashboardContent.tsx`** - Main dashboard
   - Client component managing state
   - Coordinates search, sort, pagination
   - Loading and error states

7. **`/app/(dashboard)/city-manager/initiatives/page.tsx`** - Initiatives page
   - Role-based access control
   - Server component

### Key Features:

- **At-Risk Alerting:** Prominent visual alerts for initiatives needing attention
- **Multi-Dimensional Tracking:** By priority, status, department, budget
- **Search & Sort:** Find and organize initiatives quickly
- **Comprehensive Data:** All initiative details in one view
- **Performance:** Pagination and optimized queries

### Data Sources:

Aggregates from:
- `initiatives` table (joined with goals, plans, departments)
- Calculates at-risk count based on status
- Computes budget totals and averages

---

## Testing Notes

**Test Scenarios:**
1. ✅ Dashboard displays all summary cards
2. ✅ At-risk alert displays when applicable
3. ✅ Count charts render correctly
4. ✅ Table displays all columns with data
5. ✅ Search filters initiatives by name
6. ✅ Sorting works for all sortable columns
7. ✅ Pagination navigates correctly
8. ✅ Links to initiative details work
9. ✅ Only authorized users can access

**Performance:**
- Loads < 3 seconds with 200+ initiatives
- Search debounce prevents excessive queries

---

## Related Stories

- Story 2.7: City-Wide Budget Dashboard (similar dashboard pattern)
- Story 2.9: Generate City Council Report (uses similar data)

---

## Technical Decisions

**Search Implementation:** Client-side filtering
- Reason: Fast, no server round-trips, good UX

**Pagination:** Server-side
- Reason: Performance with large datasets

**Sort:** Client-side for displayed page
- Reason: Instant feedback, simpler implementation

---

## Notes

- Initiative tracking is critical for City Manager to monitor strategic progress
- At-risk alerting helps proactively address problems
- Comprehensive view enables data-driven decision making
- Future enhancement: Export to Excel, advanced filtering
