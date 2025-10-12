# Story 3.2: View Initiative Budget Detail

**Story ID:** STORY-3.2
**Epic:** Epic 3 - Finance Validates Budgets
**Status:** ✅ Completed
**Priority:** P0 (High - MVP)
**Story Points:** 5
**Completed:** January 2025

---

## User Story

**As a** Finance Director
**I want to** view detailed budget breakdown for an initiative
**So that** I can validate the accuracy of cost estimates

---

## Acceptance Criteria

- [x] User can navigate to initiative budget detail view
- [x] View displays:
  - Year 1/2/3 budget breakdown (Personnel, Equipment, Services, Training, Materials, Other)
  - Total per year and grand total
  - Funding sources with amounts and status
  - ROI analysis (financial and non-financial)
- [x] View is read-only for Finance (cannot edit)
- [x] User can add comments on budget (see Story 3.3)

---

## Implementation Details

### Files Created:

1. **`/app/actions/initiative-detail.ts`** - Server action for initiative data
   - `getInitiativeDetail()` - Fetches comprehensive initiative data
   - Includes initiative basic info, budgets, goal, plan details
   - Role-based access control (Finance, City Manager, Admin, Department staff)
   - Joins with goals, plans, departments, initiative_budgets
   - Returns structured `InitiativeDetailData` type

2. **`/app/(dashboard)/plans/[id]/initiatives/[initiativeId]/page.tsx`** - Initiative detail page
   - New route: `/plans/:planId/initiatives/:initiativeId`
   - Displays comprehensive initiative information
   - Read-only view for Finance role
   - Back navigation to Finance dashboard or plan dashboard
   - Integrates comments section for feedback

### Page Sections:

**1. Header:**
- Breadcrumb: Department > Plan > Goal > Initiative
- Initiative name
- Priority badge (color-coded: NEED/WANT/NICE_TO_HAVE)
- Status badge (color-coded: NOT_STARTED/IN_PROGRESS/COMPLETED/etc.)
- "Read-only view" indicator for Finance role

**2. Overview Card:**
- Description
- Strategic goal (with description)
- Responsible party

**3. Budget Summary Cards** (4 cards):
- Total Budget
- Year 1 Cost
- Year 2 Cost
- Year 3 Cost
- Icons and formatted currency

**4. Budget Breakdown by Year:**
- Expandable sections for each year
- Fiscal year display (FY 2025, 2026, 2027)
- Category breakdown:
  - Personnel (salaries, benefits)
  - Equipment (hardware, software, vehicles)
  - Services (contracts, consultants)
  - Training (courses, certifications)
  - Materials (supplies, consumables)
  - Other (miscellaneous)
- Year total
- Funding source per year
- Funding status per year (Secured/Pending/Applied)
- Notes field

**5. Funding Sources:**
- List of all funding sources
- Chips with source names (General Fund, Grants, Bonds, etc.)

**6. Financial Analysis & ROI:**
- Display financial_analysis JSONB data
- ROI calculations (if available)
- Non-financial benefits

**7. Comments Section:**
- Finance can add comments/questions on budget
- Department can respond
- Same commenting system as plan comments (Story 2.3)

### Key Features:

✅ **Comprehensive Budget View:**
- All budget details in one place
- Multi-year breakdown
- Category-level detail
- Funding source tracking

✅ **Read-Only Access for Finance:**
- No edit buttons shown
- "Read-only view" indicator
- Can comment but not modify budget

✅ **Role-Based Access:**
- Finance can view all initiatives
- City Manager can view all initiatives
- Department staff can view their own initiatives
- RLS enforced at database level

✅ **Navigation:**
- Links from Finance dashboard table work
- Breadcrumb shows context
- Back button returns to appropriate dashboard

✅ **Professional Display:**
- Formatted currency throughout
- Color-coded badges
- Clear visual hierarchy
- Responsive layout

### Access Control Logic:

```typescript
const isSameMunicipality = // Check municipality
const isFinance = userRole === 'finance'
const isAdmin = userRole === 'admin'
const isCityManager = userRole === 'city_manager'
const isSameDepartment = // Check department

Access granted if: isSameMunicipality AND (isFinance OR isAdmin OR isCityManager OR isSameDepartment)
```

---

## Testing Notes

**Test Scenarios:**
1. ✅ Finance can access initiative detail from dashboard table
2. ✅ Initiative displays all required information
3. ✅ Budget breakdown shows all categories
4. ✅ Year totals match initiative totals
5. ✅ Funding sources display correctly
6. ✅ Currency formatting is correct
7. ✅ Priority and status badges display with correct colors
8. ✅ "Read-only view" indicator shows for Finance
9. ✅ No edit buttons visible for Finance role
10. ✅ Comments section is accessible
11. ✅ Back button navigates to correct dashboard
12. ✅ Department staff can access their own initiatives
13. ✅ Finance cannot access initiatives from other municipalities
14. ✅ Financial analysis displays when present

**Edge Cases:**
- Initiative with no budgets (displays summary only)
- Initiative with incomplete budget data
- Very long initiative names/descriptions
- Multiple funding sources (displays as chips)
- Missing responsible party (field hidden)

---

## Related Stories

- Story 3.1: View All Initiative Budgets Dashboard (entry point)
- Story 3.3: Comment on Initiative Budgets (next - commenting feature)
- Story 1.8: Add Initiative Financial Analysis (data source)

---

## Technical Decisions

**New Route vs. Existing Page:**
- Decision: Create dedicated initiative detail route
- Reason: Clean separation, easier to maintain, better UX for Finance
- Alternative: Reuse plan page with tabs (rejected: too complex)

**Data Fetching: Server Action**
- Reason: Role-based access control, server-side validation
- Fetches all related data in single query (performance)

**Budget Display: Year-by-year breakdown**
- Reason: Finance needs to see category details per year
- Each year shows full budget breakdown
- Alternative: Aggregate view (rejected: loses important detail)

**Read-Only Enforcement: Multiple levels**
- UI: No edit buttons shown
- Server: Access control in server action
- Database: RLS policies (from Epic 1)

---

## Security Considerations

**Access Control:**
- Server action validates user role
- Checks municipality_id match
- Allows Finance, Admin, City Manager, Department staff
- RLS policies on initiatives table enforce additional security

**Data Privacy:**
- Budget details only visible to authorized roles
- Financial analysis may contain sensitive information
- Comments on budgets tracked with author info

---

## Notes

- This story completes the "view" portion of Finance budget validation
- Finance can now drill down into any initiative to see full budget detail
- Read-only access ensures Finance reviews but doesn't accidentally modify budgets
- Comment functionality (Story 3.3) will enable Finance to provide feedback
- Budget detail view is also useful for City Manager and Department Directors

**Future Enhancements:**
- Budget comparison (planned vs. actual)
- Budget change history
- Export single initiative budget to Excel
- Budget validation checklist
- Flag budget issues directly from detail page
- Link to similar initiatives for benchmarking

---

**Story Created:** January 2025
**Story Completed:** January 2025
