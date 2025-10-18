# Story 4.9: Fiscal Year Configuration - Create/Edit Fiscal Year

**Story ID:** STORY-4.9
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
**I want to** create and edit fiscal years
**So that** I can configure the fiscal year periods for strategic planning

---

## Acceptance Criteria

### Create Fiscal Year
- [ ] Admin can click "Create Fiscal Year" button from fiscal years list
- [ ] Form displays with fields:
  - Year Name (required, e.g., "FY 2025")
  - Start Date (required, date picker)
  - End Date (required, date picker)
  - Is Active (checkbox, default unchecked)
- [ ] End date must be after start date
- [ ] Only one fiscal year can be active at a time
- [ ] If user selects "Active" and another fiscal year is already active, show warning
- [ ] Form validates all fields
- [ ] Success redirects to fiscal years list
- [ ] Error messages display for validation failures

### Edit Fiscal Year
- [ ] Admin can click "Edit" button on fiscal year row
- [ ] Edit page loads with all current data pre-populated
- [ ] Can update year name, dates, and active status
- [ ] Same validation rules apply
- [ ] Success redirects to fiscal years list
- [ ] Cannot set end date before start date

---

## Technical Tasks

### Task 1: Create Validation Schema
- [ ] Create `lib/validations/fiscal-year.ts`
- [ ] Add `createFiscalYearSchema` with validation rules
- [ ] Add `updateFiscalYearSchema` (same as create)
- [ ] Validate year_name (required, min 2 chars)
- [ ] Validate start_date (required, valid date)
- [ ] Validate end_date (required, valid date, after start_date)
- [ ] Validate is_active (boolean)

### Task 2: Create Server Actions
- [ ] Add `getFiscalYearById()` to `app/actions/fiscal-years.ts`
- [ ] Add `createFiscalYear()` to `app/actions/fiscal-years.ts`
- [ ] Add `updateFiscalYear()` to `app/actions/fiscal-years.ts`
- [ ] Handle "only one active fiscal year" business rule
- [ ] If setting a fiscal year to active, deactivate all others

### Task 3: Build CreateFiscalYearForm Component
- [ ] Create `components/admin/CreateFiscalYearForm.tsx`
- [ ] Use React Hook Form with Zod validation
- [ ] Date inputs with proper formatting
- [ ] Active checkbox with warning message
- [ ] Show loading state during submission
- [ ] Display error messages

### Task 4: Build EditFiscalYearForm Component
- [ ] Create `components/admin/EditFiscalYearForm.tsx`
- [ ] Pre-populate all fields with current data
- [ ] Same validation as create form
- [ ] Handle active status toggle

### Task 5: Create Page Routes
- [ ] Create `/app/(dashboard)/admin/fiscal-years/new/page.tsx`
- [ ] Create `/app/(dashboard)/admin/fiscal-years/[id]/page.tsx`
- [ ] Add header with back button
- [ ] Include appropriate form component

### Task 6: Testing & Validation
- [ ] Test creating fiscal year with all fields
- [ ] Test creating fiscal year with minimal fields
- [ ] Test end date validation
- [ ] Test active fiscal year business rule
- [ ] Test editing fiscal year
- [ ] Test toggling active status
- [ ] Verify dates display correctly
- [ ] Verify updated data in list

---

## UI/UX Design Notes

**Create Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Fiscal Years                                          │
│ Create Fiscal Year                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Year Name *                                             │
│ [FY 2025_____________________________]                  │
│                                                         │
│ Start Date *                                            │
│ [10/01/2024__________] (date picker)                    │
│                                                         │
│ End Date *                                              │
│ [09/30/2025__________] (date picker)                    │
│ Must be after start date                                │
│                                                         │
│ Status                                                  │
│ [ ] Set as Active Fiscal Year                           │
│ ⚠️  Another fiscal year is currently active             │
│                                                         │
│ [Cancel]  [Create Fiscal Year]                          │
└─────────────────────────────────────────────────────────┘
```

---

## Database Operations

### Insert Fiscal Year
```sql
INSERT INTO fiscal_years (
  municipality_id,
  year_name,
  start_date,
  end_date,
  is_active
)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
```

### Update Fiscal Year
```sql
UPDATE fiscal_years
SET
  year_name = $1,
  start_date = $2,
  end_date = $3,
  is_active = $4
WHERE id = $5;
```

### Deactivate Other Fiscal Years
```sql
UPDATE fiscal_years
SET is_active = false
WHERE municipality_id = $1
  AND id != $2
  AND is_active = true;
```

---

## Validation Rules

**Year Name:**
- Required
- Minimum 2 characters
- Maximum 50 characters

**Start Date:**
- Required
- Valid date format

**End Date:**
- Required
- Valid date format
- Must be after start date

**Is Active:**
- Boolean
- Only one fiscal year can be active at a time
- If setting to active, all other fiscal years must be deactivated

---

## Business Rules

1. **Single Active Fiscal Year**: Only one fiscal year can have `is_active = true` at any given time
2. **Date Range Validation**: End date must be after start date
3. **Typical Fiscal Year**: Most municipalities run Oct 1 - Sep 30 (but allow flexibility)

---

## Dependencies

**Depends On:**
- Story 4.8: Fiscal Year Configuration - List Fiscal Years (COMPLETED)

**Blocks:**
- None

---

## Testing Checklist

- [ ] Create form loads without errors
- [ ] Can create fiscal year with valid data
- [ ] Year name validation works
- [ ] Start date validation works
- [ ] End date validation works
- [ ] End date before start date shows error
- [ ] Can set fiscal year as active on creation
- [ ] Setting new fiscal year as active deactivates others
- [ ] Edit form pre-populates correctly
- [ ] Can update all fields
- [ ] Can toggle active status
- [ ] Toggling active deactivates other fiscal years
- [ ] Successful operations redirect to list
- [ ] Updated data appears in list
- [ ] Cancel buttons work

---

## Dev Notes

- Fiscal years typically follow Oct 1 - Sep 30 pattern for municipalities
- Use HTML5 date inputs for better UX
- Format dates as YYYY-MM-DD for input values
- Business rule: when setting a fiscal year to active, automatically deactivate all others in same municipality
- Show warning message if another fiscal year is currently active
- Consider adding helper text about typical fiscal year dates
- Date validation should happen both client-side and server-side

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Can create fiscal years
- [ ] Can edit fiscal years
- [ ] Active status business rule enforced
- [ ] Date validation works
- [ ] Forms redirect correctly
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
