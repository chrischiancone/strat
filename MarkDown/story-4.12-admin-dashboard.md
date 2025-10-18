# Story 4.12: Admin Dashboard

**Story ID:** STORY-4.12
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
**I want to** view a dashboard with system statistics and quick access to admin functions
**So that** I can monitor system health and quickly access common administrative tasks

---

## Acceptance Criteria

- [ ] Admin can navigate to "Dashboard" page from sidebar
- [ ] Dashboard displays key statistics:
  - Total users (active/inactive breakdown)
  - Total departments
  - Current fiscal year
  - Total strategic plans (by status)
  - Recent audit log count (last 24 hours)
- [ ] Dashboard shows quick action cards:
  - "Create User" button → navigates to user creation
  - "Manage Departments" button → navigates to departments
  - "View Audit Logs" button → navigates to audit logs
  - "Manage Users" button → navigates to users list
- [ ] Statistics update in real-time (on page load)
- [ ] Dashboard is mobile-responsive
- [ ] Loading states shown while fetching statistics
- [ ] Error states handled gracefully

---

## Technical Tasks

### Task 1: Create Dashboard Statistics Server Action
- [ ] Create `getDashboardStats()` in `app/actions/admin.ts`
- [ ] Fetch total users count (active/inactive)
- [ ] Fetch total departments count
- [ ] Fetch current fiscal year
- [ ] Fetch strategic plans count by status
- [ ] Fetch recent audit logs count (last 24 hours)
- [ ] All queries scoped to current user's municipality

### Task 2: Create DashboardStats Component
- [ ] Create `components/admin/DashboardStats.tsx`
- [ ] Display stat cards in grid layout
- [ ] Show icon for each stat type
- [ ] Format numbers with commas for readability
- [ ] Show loading skeleton state
- [ ] Show error state if fetch fails

### Task 3: Create QuickActions Component
- [ ] Create `components/admin/QuickActions.tsx`
- [ ] Display action cards in grid
- [ ] Each card links to appropriate admin page
- [ ] Show icon for each action
- [ ] Hover states for better UX

### Task 4: Create Admin Dashboard Page Route
- [ ] Create `/app/(dashboard)/admin/page.tsx`
- [ ] Dashboard link already exists in sidebar
- [ ] Add page layout with header, stats, and quick actions
- [ ] Use Suspense for loading states

### Task 5: Testing & Validation
- [ ] Test dashboard loads correctly
- [ ] Test all statistics display correctly
- [ ] Test quick action links navigate correctly
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test mobile responsiveness

---

## UI/UX Design Notes

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Admin Dashboard                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Statistics                                                      │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │ Users   │ │ Depts   │ │ FY      │ │ Plans   │               │
│ │ 42      │ │ 8       │ │ 2025    │ │ 12      │               │
│ │ 40/2    │ │         │ │         │ │ 5/4/3   │               │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│                                                                 │
│ Quick Actions                                                   │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│ │ Create User │ │ Manage Dpts │ │ View Logs   │               │
│ └─────────────┘ └─────────────┘ └─────────────┘               │
│ ┌─────────────┐ ┌─────────────┐                               │
│ │ Manage      │ │ Fiscal      │                               │
│ │ Users       │ │ Years       │                               │
│ └─────────────┘ └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

**Stat Cards:**
- Large number display
- Label below number
- Subtle background color
- Icon on left side
- Breakdown text in smaller font (e.g., "40 active / 2 inactive")

**Quick Action Cards:**
- Icon + text label
- Hover effect (shadow/scale)
- Click navigates to target page
- Consistent sizing

---

## Database Queries

### Users Statistics
```sql
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE status = 'active') as active_users,
  COUNT(*) FILTER (WHERE status = 'inactive') as inactive_users
FROM users
WHERE municipality_id = $1;
```

### Departments Count
```sql
SELECT COUNT(*) as total_departments
FROM departments
WHERE municipality_id = $1;
```

### Current Fiscal Year
```sql
SELECT year
FROM fiscal_years
WHERE municipality_id = $1
  AND is_active = true
LIMIT 1;
```

### Strategic Plans by Status
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'draft') as draft_plans,
  COUNT(*) FILTER (WHERE status = 'submitted') as submitted_plans,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_plans,
  COUNT(*) as total_plans
FROM strategic_plans
WHERE municipality_id = $1;
```

### Recent Audit Logs (Last 24 Hours)
```sql
SELECT COUNT(*) as recent_logs
FROM audit_logs
WHERE municipality_id = $1
  AND created_at >= NOW() - INTERVAL '24 hours';
```

---

## Dependencies

**Depends On:**
- Story 4.0: Project Initialization (COMPLETED)
- Story 4.1-4.11: All other admin pages (COMPLETED)

**Blocks:**
- None (Final story in Epic 4)

---

## Testing Checklist

- [ ] Page loads without errors
- [ ] All statistics display correctly
- [ ] User count shows active/inactive breakdown
- [ ] Department count is accurate
- [ ] Current fiscal year displays
- [ ] Strategic plans count by status is accurate
- [ ] Recent audit logs count is accurate
- [ ] All quick action buttons navigate correctly
- [ ] Loading states display properly
- [ ] Error states handled gracefully
- [ ] Dashboard is mobile-responsive
- [ ] Non-admin users cannot access page

---

## Dev Notes

- Dashboard should be the default landing page for admins
- Use skeleton loaders for better perceived performance
- Statistics should refresh on each page load
- Consider adding time-based greeting (Good morning/afternoon/evening)
- Use lucide-react icons for consistency
- Grid layout should be responsive (4 cols desktop, 2 cols tablet, 1 col mobile)
- Quick actions should be visually distinct from statistics
- Consider adding "Last updated" timestamp
- All counts scoped to current user's municipality
- Error boundary to prevent dashboard crash from affecting navigation

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Dashboard displays correctly
- [ ] Statistics are accurate
- [ ] Quick actions navigate correctly
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git
- [ ] Epic 4 fully completed

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
