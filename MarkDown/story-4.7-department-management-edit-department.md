# Story 4.7: Department Management - Edit Department

**Story ID:** STORY-4.7
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
**I want to** edit an existing department
**So that** I can update department information and configuration

---

## Acceptance Criteria

- [ ] Admin can click "Edit" button on department row in list
- [ ] Edit page loads with all current department data pre-populated
- [ ] Form displays with fields:
  - Name (required, pre-filled)
  - Slug (required, pre-filled, editable)
  - Director Name (optional, pre-filled)
  - Director Email (optional, pre-filled)
  - Mission Statement (optional, pre-filled)
  - Status (active/inactive, pre-selected)
- [ ] Slug must be unique (excluding current department)
- [ ] Form validates all fields
- [ ] Success redirects to departments list
- [ ] Error messages display for validation failures
- [ ] Cancel button returns to departments list
- [ ] "Back" navigation returns to departments list

---

## Technical Tasks

### Task 1: Add Update Validation Schema
- [ ] Add `updateDepartmentSchema` to `lib/validations/department.ts`
- [ ] Same validation rules as create schema

### Task 2: Create Server Actions
- [ ] Add `getDepartmentById()` to `app/actions/departments.ts`
- [ ] Fetch department by ID
- [ ] Add `updateDepartment()` to `app/actions/departments.ts`
- [ ] Check for duplicate slug (excluding current department)
- [ ] Update department record
- [ ] Revalidate pages

### Task 3: Build EditDepartmentForm Component
- [ ] Create `components/admin/EditDepartmentForm.tsx`
- [ ] Use React Hook Form with Zod validation
- [ ] Pre-populate all fields with current department data
- [ ] Show loading state during submission
- [ ] Display error messages
- [ ] Handle success and error responses

### Task 4: Create Dynamic Route Page
- [ ] Create `/app/(dashboard)/admin/departments/[id]/page.tsx`
- [ ] Fetch department data by ID
- [ ] Add header with back button
- [ ] Include EditDepartmentForm with department data

### Task 5: Testing & Validation
- [ ] Test loading department data
- [ ] Test updating all fields
- [ ] Test updating only some fields
- [ ] Test duplicate slug validation
- [ ] Test form validation errors
- [ ] Test cancel and back navigation
- [ ] Verify updated data in departments list

---

## UI/UX Design Notes

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Departments                                           │
│ Edit Department: Parks & Recreation                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Name *                                                  │
│ [Parks and Recreation_______________]                   │
│                                                         │
│ Slug *                                                  │
│ [parks-and-recreation_______________]                   │
│ Used in URLs                                            │
│                                                         │
│ Director Name                                           │
│ [John Smith_________________________]                   │
│                                                         │
│ Director Email                                          │
│ [john.smith@example.gov_____________]                   │
│                                                         │
│ Mission Statement                                       │
│ [_____________________________]                         │
│ [_____________________________]                         │
│ [_____________________________]                         │
│                                                         │
│ Status                                                  │
│ (•) Active  ( ) Inactive                                │
│                                                         │
│ [Cancel]  [Update Department]                           │
└─────────────────────────────────────────────────────────┘
```

---

## Database Operations

### Get Department by ID
```sql
SELECT
  id,
  name,
  slug,
  director_name,
  director_email,
  mission_statement,
  is_active
FROM departments
WHERE id = $1;
```

### Update Department
```sql
UPDATE departments
SET
  name = $1,
  slug = $2,
  director_name = $3,
  director_email = $4,
  mission_statement = $5,
  is_active = $6,
  updated_at = NOW()
WHERE id = $7;
```

### Check Duplicate Slug (Excluding Current)
```sql
SELECT id FROM departments
WHERE slug = $1
  AND id != $2
LIMIT 1;
```

---

## Validation Rules

Same as Story 4.6 (Create Department):

**Name:**
- Required
- Minimum 2 characters
- Maximum 100 characters

**Slug:**
- Required
- Must be unique (excluding current department)
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

---

## Dependencies

**Depends On:**
- Story 4.6: Department Management - Create Department (COMPLETED)

**Blocks:**
- None

---

## Testing Checklist

- [ ] Edit page loads without errors
- [ ] All fields pre-populated with current data
- [ ] Can update name
- [ ] Can update slug
- [ ] Can update director information
- [ ] Can update mission statement
- [ ] Can toggle status
- [ ] Required field validation works
- [ ] Email validation works
- [ ] Duplicate slug shows error (for other departments)
- [ ] Same slug allowed (for current department)
- [ ] Successful update redirects to list
- [ ] Updated data appears in list
- [ ] Cancel button navigates back
- [ ] Back button navigates back
- [ ] Non-admin users cannot access page

---

## Dev Notes

- Similar structure to edit user (Story 4.3)
- Slug validation must exclude current department ID
- Unlike user edit, slug is editable here
- Need to handle slug uniqueness check properly
- Pre-populate form with defaultValues in React Hook Form
- Status uses radio buttons (same as create)
- Use admin client for update to bypass RLS

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Form pre-populates correctly
- [ ] Department updates successfully
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
