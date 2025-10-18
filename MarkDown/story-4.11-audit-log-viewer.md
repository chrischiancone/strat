# Story 4.11: Audit Log Viewer

**Story ID:** STORY-4.11
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
**I want to** view audit logs of system activities
**So that** I can track changes and troubleshoot issues

---

## Acceptance Criteria

- [ ] Admin can navigate to "Audit Logs" page from sidebar
- [ ] Page displays table of audit log entries with columns:
  - Timestamp (date and time)
  - User (who performed the action)
  - Action (what was done)
  - Entity Type (e.g., user, department, fiscal_year)
  - Entity ID
  - Details (JSON or formatted description)
- [ ] Admin can filter by:
  - Date range
  - User
  - Action type
  - Entity type
- [ ] Admin can sort by timestamp
- [ ] Logs displayed in reverse chronological order (newest first)
- [ ] Page shows log count
- [ ] Pagination for large result sets
- [ ] Empty state displayed when no logs match filters

---

## Technical Tasks

### Task 1: Create Audit Logs Page Route
- [ ] Create `/app/(dashboard)/admin/audit-logs/page.tsx`
- [ ] Audit Logs link already exists in sidebar
- [ ] Add page layout with header, filters, and table

### Task 2: Create Server Action
- [ ] Create `getAuditLogs()` in `app/actions/audit-logs.ts`
- [ ] Fetch audit logs with user information (join)
- [ ] Support filtering by date range, user, action, entity type
- [ ] Support sorting
- [ ] Support pagination

### Task 3: Build AuditLogsTable Component
- [ ] Create `components/admin/AuditLogsTable.tsx`
- [ ] Display all audit log data
- [ ] Format timestamps in readable format
- [ ] Show user full name
- [ ] Format action names (e.g., "user_created" → "User Created")
- [ ] Expandable details view for JSON data

### Task 4: Build AuditLogsFilters Component
- [ ] Create `components/admin/AuditLogsFilters.tsx`
- [ ] Date range filter
- [ ] User filter (dropdown)
- [ ] Action type filter (dropdown)
- [ ] Entity type filter (dropdown)
- [ ] Clear filters button

### Task 5: Testing & Validation
- [ ] Test with no audit logs (empty state)
- [ ] Test with multiple audit logs
- [ ] Test filtering by each filter type
- [ ] Test sorting
- [ ] Test pagination
- [ ] Verify timestamps display correctly

---

## UI/UX Design Notes

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Audit Logs                                                      │
├─────────────────────────────────────────────────────────────────┤
│ [Date Range] [User ▼] [Action ▼] [Entity ▼] [Search] [Clear]   │
├─────────────────────────────────────────────────────────────────┤
│ Time | User | Action | Entity Type | Entity ID | Details        │
│ ────────────────────────────────────────────────────────────── │
│ 2:30 PM | John Doe | User Created | user | abc-123 | [View]    │
│ 1:15 PM | Jane Doe | Dept Updated | department | def-456 | [...] │
│ 12:00 PM | Admin | FY Created | fiscal_year | ghi-789 | [...]  │
├─────────────────────────────────────────────────────────────────┤
│ Showing 3 of 150 logs | [< Previous] [Next >]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Queries

### Main Audit Logs Query
```sql
SELECT
  al.id,
  al.user_id,
  al.action,
  al.entity_type,
  al.entity_id,
  al.details,
  al.created_at,
  u.full_name as user_name,
  u.email as user_email
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.municipality_id = $1
  AND ($2::timestamp IS NULL OR al.created_at >= $2)
  AND ($3::timestamp IS NULL OR al.created_at <= $3)
  AND ($4::uuid IS NULL OR al.user_id = $4)
  AND ($5::text IS NULL OR al.action = $5)
  AND ($6::text IS NULL OR al.entity_type = $6)
ORDER BY al.created_at DESC
LIMIT $7 OFFSET $8;
```

---

## Audit Log Actions

Common actions tracked:
- **User Actions:** user_created, user_updated, user_deactivated, user_reactivated
- **Department Actions:** department_created, department_updated
- **Fiscal Year Actions:** fiscal_year_created, fiscal_year_updated, fiscal_year_activated
- **Municipality Actions:** municipality_updated
- **Strategic Plan Actions:** plan_created, plan_updated, plan_submitted, plan_approved

---

## Dependencies

**Depends On:**
- Story 4.0: Project Initialization (COMPLETED)
- Audit log table exists in database

**Blocks:**
- None

---

## Testing Checklist

- [ ] Page loads without errors
- [ ] All columns display correctly
- [ ] Timestamps formatted correctly
- [ ] User names display correctly
- [ ] Actions formatted correctly
- [ ] Date range filter works
- [ ] User filter works
- [ ] Action filter works
- [ ] Entity type filter works
- [ ] Sorting works
- [ ] Pagination works
- [ ] Empty state shows when no logs
- [ ] Details view works
- [ ] Non-admin users cannot access page

---

## Dev Notes

- Audit logs are read-only (no edit/delete)
- Focus on display and filtering, not creation (creation happens automatically via triggers/middleware)
- Details field contains JSON data - format nicely or show as expandable
- Consider performance with large datasets (use pagination)
- Date range filter should default to last 30 days or similar
- Format action names from snake_case to Title Case
- Show "System" for actions without a user (automated actions)
- Pagination: 50 logs per page
- Times should show in user's local timezone
- Consider adding export to CSV functionality in future

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Page displays correctly
- [ ] Filtering works
- [ ] Sorting works
- [ ] Pagination works
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
