# Story 3.4: Funding Source Tracking Dashboard

**Story ID:** STORY-3.4
**Epic:** Epic 3 - Finance Validates Budgets
**Status:** ✅ Completed
**Priority:** P0 (High - MVP)
**Story Points:** 13
**Completed:** January 2025

---

## User Story

**As a** Finance Director
**I want to** see total funding by source across all initiatives
**So that** I can track how much we're relying on each funding source

---

## Acceptance Criteria

- [x] Dashboard displays total budget by funding source (pie chart)
- [x] Dashboard displays table with: Funding Source, Total Amount, # Initiatives, Secured Amount, Pending Amount
- [x] Alert if General Fund over-committed (>100% of budget capacity)
- [x] User can click funding source to see all initiatives using that source
- [x] User can filter by: Fiscal Year, Status (secured vs. pending)

---

## Implementation Details

### Files Created:

1. **`/app/actions/funding-sources.ts`** - Server action for funding source aggregation
   - `getFundingSourceData()` - Aggregates budget data by funding source
   - `getInitiativesByFundingSource()` - Returns initiatives for a specific funding source
   - Queries `initiative_budgets` table with `funding_source` and `funding_status` fields
   - Calculates secured vs pending amounts
   - Detects General Fund over-commitment
   - Role-based access control (Finance and Admin only)

2. **`/components/finance/FundingSourcePieChart.tsx`** - Pie chart visualization
   - Uses recharts library for interactive pie chart
   - Color-coded segments for each funding source
   - Percentage labels on segments (if > 5%)
   - Legend with funding source names and amounts
   - Formatted currency tooltips
   - Responsive layout

3. **`/components/finance/FundingSourceTable.tsx`** - Interactive funding source table
   - Expandable rows to show initiatives per funding source
   - Columns: Funding Source, Total Amount, # Initiatives, Secured, Pending
   - Click-to-expand functionality
   - Drill-down shows initiative list with links to detail pages
   - Color-coded amounts (green for secured, amber for pending)
   - Department name displayed for each initiative

4. **`/components/finance/FundingSourceDashboardContent.tsx`** - Main dashboard orchestrator
   - Client component managing filters and state
   - Filter controls for Fiscal Year and Funding Status
   - Summary cards: Total Budget, Funding Sources count, General Fund Status
   - Over-commitment alert with red warning banner
   - Loading and error states
   - Integrates pie chart and table components

5. **`/app/(dashboard)/finance/funding-sources/page.tsx`** - Funding source dashboard page
   - Route: `/finance/funding-sources`
   - Server component for SSR
   - Role-based access control (Finance and Admin only)
   - Back button to Finance dashboard
   - Fetches fiscal years for filter options

6. **`/app/(dashboard)/finance/page.tsx`** - Updated Finance dashboard (modified)
   - Added navigation button to Funding Sources page
   - "Funding Sources" button in header

### Key Features:

✅ **Funding Source Aggregation:**
- Aggregates budget data from `initiative_budgets` table
- Groups by `funding_source` field
- Calculates total amount, initiative count, secured/pending breakdown
- Sorts by total amount (highest first)

✅ **Pie Chart Visualization:**
- Interactive pie chart showing budget distribution
- Color-coded segments for visual distinction
- Percentage labels for easy interpretation
- Legend with amounts for each source

✅ **Detailed Table View:**
- Expandable rows for drill-down into initiatives
- Shows secured vs pending amounts
- Color-coding for funding status
- Links to initiative detail pages

✅ **Over-Commitment Detection:**
- Compares General Fund commitment to capacity
- Red alert banner if over-committed
- Shows over-commitment amount
- Recommends action (review initiatives, adjust funding)

✅ **Flexible Filtering:**
- Filter by fiscal year (multiple selection)
- Filter by funding status (secured, requested, pending, projected)
- Active filter count with "Clear All" button
- Real-time data updates on filter change

✅ **Initiative Drill-Down:**
- Click funding source to expand initiatives list
- Shows initiative name, department, total cost, funding status
- Links directly to initiative detail page for review

### Data Model:

**initiative_budgets table:**
- `funding_source` TEXT - Source of funding (General Fund, Grants, Bonds, Fees, Other)
- `funding_status` TEXT - Status (secured, requested, pending, projected)
- `amount` NUMERIC - Budget amount for this category
- `fiscal_year_id` UUID - Associated fiscal year
- `initiative_id` UUID - Parent initiative

**Aggregation Logic:**
```typescript
// Group budgets by funding_source
// For each source:
//   - Total amount = SUM(amount)
//   - Initiative count = COUNT(DISTINCT initiative_id)
//   - Secured amount = SUM(amount WHERE funding_status = 'secured')
//   - Pending amount = SUM(amount WHERE funding_status IN ('requested', 'pending', 'projected'))
```

