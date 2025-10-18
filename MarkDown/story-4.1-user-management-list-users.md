# Story 4.1: User Management - List Users

**Story ID:** STORY-4.1
**Epic:** Epic 4 - System Administration
**Priority:** P0 (High - MVP Foundation)
**Story Points:** 8
**Status:** In Progress
**Assigned To:** Developer
**Created:** January 10, 2025
**Last Updated:** January 10, 2025

---

## User Story

**As an** Admin
**I want to** view a list of all users
**So that** I can manage user accounts

---

## Acceptance Criteria

- [ ] Admin can navigate to "Users" page from sidebar
- [ ] Page displays table of all users with columns:
  - Full name
  - Email
  - Role
  - Department
  - Status (active/inactive)
  - Last login
- [ ] Admin can filter by: Role, Department, Status
- [ ] Admin can search by name or email
- [ ] Admin can sort by any column
- [ ] Pagination supports 50 users per page
- [ ] Page shows user count and filter indicators
- [ ] Empty state displayed when no users match filters

---

## Technical Tasks

### Task 1: Create Users Page Route
- [ ] Create `/app/(dashboard)/admin/users/page.tsx`
- [ ] Add users route to sidebar navigation
- [ ] Verify admin-only access via RLS and middleware

### Task 2: Create Users Data Fetching
- [ ] Create server action `app/actions/users.ts`
- [ ] Implement `getUsers()` with filters: role, department, status, search
- [ ] Implement sorting and pagination logic
- [ ] Join with departments table for department name
- [ ] Handle last_login from auth.users (if available)

### Task 3: Build Users Table Component
- [ ] Create `components/admin/UsersTable.tsx`
- [ ] Implement sortable column headers
- [ ] Display user data with proper formatting
- [ ] Show status badges (active/inactive)
- [ ] Add role badges with color coding
- [ ] Implement pagination controls

### Task 4: Add Filter Controls
- [ ] Create filter component with dropdowns for role, department, status
- [ ] Add search input for name/email
- [ ] Implement URL state management for filters (searchParams)
- [ ] Add "Clear filters" button
- [ ] Show active filter count

### Task 5: Testing & Validation
- [ ] Test with empty database (show empty state)
- [ ] Test with multiple users across different roles/departments
- [ ] Verify filtering works correctly
- [ ] Verify search works correctly
- [ ] Verify sorting works on all columns
- [ ] Verify pagination works
- [ ] Test RLS policies (admin sees all users)

---

## UI/UX Design Notes

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Users                                        [+ Create]  │
├─────────────────────────────────────────────────────────┤
│ [Search...] [Role ▼] [Department ▼] [Status ▼] [Clear] │
├─────────────────────────────────────────────────────────┤
│ Name ↑ | Email | Role | Department | Status | Last Login│
│ ───────────────────────────────────────────────────────  │
│ John Smith | john@city.gov | Admin | IT | Active | 2h   │
│ Jane Doe   | jane@city.gov | Dir.  | Parks | Active | 1d│
│ ...                                                      │
├─────────────────────────────────────────────────────────┤
│ Showing 1-50 of 127 users        [< Previous] [Next >]  │
└─────────────────────────────────────────────────────────┘
```

**Role Badge Colors:**
- Admin: Blue
- Department Director: Purple
- Staff: Gray
- City Manager: Green
- Finance: Yellow
- Council: Orange
- Public: Neutral

**Status Badges:**
- Active: Green
- Inactive: Red

---

## Database Queries

### Main Users Query
```sql
SELECT
  u.id,
  u.full_name,
  u.email,
  u.role,
  u.title,
  u.is_active,
  d.name as department_name,
  u.updated_at as last_login -- Approximation, will use auth.users later
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE
  ($1::text IS NULL OR u.role = $1)
  AND ($2::uuid IS NULL OR u.department_id = $2)
  AND ($3::boolean IS NULL OR u.is_active = $3)
  AND ($4::text IS NULL OR u.full_name ILIKE '%' || $4 || '%' OR u.email ILIKE '%' || $4 || '%')
ORDER BY u.full_name ASC
LIMIT 50 OFFSET $5;
```

---

## Dependencies

**Depends On:**
- Story 4.0: Project Initialization (COMPLETED)

**Blocks:**
- Story 4.2: User Management - Create User
- Story 4.3: User Management - Edit User
- Story 4.4: User Management - Deactivate User

---

## Testing Checklist

- [ ] Page loads without errors
- [ ] All columns display correctly
- [ ] Search filters results correctly by name
- [ ] Search filters results correctly by email
- [ ] Role filter works
- [ ] Department filter works
- [ ] Status filter works
- [ ] Multiple filters work together (AND logic)
- [ ] Sorting works on all columns
- [ ] Pagination shows correct page
- [ ] Pagination "Next" button disabled on last page
- [ ] Pagination "Previous" button disabled on first page
- [ ] Empty state shows when no users match filters
- [ ] Non-admin users cannot access page (403 or redirect)

---

## Dev Notes

- Use shadcn/ui Table component for consistency
- Implement client-side state for filters using URL searchParams
- Server action handles all data fetching and filtering
- Consider debouncing search input (300ms) for better UX
- Last login may not be available initially - use updated_at as placeholder
- Prepare for "Create User" button in top-right (Story 4.2)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] All tests passing
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Story documented and committed to git
- [ ] Ready for Story 4.2 (Create User)

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
