# Story 4.8: Fiscal Year Configuration - List Fiscal Years

**Story ID:** STORY-4.8
**Epic:** Epic 4 - System Administration
**Priority:** P0 (High - MVP Foundation)
**Story Points:** 3
**Status:** In Progress
**Assigned To:** Developer
**Created:** January 10, 2025
**Last Updated:** January 10, 2025

---

## User Story

**As an** Admin
**I want to** view a list of all fiscal years
**So that** I can manage fiscal year configuration for strategic planning

---

## Acceptance Criteria

- [ ] Admin can navigate to "Fiscal Years" page from sidebar
- [ ] Page displays table of all fiscal years with columns:
  - Year name (e.g., "FY 2025")
  - Start date
  - End date
  - Status (active/inactive)
- [ ] Only one fiscal year can be active at a time (indicated in UI)
- [ ] Admin can sort by year, start date, or status
- [ ] Page shows fiscal year count
- [ ] "Create Fiscal Year" button visible (Story 4.9)
- [ ] Empty state displayed when no fiscal years exist
- [ ] Current active fiscal year highlighted

---

## Technical Tasks

### Task 1: Create Fiscal Years Page Route
- [ ] Create `/app/(dashboard)/admin/fiscal-years/page.tsx`
- [ ] Add "Fiscal Years" link to admin sidebar
- [ ] Add page layout with header and table

### Task 2: Create Server Action
- [ ] Create `getFiscalYears()` in `app/actions/fiscal-years.ts`
- [ ] Fetch fiscal years ordered by start_date descending
- [ ] Support sorting

### Task 3: Build FiscalYearsTable Component
- [ ] Create `components/admin/FiscalYearsTable.tsx`
- [ ] Display all fiscal year data
- [ ] Sortable column headers
- [ ] Status badges (active/inactive)
- [ ] Highlight current active fiscal year
- [ ] "Edit" button for each row (Story 4.9)

### Task 4: Testing & Validation
- [ ] Test with no fiscal years (empty state)
- [ ] Test with multiple fiscal years
- [ ] Test sorting on all columns
- [ ] Verify only one fiscal year is active
- [ ] Test navigation from sidebar

---

## UI/UX Design Notes

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Fiscal Years                         [+ Create]         │
├─────────────────────────────────────────────────────────┤
│ Year ↑ | Start Date | End Date | Status | Actions       │
│ ─────────────────────────────────────────────────────── │
│ FY 2025 | 10/1/2024 | 9/30/2025 | ⭐ Active | Edit      │
│ FY 2024 | 10/1/2023 | 9/30/2024 | Inactive  | Edit      │
│ FY 2023 | 10/1/2022 | 9/30/2023 | Inactive  | Edit      │
├─────────────────────────────────────────────────────────┤
│ Showing 3 fiscal years                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Database Queries

### Main Fiscal Years Query
```sql
SELECT
  id,
  year_name,
  start_date,
  end_date,
  is_active
FROM fiscal_years
WHERE municipality_id = $1
ORDER BY start_date DESC;
```

---

## Dependencies

**Depends On:**
- Story 4.0: Project Initialization (COMPLETED)

**Blocks:**
- Story 4.9: Fiscal Year Configuration - Create Fiscal Year

---

## Testing Checklist

- [ ] Page loads without errors
- [ ] All columns display correctly
- [ ] Dates formatted correctly
- [ ] Active fiscal year clearly indicated
- [ ] Sorting works on all columns
- [ ] Empty state shows when no fiscal years
- [ ] Non-admin users cannot access page
- [ ] Sidebar link works

---

## Dev Notes

- Fiscal years are typically named like "FY 2025", "FY 2024", etc.
- Only one fiscal year can be active at a time (business rule)
- Active fiscal year should be visually distinct (badge, highlighting)
- Default sort: most recent fiscal year first (start_date DESC)
- Dates should be formatted in a user-friendly way (MM/DD/YYYY)
- Create Fiscal Year button present but not functional until Story 4.9
- Similar structure to departments list (Story 4.5)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Page displays correctly
- [ ] Sorting works
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
