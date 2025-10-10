# Story 4.3: User Management - Edit User

**Story ID:** STORY-4.3
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
**I want to** edit a user's role or department
**So that** I can update access as responsibilities change

---

## Acceptance Criteria

- [ ] Admin can click "Edit" button on user row in users list
- [ ] Form page displays with current user data pre-filled
- [ ] Admin can change:
  - Full name
  - Role
  - Department
  - Title
  - Status (active/inactive)
- [ ] Admin cannot change email (linked to auth)
- [ ] Email field is displayed but disabled/read-only
- [ ] Form validates inputs before submission
- [ ] Admin submits changes
- [ ] System updates public.users record
- [ ] Changes reflected immediately in user list
- [ ] Audit log captures change (future enhancement)
- [ ] Success message displayed
- [ ] User redirected back to users list

---

## Technical Tasks

### Task 1: Create User Edit Page
- [ ] Create `/app/(dashboard)/admin/users/[id]/page.tsx`
- [ ] Fetch user data by ID
- [ ] Pass data to edit form component
- [ ] Handle user not found (404)

### Task 2: Build EditUserForm Component
- [ ] Create `components/admin/EditUserForm.tsx`
- [ ] Pre-populate form with current user data
- [ ] Implement form fields with react-hook-form
- [ ] Disable email field (read-only)
- [ ] Add status toggle (active/inactive)
- [ ] Show loading state during submission

### Task 3: Create Zod Validation Schema
- [ ] Create `updateUserSchema` in `lib/validations/user.ts`
- [ ] Similar to create schema but email optional
- [ ] Validate all editable fields
- [ ] Ensure department required for dept-specific roles

### Task 4: Implement Server Action
- [ ] Create `updateUser()` in `app/actions/users.ts`
- [ ] Accept user ID and update data
- [ ] Validate admin permissions
- [ ] Update public.users record
- [ ] Revalidate users list
- [ ] Return success/error response

### Task 5: Testing & Validation
- [ ] Test form pre-population
- [ ] Test validation (role-based department requirement)
- [ ] Test successful user update
- [ ] Verify changes reflected in list
- [ ] Test changing role and department
- [ ] Test activating/deactivating user
- [ ] Test error handling

---

## UI/UX Design Notes

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Edit User: John Smith               [Cancel] [Save]     │
├─────────────────────────────────────────────────────────┤
│ Full Name *                                              │
│ [John Smith_________________________________________]    │
│                                                          │
│ Email Address (cannot be changed)                       │
│ [john.smith@carrollton.gov] (disabled)                  │
│                                                          │
│ Role *                                                   │
│ [Department Director ▼                             ]    │
│                                                          │
│ Department                                               │
│ [Parks & Recreation ▼                              ]    │
│                                                          │
│ Job Title                                                │
│ [Director of Parks & Recreation____________________]    │
│                                                          │
│ Status                                                   │
│ ○ Active  ○ Inactive                                    │
│                                                          │
│ * Required fields                                        │
└─────────────────────────────────────────────────────────┘
```

**Validation Rules:**
- Full name: Required, min 2 characters
- Email: Display only, not editable
- Role: Required
- Department: Required if role is 'staff' or 'department_director'
- Title: Optional, max 100 characters
- Status: Required (boolean)

---

## Database Operations

### Update User Query
```typescript
await supabase
  .from('users')
  .update({
    full_name: data.fullName,
    role: data.role,
    department_id: data.departmentId || null,
    title: data.title || null,
    is_active: data.isActive,
  })
  .eq('id', userId)
```

**Note:** Email cannot be changed through this interface. Changing email requires Supabase Auth admin API and would change the user's login credentials.

---

## Dependencies

**Depends On:**
- Story 4.1: User Management - List Users (COMPLETED)
- Story 4.2: User Management - Create User (COMPLETED)

**Blocks:**
- Story 4.4: User Management - Deactivate User

---

## Testing Checklist

- [ ] Page loads with user data pre-filled
- [ ] All fields display correctly
- [ ] Email field is disabled
- [ ] Form validation works
- [ ] Department required for staff/director roles
- [ ] Department optional for city-wide roles
- [ ] Status toggle works
- [ ] Form submits successfully
- [ ] User record updated in database
- [ ] Changes reflected in users list
- [ ] Success message displayed
- [ ] Redirect to /admin/users works
- [ ] Error handling works (network error, validation error)
- [ ] Non-admin users cannot access page
- [ ] Cannot edit non-existent user (404)

---

## Dev Notes

- Use same validation schema as create with minor modifications
- Email is display-only to prevent auth conflicts
- Consider showing "Last updated" timestamp
- Status field could be enhanced to show deactivation reason (future)
- Audit logging should track old vs new values (future enhancement)
- Consider adding "View Activity" link to see user's audit history

---

## Security Considerations

- Only admins can edit users (enforce via RLS + UI routing)
- Cannot change own admin status (prevent lockout) - future enhancement
- Validate all inputs server-side
- Email changes require separate workflow (not in this story)
- Deactivating user should not delete data (soft delete)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Form validation works correctly
- [ ] User update successful
- [ ] Changes reflected in list
- [ ] Error handling tested
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
