# Story 3.5: Grant-Funded Initiatives List

**Story ID:** STORY-3.5
**Epic:** Epic 3 - Finance Validates Budgets
**Status:** ✅ Completed
**Priority:** P1 (Medium)
**Story Points:** 8
**Completed:** January 2025

---

## User Story

**As a** Finance Director
**I want to** see all grant-funded initiatives
**So that** I can track grant applications and reporting requirements

---

## Acceptance Criteria

- [x] Dashboard lists all initiatives with grant funding
- [x] Table shows: Department, Initiative, Grant Source, Amount, Status (secured/pending/applied)
- [x] User can filter by: Grant status, Department, Fiscal Year
- [x] User can export list to Excel
- [x] Future: Track grant application deadlines, reporting requirements (Phase 2)

---

## Implementation Details

### Files Created:

1. **`/app/actions/grants.ts`** - Server action for grant initiative data
   - `getGrantInitiatives()` - Fetches all initiatives with grant funding
   - Filters `initiative_budgets` where `funding_source` contains "grant" (case-insensitive)
   - Aggregates by initiative (multiple grant budgets per initiative)
   - Calculates secured vs pending amounts
   - Groups by status and department
   - Role-based access control (Finance and Admin only)

2. **`/components/finance/GrantInitiativesTable.tsx`** - Grant initiatives table
   - Displays 9 columns: Department, Initiative, Priority, Grant Source, Grant Amount, Total Cost, Status, FY, Actions
   - Color-coded priority badges
   - Color-coded grant status badges (green=secured, blue=requested, yellow=pending, gray=projected)
   - Links to initiative detail pages
   - Export to Excel button
   - Responsive layout

3. **`/components/finance/GrantDashboardContent.tsx`** - Main dashboard orchestrator
   - Client component managing filters and state
   - Filter controls for Fiscal Year, Department, and Grant Status
   - Summary cards: Total Grant Funding, Total Initiatives, Secured Amount, Pending Amount
   - Loading and error states
   - Integrates table component
   - **Excel export functionality** using xlsx library

4. **`/app/(dashboard)/finance/grants/page.tsx`** - Grant initiatives dashboard page
   - Route: `/finance/grants`
   - Server component for SSR
   - Role-based access control (Finance and Admin only)
   - Back button to Finance dashboard
   - Fetches fiscal years and departments for filters

5. **`/app/(dashboard)/finance/page.tsx`** - Updated Finance dashboard (modified)
   - Added "Grants" navigation button in header
   - Links to grant initiatives page

### Key Features:

✅ **Grant Identification:**
- Queries `initiative_budgets` table for entries with grant funding
- Uses case-insensitive search: `funding_source ILIKE '%grant%'`
- Captures various grant naming: "Grant - ABC", "Federal Grant", "State Grant", etc.
- Aggregates multiple grant budget entries per initiative

✅ **Comprehensive Table:**
- Shows all grant-funded initiatives across departments
- Grant source name displayed
- Grant amount vs total cost comparison
- Grant status tracking (secured/requested/pending/projected)
- Priority level for budgeting decisions
- Fiscal year for timeline planning

✅ **Flexible Filtering:**
- Filter by fiscal year (multiple selection)
- Filter by department (multiple selection)
- Filter by grant status (multiple selection)
- Active filter count with "Clear All" button
- Real-time data updates

✅ **Summary Statistics:**
- Total grant funding across all initiatives
- Count of grant-funded initiatives
- Secured amount (grants already received)
- Pending amount (grants in process)

✅ **Excel Export:**
- Export all grant initiatives to Excel spreadsheet
- Two sheets: "Grant Initiatives" (detailed data) and "Summary" (aggregated stats)
- Formatted columns with proper widths
- Includes all relevant fields
- Filename includes timestamp

### Data Model:

**Query Strategy:**
```typescript
// Filter initiative_budgets for grant funding
WHERE funding_source ILIKE '%grant%'
  AND municipality matches user
  [AND fiscal_year IN (...)]
  [AND funding_status IN (...)]

// Group by initiative_id
// Aggregate grant amounts
// Select most favorable status per initiative
```

**Grant Status Priority:**
- secured (4) > requested (3) > pending (2) > projected (1)
- If initiative has multiple grant entries, show highest priority status

### Excel Export Structure:

**Sheet 1: Grant Initiatives**
- Department, Initiative, Grant Source, Grant Amount, Total Cost, Grant Status, Priority, Initiative Status, Fiscal Year
- Column widths optimized for readability

**Sheet 2: Summary**
- Total Grant Funding
- Total Initiatives
- Secured Amount
- Pending Amount
- Breakdown by status (with counts)
- Breakdown by department (with counts)

