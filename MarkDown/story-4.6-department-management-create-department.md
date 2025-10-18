# Story 4.6: Department Management - Create Department

**Story ID:** STORY-4.6
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
**I want to** create a new department
**So that** I can configure departments for the organization

---

## Acceptance Criteria

- [ ] Admin can click "Create Department" button from departments list
- [ ] Form displays with fields:
  - Name (required)
  - Slug (auto-generated from name, editable)
  - Director Name (optional)
  - Director Email (optional)
  - Mission Statement (optional, textarea)
  - Status (active/inactive, default active)
- [ ] Slug auto-generates from name (lowercase, hyphens)
- [ ] Slug must be unique
- [ ] Form validates all fields
- [ ] Success redirects to departments list
- [ ] Error messages display for validation failures
- [ ] Cancel button returns to departments list

---

## Technical Tasks

### Task 1: Create Validation Schema
- [ ] Add `createDepartmentSchema` to `lib/validations/department.ts`
- [ ] Validate name (required, min 2 chars)
- [ ] Validate slug (required, lowercase, hyphens only)
- [ ] Validate director_email format if provided
- [ ] Validate mission_statement max length

### Task 2: Create Server Action
- [ ] Add `createDepartment()` to `app/actions/departments.ts`
- [ ] Check for duplicate slug
- [ ] Insert new department record
- [ ] Revalidate departments list page
- [ ] Return success/error response

### Task 3: Build CreateDepartmentForm Component
- [ ] Create `components/admin/CreateDepartmentForm.tsx`
- [ ] Use React Hook Form with Zod validation
- [ ] Auto-generate slug from name
- [ ] Show loading state during submission
- [ ] Display error messages
- [ ] Handle success and error responses

### Task 4: Create Page Route
- [ ] Create `/app/(dashboard)/admin/departments/new/page.tsx`
- [ ] Add header with title
- [ ] Include CreateDepartmentForm
- [ ] Add cancel link back to departments list

### Task 5: Testing & Validation
- [ ] Test creating department with all fields
- [ ] Test creating department with only required fields
- [ ] Test duplicate slug validation
- [ ] Test form validation errors
- [ ] Test cancel navigation
- [ ] Verify new department appears in list

---

## UI/UX Design Notes

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Departments                                           │
│ Create Department                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Name *                                                  │
│ [_____________________________]                         │
│                                                         │
│ Slug *                                                  │
│ [_____________________________]                         │
│ Auto-generated from name                                │
│                                                         │
│ Director Name                                           │
│ [_____________________________]                         │
│                                                         │
│ Director Email                                          │
│ [_____________________________]                         │
│                                                         │
│ Mission Statement                                       │
│ [_____________________________]                         │
│ [_____________________________]                         │
│ [_____________________________]                         │
│                                                         │
│ Status                                                  │
│ ( ) Active  ( ) Inactive                                │
│                                                         │
│ [Cancel]  [Create Department]                           │
└─────────────────────────────────────────────────────────┘
```

---

## Database Operations

### Insert Department
```sql
INSERT INTO departments (
  name,
  slug,
  director_name,
  director_email,
  mission_statement,
  is_active,
  municipality_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
```

### Check Duplicate Slug
```sql
SELECT id FROM departments
WHERE slug = $1
LIMIT 1;
```

---

## Validation Rules

**Name:**
- Required
- Minimum 2 characters
- Maximum 100 characters

**Slug:**
- Required
- Must be unique
- Lowercase only
- Alphanumeric and hyphens only
- Cannot start or end with hyphen

**Director Email:**
- Optional
- Valid email format if provided

**Mission Statement:**
- Optional
- Maximum 500 characters

**Status:**
- Required
- Boolean (active/inactive)
- Default: active (true)

---

## Dependencies

**Depends On:**
- Story 4.5: Department Management - List Departments (COMPLETED)

**Blocks:**
- Story 4.7: Department Management - Edit Department

---

## Testing Checklist

- [ ] Form loads without errors
- [ ] Slug auto-generates from name
- [ ] Can manually edit slug
- [ ] Required field validation works
- [ ] Email validation works
- [ ] Duplicate slug shows error
- [ ] Successful creation redirects to list
- [ ] New department appears in list
- [ ] Cancel button navigates back
- [ ] Non-admin users cannot access page

---

## Dev Notes

- Similar structure to create user (Story 4.2)
- Slug generation: `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`
- Need to get municipality_id from current user's session
- Director fields are optional (can be set later in edit)
- Mission statement uses textarea instead of input
- Default status is active (true)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Form validates correctly
- [ ] Department created successfully
- [ ] Redirects to list on success
- [ ] Shows appropriate errors
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
