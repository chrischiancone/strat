# Story 4.4: User Management - Deactivate User

**Story ID:** STORY-4.4
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
**I want to** deactivate a user account
**So that** former employees cannot access the system

---

## Acceptance Criteria

- [ ] Admin can see deactivate/reactivate button on user row in users list
- [ ] Active users show "Deactivate" button
- [ ] Inactive users show "Reactivate" button
- [ ] System prompts for confirmation before deactivating
- [ ] System prompts for confirmation before reactivating
- [ ] Deactivating sets `is_active = false` on public.users record
- [ ] Deactivating disables auth.users account (user cannot log in)
- [ ] Reactivating sets `is_active = true` on public.users record
- [ ] Reactivating enables auth.users account (user can log in)
- [ ] User still appears in audit logs and historical records
- [ ] User still appears in users list (with Inactive status)
- [ ] Changes reflected immediately in user list
- [ ] Success message displayed

---

## Technical Tasks

### Task 1: Create Server Actions
- [ ] Create `deactivateUser()` in `app/actions/users.ts`
- [ ] Create `reactivateUser()` in `app/actions/users.ts`
- [ ] Update public.users.is_active
- [ ] Update auth.users banned status (via Supabase Admin API)
- [ ] Revalidate users list

### Task 2: Add Confirmation Dialog
- [ ] Install/use existing dialog component (shadcn/ui)
- [ ] Create confirmation dialog for deactivate
- [ ] Create confirmation dialog for reactivate
- [ ] Show user name in confirmation message

### Task 3: Update UsersTable Component
- [ ] Add action column with deactivate/reactivate button
- [ ] Show appropriate button based on user status
- [ ] Trigger confirmation dialog on click
- [ ] Handle loading state during operation

### Task 4: Testing & Validation
- [ ] Test deactivating active user
- [ ] Verify user cannot log in after deactivation
- [ ] Test reactivating inactive user
- [ ] Verify user can log in after reactivation
- [ ] Test error handling
- [ ] Verify changes reflected in list

---

## UI/UX Design Notes

**Users Table with Actions:**
```
┌────────────────────────────────────────────────────────┐
│ Name      | Email | Role | Status  | Actions           │
├────────────────────────────────────────────────────────┤
│ John Doe  | john@ | Dir. | Active  | [Edit][Deactivate]│
│ Jane Smith| jane@ | Staff| Inactive| [Edit][Reactivate]│
└────────────────────────────────────────────────────────┘
```

**Confirmation Dialog:**
```
┌─────────────────────────────────────┐
│ Deactivate User?                    │
├─────────────────────────────────────┤
│ Are you sure you want to deactivate │
│ John Smith (john.smith@city.gov)?   │
│                                     │
│ This user will not be able to log  │
│ in until reactivated.               │
│                                     │
│          [Cancel] [Deactivate]      │
└─────────────────────────────────────┘
```

---

## Database Operations

### Deactivate User
```typescript
// Update public.users
await supabase
  .from('users')
  .update({ is_active: false })
  .eq('id', userId)

// Ban auth.users (Supabase Admin API)
await adminClient.auth.admin.updateUserById(userId, {
  ban_duration: 'none', // Permanent ban until reactivated
})
```

### Reactivate User
```typescript
// Update public.users
await supabase
  .from('users')
  .update({ is_active: true })
  .eq('id', userId)

// Unban auth.users
await adminClient.auth.admin.updateUserById(userId, {
  ban_duration: '0s', // Remove ban
})
```

---

## Dependencies

**Depends On:**
- Story 4.1: User Management - List Users (COMPLETED)
- Story 4.3: User Management - Edit User (COMPLETED)

**Blocks:**
- None (parallel with other user management stories)

---

## Testing Checklist

- [ ] Deactivate button appears for active users
- [ ] Reactivate button appears for inactive users
- [ ] Confirmation dialog displays on deactivate
- [ ] Confirmation dialog displays on reactivate
- [ ] Deactivate updates public.users.is_active to false
- [ ] Deactivate prevents user login (auth disabled)
- [ ] Reactivate updates public.users.is_active to true
- [ ] Reactivate allows user login (auth enabled)
- [ ] User remains in users list after deactivation
- [ ] Status badge updates immediately
- [ ] Action button switches between deactivate/reactivate
- [ ] Error handling works
- [ ] Non-admin users cannot deactivate

---

## Dev Notes

- Use Supabase Admin API to ban/unban auth users
- Banning prevents login without deleting the user
- User data (plans, comments, etc.) remains intact
- Consider adding deactivation reason field (future enhancement)
- Consider logging deactivation/reactivation in audit log
- Cannot deactivate self (prevent lockout) - future enhancement
- Soft delete approach - never actually delete users

---

## Security Considerations

- Only admins can deactivate/reactivate users
- Cannot deactivate the last admin (prevent lockout) - future
- Deactivated users lose all access immediately
- Deactivation does not delete historical data
- Use Admin API for auth changes (service role key)

---

## Alternative Approaches

**Option 1: Soft Delete via is_active (CHOSEN)**
- Pros: Simple, reversible, preserves data
- Cons: User still in database

**Option 2: Hard Delete**
- Pros: Removes user completely
- Cons: Breaks foreign keys, loses audit trail

**Option 3: Archive Table**
- Pros: Cleaner active users table
- Cons: More complex, harder to reactivate

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Deactivate flow works
- [ ] Reactivate flow works
- [ ] User cannot log in when deactivated
- [ ] User can log in when reactivated
- [ ] Error handling tested
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
