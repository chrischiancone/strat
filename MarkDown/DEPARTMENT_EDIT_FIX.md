# Department Edit Page 404 Error Fix

## Issue
When trying to edit a department from `/admin/departments`, users were getting a 404 error.

## Root Cause Analysis
The 404 error was caused by the `getDepartmentById` function in `/app/actions/departments.ts` using the regular Supabase client instead of the admin client, which caused Row Level Security (RLS) policies to block access to department data.

## Fixes Applied

### 1. Updated getDepartmentById Function (app/actions/departments.ts)

**Before:**
```typescript
export async function getDepartmentById(departmentId: string) {
  const supabase = createServerSupabaseClient() // Regular client with RLS

  const { data, error } = await supabase
    .from('departments')
    .select(`
      id,
      name,
      slug,
      director_name,
      director_email,
      mission_statement,
      is_active
    `)
    .eq('id', departmentId) // Missing municipality filtering
    .single()

  if (error) {
    console.error('Error fetching department:', error)
    return null
  }

  return data
}
```

**After:**
```typescript
export async function getDepartmentById(departmentId: string) {
  // Get current user's municipality_id first
  const serverSupabase = createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const { data: userProfile } = await serverSupabase
    .from('users')
    .select('municipality_id')
    .eq('id', user.id)
    .single<{ municipality_id: string }>()
    
  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Use admin client to bypass RLS for reading department
  const supabase = createAdminSupabaseClient()

  const { data, error } = await supabase
    .from('departments')
    .select(`
      id,
      name,
      slug,
      director_name,
      director_email,
      mission_statement,
      is_active
    `)
    .eq('id', departmentId)
    .eq('municipality_id', userProfile.municipality_id) // Added municipality filtering
    .single()

  if (error) {
    console.error('Error fetching department:', error)
    return null
  }

  return data
}
```

### 2. Added Authentication and Role Checking (app/(dashboard)/admin/departments/[id]/page.tsx)

**Added:**
```typescript
// Verify user has admin access
const supabase = createServerSupabaseClient()
const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {
  notFound()
}

const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single<{ role: string }>()

if (!profile || profile.role !== 'admin') {
  notFound()
}
```

## Key Changes Made

### 1. Authentication & Authorization
- Added proper user authentication check
- Added role-based access control (admin only)
- Added municipality-based data filtering

### 2. Database Access Pattern
- **Switched from regular Supabase client to admin client** for bypassing RLS
- **Added municipality filtering** to ensure users only see their own municipality's departments
- **Consistent pattern** with other department management functions

### 3. Error Handling
- Proper error handling for authentication failures
- Proper error handling for missing user profiles
- Consistent error responses with other admin functions

## Technical Details

### Why the Admin Client Fix Works:
1. **RLS Bypass**: Admin client bypasses Row Level Security policies that were blocking access
2. **Municipality Scoping**: Added explicit municipality filtering to maintain data security
3. **Consistent Pattern**: Matches the pattern used in other department functions like `getDepartmentsWithStats`

### Security Considerations:
- Users can only access departments from their own municipality
- Only admin users can access the edit functionality
- Authentication is verified before any database operations

## Files Modified:
1. `app/actions/departments.ts` - Updated getDepartmentById function
2. `app/(dashboard)/admin/departments/[id]/page.tsx` - Added auth and role checking

## Testing:
The fix should resolve the 404 error when clicking "Edit" on departments in the admin departments page. Users should now be able to:
1. Navigate to the edit department page
2. See the department data populated in the form
3. Successfully update department information

## Verification Steps:
1. Go to `/admin/departments`
2. Click "Edit" on any department
3. Verify the page loads without 404 error
4. Verify the form is populated with department data
5. Test making changes and saving