# Story 4.5: Department Management - List Departments

**Story ID:** STORY-4.5
**Epic:** Epic 4 - System Administration
**Priority:** P0 (High - MVP Foundation)
**Story Points:** 5
**Status:** In Progress
**Assigned To:** Developer
**Created:** January 10, 2025
**Last Updated:** January 10, 2025

---

## User Story

**As an** Admin
**I want to** view a list of all departments
**So that** I can manage department configuration

---

## Acceptance Criteria

- [ ] Admin can navigate to "Departments" page from sidebar
- [ ] Page displays table of all departments with columns:
  - Name
  - Director name
  - Director email
  - # Staff (count of active users)
  - # Plans (count of strategic plans)
  - Status (active/inactive)
- [ ] Admin can filter by: Status
- [ ] Admin can search by name
- [ ] Admin can sort by any column
- [ ] Page shows department count
- [ ] "Create Department" button visible (Story 4.6)
- [ ] Empty state displayed when no departments exist

---

## Technical Tasks

### Task 1: Create Departments Page Route
- [ ] Create `/app/(dashboard)/admin/departments/page.tsx`
- [ ] Departments link already exists in sidebar
- [ ] Add page layout with header and table

### Task 2: Create Server Action
- [ ] Create `getDepartmentsWithStats()` in `app/actions/departments.ts`
- [ ] Fetch departments with:
  - Basic department info
  - Count of active staff (users)
  - Count of strategic plans
- [ ] Support filtering by status
- [ ] Support search by name
- [ ] Support sorting

### Task 3: Build DepartmentsTable Component
- [ ] Create `components/admin/DepartmentsTable.tsx`
- [ ] Display all department data
- [ ] Sortable column headers
- [ ] Status badges (active/inactive)
- [ ] "Edit" button for each row (Story 4.7)

### Task 4: Add Filters Component
- [ ] Create `components/admin/DepartmentsFilters.tsx`
- [ ] Status filter (All/Active/Inactive)
- [ ] Search by name
- [ ] Clear filters button

### Task 5: Testing & Validation
- [ ] Test with no departments (empty state)
- [ ] Test with multiple departments
- [ ] Verify staff counts are accurate
- [ ] Verify plan counts are accurate
- [ ] Test filtering and search
- [ ] Test sorting on all columns

---

## UI/UX Design Notes

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Departments                          [+ Create]         │
├─────────────────────────────────────────────────────────┤
│ [Search...] [Status ▼] [Clear]                          │
├─────────────────────────────────────────────────────────┤
│ Name ↑ | Director | Email | Staff | Plans | Status      │
│ ─────────────────────────────────────────────────────── │
│ Parks & Rec | John Smith | john@... | 12 | 3 | Active  │
│ Water Svcs  | Jane Doe   | jane@... | 8  | 2 | Active  │
│ IT Dept     | Bob Lee    | bob@...  | 5  | 1 | Inactive│
├─────────────────────────────────────────────────────────┤
│ Showing 3 departments                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Database Queries

### Main Departments Query
```sql
SELECT
  d.id,
  d.name,
  d.slug,
  d.director_name,
  d.director_email,
  d.is_active,
  d.mission_statement,
  COUNT(DISTINCT u.id) FILTER (WHERE u.is_active = true) as staff_count,
  COUNT(DISTINCT sp.id) as plans_count
FROM departments d
LEFT JOIN users u ON d.id = u.department_id
LEFT JOIN strategic_plans sp ON d.id = sp.department_id
WHERE
  ($1::boolean IS NULL OR d.is_active = $1)
  AND ($2::text IS NULL OR d.name ILIKE '%' || $2 || '%')
GROUP BY d.id
ORDER BY d.name ASC;
```

---

## Dependencies

**Depends On:**
- Story 4.0: Project Initialization (COMPLETED)

**Blocks:**
- Story 4.6: Department Management - Create Department
- Story 4.7: Department Management - Edit Department

---

## Testing Checklist

- [ ] Page loads without errors
- [ ] All columns display correctly
- [ ] Staff count shows active users only
- [ ] Plans count accurate
- [ ] Search filters by name
- [ ] Status filter works
- [ ] Sorting works on all columns
- [ ] Empty state shows when no departments
- [ ] Non-admin users cannot access page

---

## Dev Notes

- Similar structure to users list (Story 4.1)
- Staff count should only include active users
- Plans count includes all plans (draft, active, etc.)
- Create Department button present but not functional until Story 4.6
- Consider pagination if departments list grows (likely not needed for municipal use)
- Department data comes from seed migration

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Page displays correctly
- [ ] Counts are accurate
- [ ] Filtering and search work
- [ ] Sorting works
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