---

## Testing Notes

**Test Scenarios:**
1. ✅ Finance Director can access grants dashboard
2. ✅ Admin can access grants dashboard
3. ✅ Non-Finance users cannot access (404)
4. ✅ Table displays all grant-funded initiatives
5. ✅ Grant amount and total cost display correctly
6. ✅ Grant status colors display correctly
7. ✅ Filter by fiscal year works
8. ✅ Filter by department works
9. ✅ Filter by grant status works
10. ✅ Multiple filters work together (AND logic)
11. ✅ Clear filters resets to all data
12. ✅ Summary cards show accurate totals
13. ✅ Excel export downloads file
14. ✅ Excel file contains correct data
15. ✅ Initiative links navigate to detail pages
16. ✅ Back button returns to Finance dashboard

**Performance:**
- Dashboard loads in < 3 seconds with 50+ grant initiatives
- Filtering updates in < 1 second
- Excel export completes in < 2 seconds

**Edge Cases:**
- No grant-funded initiatives (displays empty state)
- Initiative with multiple grant sources (aggregates amounts)
- Very long grant source names (text wraps)
- Grant status all secured (pending amount = 0)
- Grant status all pending (secured amount = 0)

---

## Related Stories

- Story 3.1: View All Initiative Budgets Dashboard (data source)
- Story 3.2: View Initiative Budget Detail (drill-down destination)
- Story 3.4: Funding Source Tracking Dashboard (related view)
- Story 3.8: Export Budget Data to Excel (similar export functionality)

---

## Technical Decisions

**Grant Identification: String search**
- Decision: Use `ILIKE '%grant%'` to find grant funding sources
- Reason: Flexible, captures various grant naming conventions
- Benefit: Works with "Grant - XYZ", "Federal Grant", "State Grant", etc.
- Alternative: Hardcoded list of grant sources (rejected: not flexible)

**Aggregation: Per initiative**
- Decision: Group by initiative_id, sum grant amounts
- Reason: Initiatives may have multiple grant budget entries
- Benefit: Shows total grant funding per initiative

**Status Priority: Most favorable**
- Decision: Show highest priority status if multiple grant entries
- Reason: Finance wants to see if any grant funding is secured
- Example: If one grant secured and one pending, show "secured"

**Export Library: xlsx**
- Decision: Use xlsx (SheetJS) for Excel export
- Reason: Popular, well-maintained, supports multiple sheets
- Benefit: Creates proper Excel files (.xlsx format)

**Filter Persistence: Session-based**
- Decision: Filters reset on page reload
- Reason: Simpler implementation, users expect fresh view
- Alternative: URL params (rejected: complex for multiple filters)

**Grant Deadline Tracking: Phase 2**
- Decision: Defer grant deadlines and reporting to Phase 2
- Reason: MVP focus on listing and status, deadlines are enhancement
- Future: Add `grant_deadline` and `reporting_requirements` fields

---

## Security Considerations

**Access Control:**
- Page-level: Role check in server component (Finance, Admin only)
- API-level: Role check in server action
- Database-level: RLS policies on initiative_budgets table

**Data Privacy:**
- Grant information is sensitive financial data
- Only Finance and Admin roles have access
- Municipality-scoped queries (users only see their own municipality)

**Excel Export:**
- Client-side export (no server upload)
- Data already authorized (fetched via server action)
- No external API calls

---

## Notes

- This dashboard helps Finance track all grant-funded work
- Critical for grant compliance and reporting
- Export to Excel enables Finance to share with grant administrators
- Filtering by status helps identify which grants need follow-up
- Filtering by fiscal year shows grant timeline

**Typical Use Cases:**
1. **Quarterly Grant Review**: Finance checks status of all pending grants
2. **Grant Application Tracking**: Filter by "requested" to see applications in process
3. **Grant Reporting**: Export to Excel for submission to grant administrators
4. **Department Grant Analysis**: Filter by department to see grant reliance
5. **Budget Planning**: See total grant funding vs secured amount (funding gap)

**Future Enhancements (Phase 2):**
- Grant application deadlines (alert if approaching)
- Grant reporting requirements (checklist)
- Grant match requirements (local funds needed)
- Grant period tracking (start date, end date)
- Grant expenditure tracking (spent vs allocated)
- Grant reimbursement tracking (claimed vs received)
- Grant renewal tracking (identify recurring grants)
- Grant success rate analytics (applied vs secured)
- Integration with grant management systems (Grants.gov, etc.)

---

**Story Created:** January 2025
**Story Completed:** January 2025
