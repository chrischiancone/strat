# Story 4.10: Municipality Configuration

**Story ID:** STORY-4.10
**Epic:** Epic 4 - System Administration
**Priority:** P1 (Medium - MVP Foundation)
**Story Points:** 5
**Status:** In Progress
**Assigned To:** Developer
**Created:** January 10, 2025
**Last Updated:** January 10, 2025

---

## User Story

**As an** Admin
**I want to** configure municipality settings
**So that** I can maintain accurate organization information and contact details

---

## Acceptance Criteria

- [ ] Admin can navigate to "Settings" or "Municipality" page from sidebar
- [ ] Page displays current municipality information
- [ ] Admin can edit municipality fields:
  - Name (required)
  - State/Province (optional)
  - Contact Name (optional)
  - Contact Email (optional)
  - Contact Phone (optional)
  - Website URL (optional)
- [ ] Form validates all fields
- [ ] Email validation if provided
- [ ] Phone format validation if provided
- [ ] URL validation if provided
- [ ] Success message displays after update
- [ ] Error messages display for validation failures
- [ ] Only one municipality exists per installation (cannot create/delete)

---

## Technical Tasks

### Task 1: Create Validation Schema
- [ ] Create `lib/validations/municipality.ts`
- [ ] Add `updateMunicipalitySchema` with validation rules
- [ ] Validate name (required, min 2 chars)
- [ ] Validate email format if provided
- [ ] Validate phone format if provided
- [ ] Validate URL format if provided

### Task 2: Create Server Actions
- [ ] Create `app/actions/municipality.ts`
- [ ] Add `getMunicipality()` to fetch current municipality
- [ ] Add `updateMunicipality()` to update municipality info
- [ ] Use admin client to bypass RLS

### Task 3: Build EditMunicipalityForm Component
- [ ] Create `components/admin/EditMunicipalityForm.tsx`
- [ ] Use React Hook Form with Zod validation
- [ ] Pre-populate all fields with current data
- [ ] Show loading state during submission
- [ ] Display success/error messages

### Task 4: Create Page Route
- [ ] Create `/app/(dashboard)/admin/settings/page.tsx` or `/admin/municipality/page.tsx`
- [ ] Add "Settings" link to admin sidebar
- [ ] Add header with municipality info
- [ ] Include EditMunicipalityForm

### Task 5: Testing & Validation
- [ ] Test updating all fields
- [ ] Test updating only some fields
- [ ] Test required field validation
- [ ] Test email validation
- [ ] Test phone validation
- [ ] Test URL validation
- [ ] Verify updated data persists

---

## UI/UX Design Notes

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Municipality Settings                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Municipality Name *                                     │
│ [City of Carrollton___________________]                 │
│                                                         │
│ State/Province                                          │
│ [Texas____________________________]                     │
│                                                         │
│ Contact Name                                            │
│ [John Doe_________________________]                     │
│                                                         │
│ Contact Email                                           │
│ [admin@carrollton.gov______________]                     │
│                                                         │
│ Contact Phone                                           │
│ [(555) 123-4567___________________]                     │
│                                                         │
│ Website URL                                             │
│ [https://carrollton.gov___________]                     │
│                                                         │
│ [Save Changes]                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Database Operations

### Get Municipality
```sql
SELECT
  id,
  name,
  state,
  contact_name,
  contact_email,
  contact_phone,
  website_url
FROM municipalities
WHERE id = (SELECT municipality_id FROM users WHERE id = $1 LIMIT 1);
```

### Update Municipality
```sql
UPDATE municipalities
SET
  name = $1,
  state = $2,
  contact_name = $3,
  contact_email = $4,
  contact_phone = $5,
  website_url = $6,
  updated_at = NOW()
WHERE id = $7;
```

---

## Validation Rules

**Name:**
- Required
- Minimum 2 characters
- Maximum 100 characters

**State/Province:**
- Optional
- Maximum 50 characters

**Contact Name:**
- Optional
- Maximum 100 characters

**Contact Email:**
- Optional
- Valid email format if provided

**Contact Phone:**
- Optional
- Valid phone format if provided (allow various formats)

**Website URL:**
- Optional
- Valid URL format if provided (must start with http:// or https://)

---

## Dependencies

**Depends On:**
- Story 4.0: Project Initialization (COMPLETED)

**Blocks:**
- None

---

## Testing Checklist

- [ ] Page loads without errors
- [ ] All fields pre-populate correctly
- [ ] Can update municipality name
- [ ] Can update all optional fields
- [ ] Can clear optional fields
- [ ] Name required validation works
- [ ] Email validation works
- [ ] Phone validation works
- [ ] URL validation works
- [ ] Success message displays
- [ ] Updated data persists
- [ ] Non-admin users cannot access page

---

## Dev Notes

- There is only ONE municipality per installation
- This is an edit-only page (no create/delete)
- Municipality ID comes from current user's profile
- All users belong to the same municipality in single-tenant setup
- Consider adding more fields in future (address, timezone, etc.)
- Phone validation should be flexible (allow different formats)
- Use admin client to update to bypass RLS
- No cancel button needed (can just navigate away)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Form pre-populates correctly
- [ ] Municipality updates successfully
- [ ] Validation works correctly
- [ ] Success message displays
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
