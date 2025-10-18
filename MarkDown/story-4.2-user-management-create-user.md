# Story 4.2: User Management - Create User

**Story ID:** STORY-4.2
**Epic:** Epic 4 - System Administration
**Priority:** P0 (High - MVP Foundation)
**Story Points:** 13
**Status:** In Progress
**Assigned To:** Developer
**Created:** January 10, 2025
**Last Updated:** January 10, 2025

---

## User Story

**As an** Admin
**I want to** create a new user account
**So that** employees can access the system

---

## Acceptance Criteria

- [ ] Admin clicks "Create User" button on users list page
- [ ] Form page displays with required fields:
  - Full name (required)
  - Email (required, validated)
  - Role (required, dropdown)
  - Department (optional for city-wide roles, required for dept roles)
  - Title (optional)
- [ ] Form validates inputs before submission
- [ ] Admin submits form
- [ ] System creates auth.users record (Supabase Auth)
- [ ] System sends invitation email to user
- [ ] System creates public.users profile record
- [ ] Success message displayed
- [ ] User redirected to users list
- [ ] New user appears in user list
- [ ] User can log in via invitation link and set password

---

## Technical Tasks

### Task 1: Create User Form Page
- [ ] Create `/app/(dashboard)/admin/users/new/page.tsx`
- [ ] Add "Create User" button to users list page (already exists in Story 4.1)
- [ ] Create form layout with proper spacing and styling

### Task 2: Build CreateUserForm Component
- [ ] Create `components/admin/CreateUserForm.tsx`
- [ ] Implement form fields with react-hook-form
- [ ] Add role dropdown with all 7 roles
- [ ] Add department dropdown (conditionally required)
- [ ] Add client-side validation feedback
- [ ] Show loading state during submission

### Task 3: Create Zod Validation Schema
- [ ] Create schema for user creation
- [ ] Validate email format
- [ ] Ensure department required for dept-specific roles
- [ ] Validate all required fields

### Task 4: Implement Server Action
- [ ] Create `createUser()` in `app/actions/users.ts`
- [ ] Use Supabase Admin API to create auth user
- [ ] Send invitation email via Supabase Auth
- [ ] Create public.users profile record
- [ ] Handle errors gracefully
- [ ] Return success/error response

### Task 5: Testing & Validation
- [ ] Test form validation (empty fields, invalid email)
- [ ] Test successful user creation
- [ ] Verify invitation email sent
- [ ] Verify user appears in list
- [ ] Test role-based department requirement
- [ ] Test with different roles
- [ ] Verify RLS policies allow admin to create users

---

## UI/UX Design Notes

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Create User                             [Cancel] [Save]  │
├─────────────────────────────────────────────────────────┤
│ Full Name *                                              │
│ [___________________________________________________]    │
│                                                          │
│ Email Address *                                          │
│ [___________________________________________________]    │
│                                                          │
│ Role *                                                   │
│ [Select role ▼                                     ]    │
│                                                          │
│ Department (required for staff/director roles)          │
│ [Select department ▼                               ]    │
│                                                          │
│ Job Title                                                │
│ [___________________________________________________]    │
│                                                          │
│ * Required fields                                        │
└─────────────────────────────────────────────────────────┘
```

**Validation Rules:**
- Full name: Required, min 2 characters
- Email: Required, valid email format, unique
- Role: Required, must be one of 7 valid roles
- Department: Required if role is 'staff' or 'department_director'
- Title: Optional, max 100 characters

**Role Options:**
1. Admin
2. Department Director (requires department)
3. Staff (requires department)
4. City Manager
5. Finance
6. Council
7. Public

---

## Database Operations

### 1. Create Auth User (Supabase Admin API)
```typescript
const { data: authUser, error } = await supabase.auth.admin.createUser({
  email: formData.email,
  email_confirm: false, // User must confirm via invite link
  user_metadata: {
    full_name: formData.fullName,
  }
})
```

### 2. Send Invitation Email
```typescript
const { data, error } = await supabase.auth.admin.inviteUserByEmail(
  formData.email,
  {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
  }
)
```

### 3. Create Public User Profile
```sql
INSERT INTO public.users (
  id,
  municipality_id,
  full_name,
  email,
  role,
  title,
  department_id,
  is_active
) VALUES (
  $1, -- auth user id
  $2, -- municipality_id (from current user's municipality)
  $3, -- full_name
  $4, -- email
  $5, -- role
  $6, -- title
  $7, -- department_id (nullable)
  true -- is_active
);
```

---

## Dependencies

**Depends On:**
- Story 4.1: User Management - List Users (COMPLETED)
- Supabase Auth configured and working

**Blocks:**
- Story 4.3: User Management - Edit User
- Story 4.4: User Management - Deactivate User

---

## API Requirements

**Supabase Admin API Access:**
- Requires `SUPABASE_SERVICE_ROLE_KEY` environment variable
- Admin API can bypass RLS policies
- Used for creating auth users and sending invites

**Environment Variables Needed:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # NEW
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing Checklist

- [ ] Form loads without errors
- [ ] All fields render correctly
- [ ] Validation prevents empty full name
- [ ] Validation prevents invalid email
- [ ] Validation requires role selection
- [ ] Department required for staff/director roles
- [ ] Department optional for city-wide roles
- [ ] Form submits successfully
- [ ] Auth user created in auth.users
- [ ] Profile created in public.users
- [ ] Invitation email sent
- [ ] User appears in user list immediately
- [ ] Success message displayed
- [ ] Redirect to /admin/users works
- [ ] Error handling works (duplicate email, network error)
- [ ] Non-admin users cannot access form

---

## Dev Notes

- Use react-hook-form for form management
- Use Zod for validation schema
- Use shadcn/ui form components for consistency
- Create admin Supabase client (service role) for server actions
- Handle Supabase Auth errors gracefully
- Municipality ID should come from current authenticated user
- Consider adding "Create Another" button for bulk user creation
- Invitation link valid for 24 hours (Supabase default)

---

## Security Considerations

- Only admins can create users (enforce via RLS + UI routing)
- Service role key should only be used server-side
- Never expose service role key to client
- Validate all inputs server-side (don't trust client)
- Email should be unique constraint
- Rate limit user creation to prevent abuse (future enhancement)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Form validation works correctly
- [ ] User creation successful
- [ ] Invitation email sent and received
- [ ] User can accept invite and set password
- [ ] New user appears in list
- [ ] Error handling tested
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
