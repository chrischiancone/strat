# Story 3.3: Filter by Funding Status

**Story ID:** STORY-3.3
**Epic:** Epic 3 - Finance Validates Budgets
**Status:** ✅ Completed
**Priority:** P1 (Must have)
**Story Points:** 3
**Completed:** January 2025

---

## User Story

**As a** Finance Director
**I want to** filter initiative budgets by funding status (secured, requested, pending, projected)
**So that** I can focus on initiatives with specific funding readiness levels

---

## Acceptance Criteria

- [x] Finance can filter budgets by funding status in the dashboard
- [x] Multiple funding statuses can be selected simultaneously
- [x] Filter options: Secured, Requested, Pending, Projected
- [x] Filtered results show only initiatives matching selected funding status
- [x] Filter integrates with existing filters (department, fiscal year, priority, funding source)
- [x] Filter state displays in active filters count
- [x] Clear all filters resets funding status selection
- [x] Export respects funding status filters

---

## Implementation Details

### Files Modified:

1. **`/app/actions/finance-budgets.ts`** - Server action updates
   - Updated `FinanceBudgetFilters` interface:
     ```typescript
     export interface FinanceBudgetFilters {
       department_ids?: string[]
       fiscal_year_ids?: string[]
       priority_levels?: string[]
       funding_sources?: string[]
       funding_statuses?: string[] // NEW
       search?: string
     }
     ```
   - Modified `getFinanceInitiativeBudgets()` to apply funding status filter:
     - Queries `initiative_budgets` table for matching funding status
     - Filters initiatives to only those with matching budget items
     - Uses Set for efficient O(1) lookup performance
   - Modified `getFinanceBudgetExportData()` with same filter logic:
     - Ensures export respects funding status filters
     - Maintains consistency between dashboard and export

2. **`/components/finance/BudgetFilters.tsx`** - Filter UI component
   - Added `FUNDING_STATUSES` constant array:
     ```typescript
     const FUNDING_STATUSES = [
       { value: 'secured', label: 'Secured' },
       { value: 'requested', label: 'Requested' },
       { value: 'pending', label: 'Pending' },
       { value: 'projected', label: 'Projected' },
     ]
     ```
   - Added state management:
     ```typescript
     const [selectedFundingStatuses, setSelectedFundingStatuses] = useState<string[]>([])
     ```
   - Updated `handleApplyFilters()`:
     - Includes `funding_statuses` parameter in filter object
   - Updated `handleClearFilters()`:
     - Resets `selectedFundingStatuses` to empty array
   - Updated `activeFiltersCount`:
     - Includes `selectedFundingStatuses.length` in calculation
   - Added Funding Status filter section:
     - Checkbox list with 4 status options
     - Uses `toggleSelection()` helper for state management
     - Consistent styling with other filter sections
   - Extended grid layout:
     - Changed from `lg:grid-cols-4` to `lg:grid-cols-5`
     - Accommodates 5 filter categories (Fiscal Years, Departments, Priority, Funding Sources, Funding Status)

### Key Features:

✅ **Multiple Selection:**
- Users can select multiple funding statuses simultaneously
- Results show initiatives matching ANY of the selected statuses (OR logic)
- Example: Selecting "Secured" and "Requested" shows both secured and requested initiatives

✅ **Integration with Existing Filters:**
- Works alongside department, fiscal year, priority, and funding source filters
- All filters applied with AND logic between filter types
- Example: "Parks Department" AND "Secured funding" AND "NEED priority"

✅ **Database Query Strategy:**
- Funding status stored in `initiative_budgets` table (child table)
- Filter queries budget items for matching status
- Returns unique initiative IDs with matching budget items
- Main initiative list filtered to matching IDs only

✅ **Performance Optimization:**
- Uses Set data structure for O(1) initiative ID lookups
- Minimizes database queries (2 queries: initiatives + budget items)
- In-memory filtering after data retrieval

✅ **User Experience:**
- Clear visual feedback: Active filter count updates
- Consistent styling with other filter sections
- Checkbox interactions feel natural and responsive
- "Clear All" resets all filters including funding status

---

## Testing Notes

**Test Scenarios:**
1. ✅ Filter by single funding status (e.g., "Secured")
2. ✅ Filter by multiple funding statuses (e.g., "Secured" + "Requested")
3. ✅ Combine funding status with department filter
4. ✅ Combine funding status with fiscal year filter
5. ✅ Combine funding status with priority level filter
6. ✅ Combine funding status with funding source filter
7. ✅ Combine funding status with all other filters simultaneously
8. ✅ Active filter count includes funding status selections
9. ✅ Clear all filters resets funding status
10. ✅ Export respects funding status filters
11. ✅ Filter persists during pagination
12. ✅ Filter persists during sorting
13. ✅ Responsive design works on mobile/tablet/desktop

