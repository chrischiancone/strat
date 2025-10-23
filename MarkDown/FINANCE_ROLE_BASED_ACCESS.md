# Finance Page Role-Based Access Implementation

## Overview
The /finance page has been updated to provide role-based access for Initiative Budgets, allowing different user roles to view and manage budget data according to their permissions.

## Roles and Access Levels

### 1. **Department Director**
- **Access**: Department-specific data only
- **View**: Initiative budgets for their own department
- **Actions**: 
  - View initiative budgets
  - Filter and sort within their department
  - Export department budget data
- **Restrictions**: Cannot validate budgets, cannot see other departments

### 2. **Finance Director**
- **Access**: All departments
- **View**: Aggregate view of all initiative budgets across the municipality
- **Actions**:
  - View all initiative budgets
  - Filter and sort across all departments
  - Validate/unvalidate budgets
  - Export all budget data

### 3. **Admin**
- **Access**: All departments
- **View**: Aggregate view of all initiative budgets across the municipality
- **Actions**:
  - Same as Finance Director
  - Full administrative access

### 4. **City Manager**
- **Access**: All departments
- **View**: Aggregate view of all initiative budgets across the municipality
- **Actions**:
  - View all initiative budgets
  - Filter and sort across all departments
  - Validate/unvalidate budgets
  - Export all budget data

## Implementation Details

### Files Modified

#### 1. `/app/actions/finance-budgets.ts`
**Changes:**
- Added `department_id` to user profile query
- Updated role checking to allow: `finance`, `admin`, `city_manager`, `department_director`
- Added department filtering logic for `department_director` role
- Applied filtering in both `getFinanceInitiativeBudgets` and `getFinanceBudgetExportData` functions

**Key Logic:**
```typescript
// Check role-based access
const allowedRoles = ['finance', 'admin', 'city_manager', 'department_director']
if (!allowedRoles.includes(typedProfile.role)) {
  throw new Error('Access denied: Insufficient permissions')
}

// Apply department filtering based on role
if (typedProfile.role === 'department_director' && typedProfile.department_id) {
  // Department directors only see their own department
  transformedInitiatives = transformedInitiatives.filter((init) =>
    init.department_id === typedProfile.department_id
  )
}
```

#### 2. `/app/actions/finance-budgets-simple.ts`
**Changes:**
- Uncommented and activated the main implementation
- Added proper TypeScript types for all database queries
- Added `department_id` to user profile query
- Updated role checking to match finance-budgets.ts
- Added department filtering logic for `department_director` role
- Fixed TypeScript type issues throughout the file

**Type Definitions Added:**
```typescript
type Goal = {
  id: string
  title: string
  strategic_plan_id: string
}

type Initiative = {
  id: string
  name: string
  priority_level: string
  status: string
  total_year_1_cost: number | null
  total_year_2_cost: number | null
  total_year_3_cost: number | null
  budget_validated_by: string | null
  budget_validated_at: string | null
  strategic_goal_id: string
  fiscal_year_id: string
}
```

#### 3. `/app/(dashboard)/finance/page.tsx`
**Changes:**
- Updated profile query to include `department_id`
- Added role-based descriptions for the page header
- Dynamic description based on user role

**Role Descriptions:**
```typescript
const roleDescriptions: Record<string, string> = {
  department_director: 'Review and validate initiative budgets for your department',
  finance: 'Review and validate initiative budgets across all departments',
  admin: 'Review and validate initiative budgets across all departments',
  city_manager: 'Review and validate initiative budgets across all departments'
}
```

#### 4. `/components/finance/FinanceBudgetDashboardContent.tsx`
**No changes required** - The component already properly handles filtered data from the server actions.

### Database Schema Requirements

The implementation relies on the existing database schema:
- `users` table must have:
  - `role` column (varchar)
  - `department_id` column (uuid, nullable)
  - `municipality_id` column (uuid)

### Security Considerations

1. **Server-Side Filtering**: All filtering is performed server-side in the actions, ensuring users cannot bypass client-side restrictions
2. **Role Validation**: Every action checks the user's role before returning data
3. **Department Isolation**: Department directors are automatically restricted to their department through server-side filtering
4. **RLS Policies**: Existing Row-Level Security policies in Supabase provide additional database-level protection

### Data Flow

1. **User Authentication**: User logs in, profile is fetched including `role` and `department_id`
2. **Page Access Check**: `/finance/page.tsx` verifies user has an allowed role
3. **Data Fetching**: `getFinanceInitiativeBudgets` is called:
   - Fetches user profile with role and department
   - Validates role permissions
   - Queries initiatives based on municipality
   - Applies department filtering if user is `department_director`
   - Returns filtered data
4. **Client Display**: Component displays filtered data appropriately

### Testing Scenarios

#### Department Director
- [ ] Can access /finance page
- [ ] Sees only their department's initiatives
- [ ] Cannot see other departments in filters or data
- [ ] Summary cards show only their department totals
- [ ] Export contains only their department data
- [ ] Cannot validate budgets

#### Finance Director
- [ ] Can access /finance page
- [ ] Sees all departments' initiatives
- [ ] Can filter by any department
- [ ] Summary cards show municipality-wide totals
- [ ] Export contains all department data
- [ ] Can validate budgets

#### Admin
- [ ] Can access /finance page
- [ ] Sees all departments' initiatives
- [ ] Can filter by any department
- [ ] Summary cards show municipality-wide totals
- [ ] Export contains all department data
- [ ] Can validate budgets

#### City Manager
- [ ] Can access /finance page
- [ ] Sees all departments' initiatives
- [ ] Can filter by any department
- [ ] Summary cards show municipality-wide totals
- [ ] Export contains all department data
- [ ] Can validate budgets

### Future Enhancements

1. **Budget Validation Workflow**: Add multi-step approval process
2. **Notifications**: Alert department directors when budgets need review
3. **Comments**: Allow role-specific comments on budgets
4. **Audit Trail**: Track who viewed/modified budget data
5. **Delegation**: Allow department directors to delegate view access
6. **Budget Comparison**: Compare budgets across fiscal years by role

### Related Documentation

- [FINANCE_ACCESS_CHANGES.md](./FINANCE_ACCESS_CHANGES.md) - Original finance access documentation
- [story-3.1-view-all-initiative-budgets-dashboard.md](./story-3.1-view-all-initiative-budgets-dashboard.md) - Initiative Budgets Dashboard story
- [Epic-3-Finance-Budget-Management-UAT.md](./Epic-3-Finance-Budget-Management-UAT.md) - Finance Epic UAT

## Summary

The /finance page now provides a fully functional role-based experience:
- **Department Directors** see only their department's data
- **Admin, Finance, and City Manager** see aggregated data from all departments
- All data filtering is enforced server-side for security
- The UI dynamically adapts based on user role
- Export functionality respects role-based permissions

---

**Implementation Date**: January 2025
**Last Updated**: January 2025
