# Reports To Feature Implementation

This feature adds supervisor/subordinate relationships to user management, enabling strategic plan review workflows where users can be assigned supervisors who can review and approve their strategic plans.

## Changes Made

### 1. Database Schema
- **Migration File**: `supabase/migrations/20251015000001_add_reports_to_field.sql`
- **Manual Script**: `scripts/add-reports-to-column.sql` (use if migration can't be auto-applied)
- Added `reports_to` UUID column to `users` table referencing `users(id)`
- Added database constraints to prevent self-reporting
- Added performance index for supervisor queries

### 2. Validation Schemas
- **File**: `lib/validations/user.ts`
- Added optional `reportsTo` field to both `createUserSchema` and `updateUserSchema`

### 3. User Actions & API
- **File**: `app/actions/users.ts`
- Added `getPotentialSupervisors()` function to fetch eligible supervisors
- Updated `UserWithDepartment` interface to include supervisor information
- Modified `getUsers()` to fetch and display supervisor names
- Updated `createUser()` and `updateUser()` to handle reports-to relationships
- Updated `getUserById()` to include reports-to field

### 4. User Interface Components
- **Create User Form**: `components/admin/CreateUserForm.tsx`
  - Added supervisor dropdown with list of potential supervisors
  - Shows supervisor name, role, and title for easy selection
  - Includes helpful text explaining the purpose

- **Edit User Form**: `components/admin/EditUserForm.tsx`
  - Added supervisor dropdown (excludes current user to prevent self-reporting)
  - Preserves existing supervisor selection when editing
  - Shows same supervisor information as create form

- **Users Table**: `components/admin/UsersTable.tsx`
  - Added "Reports To" column showing supervisor name
  - Shows "—" when user has no supervisor (reports to leadership)

## Database Migration

### Option 1: Automatic Migration (if Supabase CLI is configured)
```bash
npx supabase db push
```

### Option 2: Manual Migration (if no Supabase CLI)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/add-reports-to-column.sql`
4. Execute the script

## Testing Instructions

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Apply the database migration** using one of the methods above

3. **Test Create User Flow**:
   - Navigate to `/admin/users`
   - Click "Create User" 
   - Fill out the form and select a supervisor from the dropdown
   - Verify the user is created with the supervisor relationship

4. **Test Edit User Flow**:
   - Go to `/admin/users`
   - Click "Edit" on an existing user
   - Modify the "Reports To" field
   - Save and verify the change persists

5. **Test Users Table Display**:
   - Verify the "Reports To" column shows supervisor names correctly
   - Check that users without supervisors show "—"

6. **Test Data Integrity**:
   - Verify users cannot be set to report to themselves
   - Check that deleting a supervisor sets subordinate's reports_to to NULL

## Strategic Plan Review Integration

With this feature in place, you can now:

1. **Identify Reviewers**: Query `users` table to find who should review each person's strategic plans
2. **Build Approval Workflows**: Create approval chains based on reporting relationships
3. **Send Notifications**: Notify supervisors when their direct reports submit plans for review

### Example Query to Find Supervisor
```sql
SELECT supervisor.full_name as supervisor_name, supervisor.email as supervisor_email
FROM users employee
LEFT JOIN users supervisor ON employee.reports_to = supervisor.id
WHERE employee.id = 'user-id-here';
```

## Future Enhancements

1. **Hierarchical Views**: Show organizational charts based on reporting relationships
2. **Delegation**: Allow supervisors to delegate review authority to others
3. **Automatic Routing**: Automatically route strategic plans to supervisors for review
4. **Approval Chains**: Support multi-level approval processes (supervisor → department director → city manager)

## Files Modified/Created

### New Files:
- `supabase/migrations/20251015000001_add_reports_to_field.sql`
- `scripts/add-reports-to-column.sql`
- `REPORTS_TO_FEATURE.md` (this file)

### Modified Files:
- `lib/validations/user.ts`
- `app/actions/users.ts`
- `components/admin/CreateUserForm.tsx`
- `components/admin/EditUserForm.tsx`
- `components/admin/UsersTable.tsx`

The feature is now ready for testing and integration with strategic plan review workflows!