**Performance:**
- Filter application: < 500ms
- Table refresh: < 1 second
- No noticeable lag with multiple filters

**Edge Cases:**
- Initiative with multiple budget items of different statuses (shows if ANY match)
- Initiative with no budget items (excluded from results)
- No initiatives match selected status (shows empty state)

---

## Related Stories

- Story 3.1: View All Initiative Budgets Dashboard (provides base filtering)
- Story 3.2: View Initiative Budget Detail (shows budget items with statuses)
- Story 3.4: Filter by Funding Source (similar filter pattern)
- Story 3.5: Grant-Funded Initiatives List (uses funding source filter)
- Story 3.8: Export Budget Data to Excel (respects funding status filters)

---

## Technical Decisions

**Filter Location: initiative_budgets table**
- Decision: Query `initiative_budgets` table for funding status
- Reason: Funding status is property of budget line items, not initiatives
- Note: An initiative may have multiple budget items with different statuses
- Result: Initiative shown if ANY budget item matches selected status

**Filter Logic: OR within category, AND between categories**
- Decision: Multiple funding statuses use OR logic (match ANY)
- Reason: Users want to see initiatives with "Secured OR Requested" funding
- Example: Selecting "Secured" and "Requested" shows both types
- Between categories: Department AND Funding Status AND Priority (all must match)

**Performance: Set-based filtering**
- Decision: Use Set data structure for initiative ID matching
- Reason: O(1) lookup performance vs O(n) for array.includes()
- Implementation: Convert matching IDs to Set, filter main array against Set
- Benefit: Efficient even with large datasets

**UI Layout: 5-column grid**
- Decision: Extend grid from 4 to 5 columns on large screens
- Reason: Accommodate new funding status filter without wrapping
- Responsive: 2 columns on medium screens, 5 on large screens
- Alternative: Keep 4 columns, wrap to 2 rows (rejected: less clean)

**State Management: Local component state**
- Decision: Store selected statuses in component state
- Reason: Simple, no need for global state
- Pattern: Consistent with other filter selections
- Benefit: Easy to reset with Clear All button

**Filter Application: Server-side enforcement**
- Decision: Apply filter in server action, not client-side
- Reason: Data security, consistency with other filters
- Benefit: Prevents unauthorized data access
- Note: Client sends filter parameters, server enforces them

---

## Security Considerations

**Access Control:**
- Page-level: Finance/Admin only can access budget dashboard
- Data-level: RLS policies on initiatives and initiative_budgets tables
- No additional security needed for this filter

**Data Integrity:**
- Funding status values validated against enum: 'secured', 'requested', 'pending', 'projected'
- Invalid values ignored by database query
- No SQL injection risk (using Supabase parameterized queries)

**Performance:**
- Filter does not expose performance vulnerabilities
- Query limited by pagination (25 items per page)
- No unbounded queries or N+1 problems

---

## Notes

- This feature is P1 (must have) because funding status is critical for financial planning
- Complements Story 3.4 (Filter by Funding Source) for comprehensive budget filtering
- Funding status indicates readiness: secured = guaranteed, projected = future estimates

**Typical Use Cases:**
1. **Secured Funding Only**: Filter to see only fully-funded initiatives
2. **Pending/Requested Review**: Focus on initiatives awaiting funding decisions
3. **Projected Planning**: Review initiatives with estimated future funding
4. **Multi-status Analysis**: Compare secured vs requested initiatives side-by-side

**Finance Director Workflow:**
1. Open Finance Budget Dashboard
2. Click "Funding Status" filter section
3. Select desired statuses (e.g., "Requested" + "Pending")
4. Click "Apply Filters"
5. View filtered list of initiatives needing funding approval
6. Export filtered data for funding committee presentation

**Database Schema Context:**
- `initiative_budgets` table stores budget line items
- Each budget item has `funding_status` field (enum)
- One initiative can have multiple budget items with different statuses
- Filter shows initiative if ANY budget item matches selected status

**Future Enhancements (Phase 2):**
- Visual indicator in table showing funding status distribution per initiative
- Funding status summary card: "45 Secured, 20 Requested, 10 Pending"
- Funding status trend chart: Status changes over time
- Funding gap analysis: Total requested vs secured
- Funding status workflow: Transition status with approvals
- Funding status notifications: Alert when status changes
- Bulk status updates: Change multiple budget items at once
- Status history: Track funding status changes over time

---

**Story Created:** January 2025
**Story Completed:** January 2025