---

## Testing Notes

**Test Scenarios:**
1. ✅ Finance Director can access funding sources dashboard
2. ✅ Admin can access funding sources dashboard
3. ✅ Non-Finance users cannot access (404)
4. ✅ Pie chart displays correctly with all funding sources
5. ✅ Table shows correct totals per funding source
6. ✅ Secured and pending amounts calculate correctly
7. ✅ Initiative count matches distinct initiatives
8. ✅ Clicking funding source expands initiatives list
9. ✅ Initiative links navigate to correct detail pages
10. ✅ Filter by fiscal year works correctly
11. ✅ Filter by funding status works correctly
12. ✅ Multiple filters work together (AND logic)
13. ✅ Clear filters resets to all data
14. ✅ Over-commitment alert shows when General Fund exceeds capacity
15. ✅ Over-commitment amount calculates correctly
16. ✅ Summary cards display accurate totals

**Performance:**
- Dashboard loads in < 3 seconds with 100+ initiatives
- Filtering updates in < 1 second
- Expand/collapse is instant

**Edge Cases:**
- No funding source data (displays empty state)
- All funding secured (no alert shown)
- Single funding source (pie chart still renders)
- Many funding sources (pie chart scrollable legend)
- Very long funding source names (text wraps)
- No initiatives using a specific funding source (message shown)

---

## Related Stories

- Story 3.1: View All Initiative Budgets Dashboard (source of budget data)
- Story 3.2: View Initiative Budget Detail (drill-down destination)
- Story 3.3: Comment on Initiative Budgets (Finance feedback mechanism)
- Story 3.5: Grant-Funded Initiatives List (related funding analysis)
- Story 3.6: Budget Category Analysis (alternative budget view)

---

## Technical Decisions

**Data Source: initiative_budgets table**
- Decision: Query initiative_budgets, not initiatives.funding_sources array
- Reason: initiative_budgets has funding_status field, more granular data
- Benefit: Can distinguish secured vs pending funding at budget line item level

**Aggregation: Server-side**
- Decision: Aggregate funding source data in server action
- Reason: Complex joins and calculations, better performance on server
- Benefit: Reduces payload size, leverages database indexes

**Over-Commitment Threshold: Placeholder**
- Decision: Use hardcoded $10M General Fund capacity for MVP
- Reason: Municipality settings table not yet implemented
- TODO: Make configurable per municipality (Story 4.x)

**Drill-Down: Expandable rows**
- Decision: Show initiatives inline when clicking funding source
- Reason: Keeps user on same page, faster than navigation
- Alternative: Navigate to filtered initiatives list (rejected: extra navigation step)

**Filter Persistence: Session-based**
- Decision: Filters reset on page reload
- Reason: Simpler implementation, users expect fresh view
- Alternative: URL params or localStorage (rejected: added complexity for MVP)

**Chart Library: recharts**
- Decision: Use recharts (already in project)
- Reason: React-friendly, good performance, customizable
- Alternatives: Chart.js, D3.js (rejected: more complex, heavier)

---

## Security Considerations

**Access Control:**
- Page-level: Role check in server component (Finance, Admin only)
- API-level: Role check in server actions
- Database-level: RLS policies on initiative_budgets table

**Data Privacy:**
- Funding source data is sensitive financial information
- Only Finance and Admin roles have access
- Municipality-scoped queries (users only see their own municipality)

**Performance:**
- Database indexes on `fiscal_year_id` and `funding_source` columns
- Query optimizes with proper JOIN strategy
- Pagination not needed (funding sources typically < 10)

---

## Notes

- This dashboard is critical for Finance to identify funding gaps
- Over-commitment detection helps prevent budget deficits
- Drill-down to initiatives enables Finance to see exactly what's consuming each funding source
- Filtering by fiscal year shows funding trends over time
- Filtering by status shows what funding is secured vs still pending

**Typical Use Cases:**
1. **Weekly Budget Review**: Finance checks if General Fund over-committed
2. **Grant Planning**: Filter to see all grant-funded initiatives, check if diversified
3. **City Council Presentation**: Export pie chart showing funding source breakdown
4. **Budget Adjustment**: Identify initiatives using General Fund, move some to Grants
5. **Funding Gap Analysis**: See which sources have pending (not secured) funding

**Future Enhancements:**
- Make General Fund capacity configurable per municipality
- Add historical trending (compare funding sources year-over-year)
- Export to Excel with detailed breakdown
- Alert system (email notification when over-committed)
- Budget scenario planning (what-if analysis)
- Funding source capacity tracking (not just General Fund)
- Grant deadline tracking (integrate with grant management)
- Funding source recommendations (suggest alternative sources)

---

**Story Created:** January 2025
**Story Completed:** January 2025
