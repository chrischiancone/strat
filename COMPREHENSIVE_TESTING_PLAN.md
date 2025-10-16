# Comprehensive Testing Plan

**Strategic Planning Application**  
**Version:** 1.0  
**Last Updated:** 2025-10-16  
**Status:** Active

---

## Table of Contents

1. [Overview](#overview)
2. [Current System Status](#current-system-status)
3. [Testing Strategy](#testing-strategy)
4. [Type Checking & Code Quality](#type-checking--code-quality)
5. [Automated Testing](#automated-testing)
6. [Manual Testing Checklists by Epic](#manual-testing-checklists-by-epic)
7. [Testing Best Practices](#testing-best-practices)
8. [Testing Schedule & Cadence](#testing-schedule--cadence)
9. [Bug Tracking & Resolution](#bug-tracking--resolution)

---

## Overview

This document provides a comprehensive testing plan for the Strategic Planning application without breaking existing code. The plan covers automated tests, manual testing checklists based on epics/stories, and quality assurance procedures.

### Goals

- ✅ Ensure application works as expected across all features
- ✅ Validate all epics and stories are implemented correctly
- ✅ Prevent regressions when adding new features
- ✅ Maintain code quality and type safety
- ✅ Provide clear testing procedures for the team

---

## Current System Status

### Available NPM Scripts

```bash
# Development
npm run dev                  # Start development server
npm run build                # Build for production
npm start                    # Start production server

# Code Quality
npm run type-check          # TypeScript type checking
npm run lint                # ESLint code linting
npm run lint:fix            # Auto-fix linting issues
npm run format              # Format code with Prettier
npm run format:check        # Check code formatting
npm run validate            # Run all checks (type-check + lint + format:check)

# Database
npm run db:backup           # Backup database
npm run db:restore          # Restore database
npm run db:migrate          # Run migrations
npm run db:reset            # Reset database
npm run db:status           # Check migration status
npm run db:health           # Check database health

# Health Check
npm run health              # Check API health endpoint
```

### Current TypeScript Errors

As of 2025-10-16, there are **57 TypeScript errors** that need to be addressed:

**Categories:**
1. **Database Schema Mismatch** - Missing columns: `council_goals`, `two_factor_secret`, `two_factor_enabled`
2. **Type Safety Issues** - Missing type definitions, `any` types, nullable fields
3. **Import Errors** - Missing exports like `createClient` from Supabase
4. **Collaboration Props** - Missing `onNavigate` in CollaborationWrapper

---

## Testing Strategy

### 1. Layered Testing Approach

```
┌─────────────────────────────────────────┐
│  E2E Tests (User Journey Testing)       │ ← Full application flows
├─────────────────────────────────────────┤
│  Integration Tests (API + DB)           │ ← Feature testing
├─────────────────────────────────────────┤
│  Unit Tests (Functions & Components)    │ ← Isolated testing
├─────────────────────────────────────────┤
│  Type Checking (TypeScript)             │ ← Static analysis
├─────────────────────────────────────────┤
│  Linting & Formatting                   │ ← Code quality
└─────────────────────────────────────────┘
```

### 2. Testing Priorities

**P0 (Critical - Must Test Before Any Release)**
- User authentication & authorization
- Plan creation and editing
- Budget calculations
- Admin settings (General, Security, Notifications)
- Database migrations

**P1 (High - Test Before Major Features)**
- Collaboration features (comments, real-time)
- File uploads and attachments
- Reporting and exports
- Advanced admin settings (Appearance, Integrations, Performance, Backup, Maintenance)

**P2 (Medium - Test Periodically)**
- UI/UX consistency
- Performance optimization
- Accessibility features
- Edge cases and error handling

---

## Type Checking & Code Quality

### Step 1: Fix TypeScript Errors

#### Quick Wins (No Breaking Changes)

1. **Fix Import Errors**
   ```bash
   # Check the files with import issues
   grep -r "createClient" app/(dashboard)/plans/\[id\]/goals/page.tsx
   ```

2. **Add Missing Type Definitions**
   ```typescript
   // Create type definitions for missing properties
   interface UserProfile {
     full_name: string | null  // Allow null
     email: string | null
     // ... other fields
   }
   ```

3. **Fix Nullable Fields**
   ```typescript
   // Use optional chaining and nullish coalescing
   const userName = user?.full_name ?? 'Unknown User'
   ```

### Step 2: Run Validation Suite

```bash
# Run all checks in sequence
npm run validate

# Or run individually
npm run type-check
npm run lint
npm run format:check
```

### Step 3: Set Up Pre-Commit Hooks (Recommended)

```bash
# Install husky for git hooks
npm install --save-dev husky lint-staged

# Configure package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["npm run lint:fix", "npm run format"],
    "*.{json,md}": ["npm run format"]
  }
}
```

---

## Automated Testing

### Current State

⚠️ **No automated test suite currently exists**

### Recommended Test Framework Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
npm install --save-dev @playwright/test  # For E2E tests
```

### Test Structure

```
tests/
├── unit/                          # Unit tests
│   ├── components/                # Component tests
│   ├── actions/                   # Server action tests
│   └── lib/                       # Utility function tests
├── integration/                   # Integration tests
│   ├── api/                       # API endpoint tests
│   └── database/                  # Database operation tests
└── e2e/                           # End-to-end tests
    ├── epic-1-department-plans/   # Epic 1 user flows
    ├── epic-2-city-manager/       # Epic 2 user flows
    ├── epic-3-finance/            # Epic 3 user flows
    └── epic-4-admin/              # Epic 4 user flows
```

### Priority Test Cases

#### Unit Tests (P0)

1. **Budget Calculations**
   ```typescript
   // tests/unit/lib/budget-calculations.test.ts
   describe('Budget Calculations', () => {
     test('calculates total budget correctly', () => {
       const budget = calculateTotalBudget([
         { year1: 100000, year2: 150000, year3: 200000 }
       ])
       expect(budget).toBe(450000)
     })
   })
   ```

2. **Validation Functions**
   ```typescript
   // tests/unit/lib/validations.test.ts
   describe('Form Validations', () => {
     test('validates email format', () => {
       expect(validateEmail('test@example.com')).toBe(true)
       expect(validateEmail('invalid')).toBe(false)
     })
   })
   ```

#### Integration Tests (P0)

1. **Strategic Plan CRUD**
   ```typescript
   // tests/integration/plans/create-plan.test.ts
   describe('Create Strategic Plan', () => {
     test('creates plan with valid data', async () => {
       const result = await createStrategicPlan({
         title: 'Test Plan',
         fiscal_year_start: 2026,
         department_id: 'test-dept-id'
       })
       expect(result.error).toBeNull()
       expect(result.data).toHaveProperty('id')
     })
   })
   ```

2. **User Authentication**
   ```typescript
   // tests/integration/auth/login.test.ts
   describe('User Authentication', () => {
     test('user can login with valid credentials', async () => {
       const result = await signIn('test@example.com', 'password')
       expect(result.success).toBe(true)
     })
   })
   ```

#### E2E Tests (P1)

1. **Complete Plan Creation Flow**
   ```typescript
   // tests/e2e/epic-1/create-plan-e2e.test.ts
   test('Department Director creates complete strategic plan', async ({ page }) => {
     // Login
     await page.goto('/login')
     await page.fill('[name="email"]', 'director@test.com')
     await page.fill('[name="password"]', 'password')
     await page.click('button[type="submit"]')
     
     // Create plan
     await page.goto('/plans/new')
     await page.fill('[name="title"]', 'FY2026-2028 Strategic Plan')
     await page.click('button[type="submit"]')
     
     // Verify redirect
     expect(page.url()).toContain('/plans/')
   })
   ```

---

## Manual Testing Checklists by Epic

### Epic 1: Department Creates Strategic Plan

#### Story 1.1: Create New Strategic Plan

**Pre-conditions:**
- User logged in as Department Director
- At least one department exists
- Fiscal years configured (FY2026, FY2027, FY2028)

**Test Steps:**
1. Navigate to dashboard
2. Click "Create New Plan" button
3. Verify department is auto-filled
4. Select fiscal years (2026-2028)
5. Click "Create Plan"

**Expected Results:**
- ✅ Plan created with status "draft"
- ✅ Redirected to plan edit view
- ✅ Plan appears in plan list
- ✅ Department metadata pre-filled

**Test Data:**
```
Department: Water & Field Services
Fiscal Years: 2026-2028
```

---

#### Story 1.2: Edit Plan Metadata & Overview

**Test Steps:**
1. Open plan edit view
2. Edit plan title: "Strategic Plan FY2026-2028"
3. Add executive summary (100+ words)
4. Update department vision
5. Edit director name and email
6. Add core services (list of 3-5 items)
7. Update staffing levels

**Expected Results:**
- ✅ All fields save on blur
- ✅ "Last saved" timestamp updates
- ✅ No data loss on page refresh
- ✅ Auto-save works correctly

---

#### Story 1.3: Complete SWOT Analysis

**Test Steps:**
1. Navigate to SWOT section
2. Add 3 strengths
3. Add 3 weaknesses
4. Add 3 opportunities
5. Add 3 threats
6. Reorder items within categories
7. Delete one item
8. Save and verify

**Expected Results:**
- ✅ Can add/edit/delete items
- ✅ Drag-and-drop reordering works
- ✅ Data persists correctly
- ✅ SWOT displays in read-only view

---

#### Story 1.4: Complete Environmental Scan

**Test Steps:**
1. Navigate to Environmental Scan
2. Add demographic trends (2-3 entries)
3. Add economic factors
4. Add regulatory changes
5. Add technology trends
6. Add community expectations

**Expected Results:**
- ✅ Multiple entries per category
- ✅ Rich text editing works
- ✅ Data saved as JSONB
- ✅ Formatted display correct

---

#### Story 1.5: Add Benchmarking Data

**Test Steps:**
1. Navigate to Benchmarking section
2. Add peer municipality data
3. Add performance metrics
4. Add comparison notes
5. Save and verify

**Expected Results:**
- ✅ Benchmarking data structure correct
- ✅ Comparisons display properly
- ✅ Can edit existing benchmarks

---

#### Story 1.6: Define Strategic Goals

**Test Steps:**
1. Navigate to Strategic Goals
2. Click "Add Goal"
3. Enter goal title: "Improve Water Quality"
4. Add description (SMART format)
5. Align with city priority
6. Add 2-3 objectives
7. Define success measures
8. Save goal

**Expected Results:**
- ✅ 3-5 goals can be created
- ✅ Goals linked to city priorities
- ✅ Objectives nested under goals
- ✅ Success measures defined

---

#### Story 1.7: Create Initiative (Basic Info)

**Test Steps:**
1. Navigate to Initiatives
2. Click "Add Initiative"
3. Select associated goal
4. Enter initiative title
5. Set priority (NEED/WANT/NICE_TO_HAVE)
6. Add description
7. Add expected outcomes
8. Save initiative

**Expected Results:**
- ✅ Initiative created under goal
- ✅ Priority levels work
- ✅ Can rank initiatives
- ✅ Initiative appears in list

---

#### Story 1.8: Add Initiative Financial Analysis

**Test Steps:**
1. Open initiative edit view
2. Navigate to Budget section
3. Enter Year 1 costs:
   - Personnel: $80,000
   - Equipment: $25,000
   - Services: $15,000
   - Training: $5,000
   - Materials: $10,000
4. Enter Year 2 and Year 3 costs
5. Add funding sources:
   - General Fund: 60%
   - Grant: 40%
6. Set funding status: "Requested"
7. Save budget

**Expected Results:**
- ✅ Budget calculates totals correctly
- ✅ Funding sources add up to 100%
- ✅ Multiple funding sources supported
- ✅ Funding status tracked

**Validation:**
- Total Year 1 = $135,000
- Grand Total (3 years) calculated
- Math errors flagged

---

#### Story 1.9: Add Initiative ROI Analysis

**Test Steps:**
1. Navigate to ROI section
2. Add financial benefits (Year 1-3)
3. Add non-financial benefits
4. Add cost avoidance estimates
5. System calculates ROI
6. Save ROI data

**Expected Results:**
- ✅ ROI calculation correct
- ✅ Financial and non-financial benefits captured
- ✅ Break-even analysis shown

---

#### Story 1.10: Define Initiative KPIs

**Test Steps:**
1. Navigate to KPIs section
2. Add KPI: "Water Quality Index"
3. Set baseline: 85
4. Set Year 1 target: 88
5. Set Year 2 target: 90
6. Set Year 3 target: 92
7. Define measurement frequency: Quarterly
8. Define data source
9. Save KPI

**Expected Results:**
- ✅ Multiple KPIs can be added
- ✅ Baseline and targets set
- ✅ Measurement frequency configured
- ✅ KPIs tracked over time

---

#### Story 1.11: View Department Dashboard

**Test Steps:**
1. Navigate to department dashboard
2. Verify plan summary displayed
3. Check initiative counts by priority
4. Check budget overview
5. Check KPI progress (if tracking started)

**Expected Results:**
- ✅ Dashboard shows plan status
- ✅ Initiatives grouped by priority
- ✅ Budget totals correct
- ✅ KPI widgets display

---

### Epic 2: City Manager Reviews Plans

#### Story 2.1: View All Department Plans Dashboard

**Pre-conditions:**
- Logged in as City Manager
- Multiple departments have created plans

**Test Steps:**
1. Navigate to City Manager dashboard
2. View all department plans table
3. Filter by status: "Draft"
4. Filter by fiscal year: "FY2026"
5. Sort by total budget (descending)
6. Click on a plan to view details

**Expected Results:**
- ✅ All plans displayed
- ✅ Summary stats at top (total plans, budgets)
- ✅ Filters work correctly
- ✅ Sorting works
- ✅ Can drill into plan details

---

#### Story 2.2: View Department Plan Detail

**Test Steps:**
1. Click on a department plan
2. Navigate through sections:
   - Overview
   - SWOT
   - Goals
   - Initiatives
   - Budgets
3. Verify read-only access
4. Check breadcrumb navigation

**Expected Results:**
- ✅ Full plan displayed
- ✅ All sections accessible
- ✅ Cannot edit plan content
- ✅ Navigation works

---

#### Story 2.3: Add Comments on Plan/Initiative

**Test Steps:**
1. View initiative detail
2. Click "Add Comment"
3. Enter comment: "Please clarify the grant funding source"
4. Submit comment
5. Verify comment displays with:
   - Author name
   - Avatar
   - Timestamp

**Expected Results:**
- ✅ Comment added successfully
- ✅ Comment visible to department
- ✅ Can edit/delete own comments
- ✅ Timestamp accurate

---

#### Story 2.4: Reply to Comments (Threading)

**Test Steps:**
1. View existing comment
2. Click "Reply"
3. Enter reply: "The grant is from EPA"
4. Submit reply
5. Verify reply indented under parent

**Expected Results:**
- ✅ Reply thread created
- ✅ Threading up to 3 levels
- ✅ Reply notifications sent (if enabled)

---

#### Story 2.5: Mark Comments Resolved

**Test Steps:**
1. View comment thread
2. Department addresses feedback
3. Department clicks "Resolve"
4. Verify comment shows "Resolved" badge
5. Verify resolved comments collapse

**Expected Results:**
- ✅ Comments marked resolved
- ✅ Unresolved count updates
- ✅ Can expand resolved comments

---

#### Story 2.6: Approve/Reject Plans

**Test Steps:**
1. Review plan
2. Click "Approve Plan"
3. Add optional approval notes
4. Submit approval
5. Verify plan status changes to "Approved"

**Alternate Flow: Reject**
1. Click "Request Revisions"
2. Add feedback in comments
3. Plan status changes to "Draft"

**Expected Results:**
- ✅ Approval workflow works
- ✅ Status changes tracked
- ✅ Approval history visible
- ✅ Department notified of status change

---

#### Story 2.7: City-Wide Budget Dashboard

**Test Steps:**
1. Navigate to budget dashboard
2. View consolidated budget by department
3. View budget by fiscal year
4. View budget by funding source
5. Export to Excel

**Expected Results:**
- ✅ All department budgets aggregated
- ✅ Charts display correctly
- ✅ Excel export works
- ✅ Data accurate

---

#### Story 2.8: City-Wide Initiative Summary

**Test Steps:**
1. Navigate to initiative summary
2. View initiatives by priority (all departments)
3. Filter by priority: "NEED"
4. Check initiative counts

**Expected Results:**
- ✅ All initiatives listed
- ✅ Grouped by priority
- ✅ Department name shown
- ✅ Quick status overview

---

#### Story 2.9: Generate City Council Report

**Test Steps:**
1. Click "Generate Report"
2. Select date range: Q2 FY2026
3. Select departments: All
4. Generate PDF
5. Review report content:
   - Executive summary
   - Budget overview
   - Initiative highlights
   - Charts and graphs
6. Export to PDF

**Expected Results:**
- ✅ Report generated in <5 minutes
- ✅ All data accurate
- ✅ Charts render correctly
- ✅ PDF downloadable
- ✅ Can share link with Council

---

### Epic 3: Finance Validates Budgets

#### Story 3.1: View All Initiative Budgets Dashboard

**Pre-conditions:**
- Logged in as Finance Director
- Departments have created initiatives with budgets

**Test Steps:**
1. Navigate to Finance dashboard
2. View all initiative budgets table
3. Filter by department
4. Filter by funding source: "Grants"
5. Sort by total budget
6. Click initiative to view detail

**Expected Results:**
- ✅ All budgets visible
- ✅ Summary stats accurate
- ✅ Filters work
- ✅ Drill-down works

---

#### Story 3.2: View Initiative Budget Detail

**Test Steps:**
1. Open initiative budget detail
2. Review budget breakdown by year and category
3. Review funding sources
4. Check ROI analysis
5. Verify totals are correct

**Expected Results:**
- ✅ Detailed breakdown displayed
- ✅ Funding sources listed
- ✅ ROI data visible
- ✅ Read-only view (Finance cannot edit)

---

#### Story 3.3: Comment on Initiative Budgets

**Test Steps:**
1. View initiative budget
2. Add comment: "Equipment costs seem high. Can you provide vendor quotes?"
3. Submit comment
4. Department receives notification
5. Department responds to comment

**Expected Results:**
- ✅ Comment added to budget
- ✅ Department notified
- ✅ Comment thread works
- ✅ Can mark resolved

---

#### Story 3.4: Funding Source Tracking Dashboard

**Test Steps:**
1. Navigate to funding source dashboard
2. View pie chart of funding by source:
   - General Fund: 60%
   - Grants: 30%
   - Bonds: 5%
   - Fees: 5%
3. Check total amounts per source
4. Click funding source to see initiatives
5. Check for over-commitment alerts

**Expected Results:**
- ✅ Funding sources tracked
- ✅ Total amounts accurate
- ✅ Alert if over-committed
- ✅ Can drill into initiatives

---

#### Story 3.5: Grant-Funded Initiatives List

**Test Steps:**
1. Navigate to grant dashboard
2. View all grant-funded initiatives
3. Filter by grant status: "Pending"
4. Export list to Excel
5. Verify all grant data included

**Expected Results:**
- ✅ All grant initiatives listed
- ✅ Status tracked (secured/pending/applied)
- ✅ Excel export works
- ✅ Department and amounts shown

---

#### Story 3.6: Budget Category Analysis

**Test Steps:**
1. Navigate to category analysis
2. View spending by category across all departments
3. Identify top spending categories
4. Compare year-over-year

**Expected Results:**
- ✅ Category totals accurate
- ✅ Charts display correctly
- ✅ Comparisons work

---

#### Story 3.7: Budget Validation Workflow

**Test Steps:**
1. Finance reviews budget
2. Adds validation comments
3. Marks budget as "Validated"
4. Department can see validation status
5. Changes trigger re-validation

**Expected Results:**
- ✅ Validation status tracked
- ✅ Comments linked to validation
- ✅ Re-validation triggered correctly

---

#### Story 3.8: Export Budget Data to Excel

**Test Steps:**
1. Navigate to budget export
2. Select fiscal year: FY2026
3. Select departments: All
4. Export to Excel
5. Open Excel file
6. Verify data structure:
   - One sheet per department
   - Summary sheet
   - Budget breakdown by category
   - Funding sources

**Expected Results:**
- ✅ Excel generated
- ✅ All data included
- ✅ Formulas work
- ✅ Formatting correct

---

### Epic 4: System Administration

#### Story 4.1: User Management - List Users

**Pre-conditions:**
- Logged in as Admin
- Multiple users exist in system

**Test Steps:**
1. Navigate to Admin > Users
2. View user list table
3. Filter by role: "Department Director"
4. Filter by department: "Water & Field Services"
5. Search by name: "John"
6. Sort by last login date
7. Verify pagination (50 users per page)

**Expected Results:**
- ✅ All users displayed
- ✅ Filters work correctly
- ✅ Search works
- ✅ Sorting works
- ✅ Pagination works

---

#### Story 4.2: User Management - Create User

**Test Steps:**
1. Click "Create User"
2. Fill form:
   - Full name: "Jane Doe"
   - Email: "jane.doe@example.com"
   - Role: "Strategic Planner"
   - Department: "Parks & Recreation"
   - Title: "Senior Strategic Planner"
3. Submit form
4. Verify user created
5. Check invitation email sent
6. User logs in via invitation link
7. User sets password

**Expected Results:**
- ✅ User record created
- ✅ Invitation email sent
- ✅ User can set password
- ✅ User appears in list
- ✅ User has correct permissions

**Test Data:**
```json
{
  "full_name": "Jane Doe",
  "email": "jane.doe@example.com",
  "role": "strategic_planner",
  "department_id": "parks-rec-id",
  "title": "Senior Strategic Planner"
}
```

---

#### Story 4.3: User Management - Edit User

**Test Steps:**
1. Click "Edit" on user row
2. Change role: "Department Director" → "Strategic Planner"
3. Change department
4. Update title
5. Submit changes
6. Verify changes reflected immediately
7. Check audit log captured change

**Expected Results:**
- ✅ User updated
- ✅ Cannot change email
- ✅ Changes visible immediately
- ✅ Audit log entry created

---

#### Story 4.4: User Management - Deactivate User

**Test Steps:**
1. Click "Deactivate" on user
2. Confirm deactivation
3. Verify user status = "Inactive"
4. Attempt to log in as deactivated user
5. Verify login fails
6. User still in audit logs
7. Reactivate user (optional test)

**Expected Results:**
- ✅ User deactivated (soft delete)
- ✅ Cannot log in
- ✅ Historical data preserved
- ✅ Can be reactivated

---

#### Story 4.5: Department Management - List Departments

**Test Steps:**
1. Navigate to Admin > Departments
2. View department list
3. Check columns:
   - Name
   - Director
   - # Staff
   - # Plans
   - Status
4. Filter by status: "Active"
5. Search by name

**Expected Results:**
- ✅ All departments listed
- ✅ Stats accurate
- ✅ Filters work
- ✅ Search works

---

#### Story 4.6: Department Management - Create Department

**Test Steps:**
1. Click "Create Department"
2. Fill form:
   - Name: "Information Technology"
   - Director name: "Tech Director"
   - Director email: "tech.director@example.com"
   - Mission statement: (200 words)
3. Submit form
4. Verify department created
5. Assign users to department

**Expected Results:**
- ✅ Department created
- ✅ Can assign users
- ✅ Appears in department list
- ✅ Can be used in plan creation

---

#### Story 4.7: Department Management - Edit Department

**Test Steps:**
1. Click "Edit" on department
2. Update director info
3. Update mission statement
4. Change status to "Inactive" (test only)
5. Submit changes
6. Verify changes saved

**Expected Results:**
- ✅ Department updated
- ✅ Changes reflected
- ✅ Audit log entry

---

#### Story 4.8: Fiscal Year - List

**Test Steps:**
1. Navigate to Admin > Fiscal Years
2. View fiscal year list:
   - FY2024 (Past)
   - FY2025 (Current)
   - FY2026 (Future)
   - FY2027 (Future)
   - FY2028 (Future)
3. Check current year marked
4. Verify start/end dates

**Expected Results:**
- ✅ All fiscal years listed
- ✅ Current year highlighted
- ✅ Dates accurate

---

#### Story 4.9: Fiscal Year - Create/Edit

**Test Steps:**
1. Click "Create Fiscal Year"
2. Enter:
   - Year: 2029
   - Start date: 2028-10-01
   - End date: 2029-09-30
3. Submit form
4. Verify FY2029 created
5. Edit existing fiscal year
6. Attempt to delete FY with plans (should fail)

**Expected Results:**
- ✅ New FY created
- ✅ Can edit dates
- ✅ Cannot delete FY with plans
- ✅ Date validation works

---

#### Story 4.10: Municipality Configuration

**Test Steps:**
1. Navigate to Admin > Settings > General
2. View/edit municipality info:
   - Name: "City of Carrollton"
   - Contact email
   - Website URL
   - Timezone
   - Fiscal year start month
   - Currency
3. Enable/disable features:
   - AI assistance
   - Public dashboard
   - Multi-department collaboration
4. Save settings

**Expected Results:**
- ✅ Settings saved correctly
- ✅ Features toggle work
- ✅ Timezone settings apply
- ✅ Changes reflected immediately

---

#### Story 4.11: Audit Log Viewer

**Test Steps:**
1. Navigate to Admin > Audit Logs
2. View recent audit log entries
3. Filter by:
   - Table: "users"
   - Action: "UPDATE"
   - Date range: Last 7 days
4. Filter by user: "admin@example.com"
5. Export audit log to CSV
6. Verify CSV contains:
   - Timestamp
   - User
   - Table
   - Action
   - Old/New values

**Expected Results:**
- ✅ All changes logged
- ✅ Filters work
- ✅ CSV export works
- ✅ Data complete and accurate

---

#### Story 4.12: Admin Dashboard

**Test Steps:**
1. Navigate to Admin Dashboard
2. View metrics:
   - Total users (active/inactive)
   - Total departments
   - Total plans by status
   - Recent activity feed
   - System health status
3. Check quick links to:
   - User management
   - Department management
   - Fiscal years
   - Settings

**Expected Results:**
- ✅ All metrics accurate
- ✅ Activity feed shows recent actions
- ✅ Quick links work
- ✅ Dashboard loads quickly (<2s)

---

### Admin Settings Testing (All 8 Panels)

#### General Settings

**Test Steps:**
1. Navigate to Admin > Settings > General
2. Update timezone: "America/Chicago"
3. Update currency: "USD"
4. Update fiscal year start month: "October"
5. Toggle feature flags:
   - AI assistance: ON
   - Public dashboard: OFF
   - Multi-department collaboration: ON
6. Save settings
7. Refresh page
8. Verify settings persisted

**Expected Results:**
- ✅ All settings saved to database
- ✅ Settings load on page refresh
- ✅ Feature flags work correctly
- ✅ Timezone applied throughout app

---

#### Security Settings

**Test Steps:**
1. Navigate to Admin > Settings > Security
2. Update password policy:
   - Min length: 12
   - Require special chars: ON
   - Require uppercase: ON
   - Require numbers: ON
3. Update session settings:
   - Session timeout: 60 minutes
   - Concurrent sessions: 3
4. Update 2FA settings:
   - Require 2FA for admins: ON
5. Save settings
6. Test password policy by creating user with weak password (should fail)

**Expected Results:**
- ✅ Security settings saved
- ✅ Password policy enforced
- ✅ Session timeout works
- ✅ 2FA requirements enforced

---

#### Notification Settings

**Test Steps:**
1. Navigate to Admin > Settings > Notifications
2. Configure email notifications:
   - Plan status changes: ON
   - New comments: ON
   - Budget alerts: ON
   - Weekly digest: ON
3. Set email templates
4. Test notification delivery
5. Save settings

**Expected Results:**
- ✅ Notification settings saved
- ✅ Emails sent correctly
- ✅ Templates work
- ✅ Users receive notifications

---

#### Appearance Settings

**Test Steps:**
1. Navigate to Admin > Settings > Appearance
2. Upload logo file (PNG, max 2MB)
3. Upload favicon (ICO, 32x32)
4. Set color scheme:
   - Primary: #2563eb (Blue)
   - Secondary: #64748b (Gray)
   - Accent: #059669 (Green)
5. Select theme: "Light"
6. Set font: "Inter"
7. Toggle "Show municipality branding": ON
8. Save settings
9. Refresh page
10. Verify theme applied

**Expected Results:**
- ✅ Logo and favicon uploaded
- ✅ Colors applied throughout app
- ✅ Theme persists
- ✅ Font changes visible

---

#### Integration Settings

**Test Steps:**
1. Navigate to Admin > Settings > Integrations
2. Configure Microsoft Teams:
   - Enable: ON
   - Tenant ID: (enter value)
   - App ID: (enter value)
   - App Secret: (masked)
   - Webhook URL: (enter value)
   - Channels: ["general", "strategic-planning"]
3. Configure Active Directory:
   - Enable: ON
   - Domain: "example.com"
   - Server URL: "ldap://ad.example.com"
   - Sync frequency: Daily
4. Test connection for each integration
5. Save settings

**Expected Results:**
- ✅ Integration settings saved
- ✅ Secrets stored securely (masked in UI)
- ✅ Connection tests work
- ✅ Sync schedules configured

---

#### Performance Settings

**Test Steps:**
1. Navigate to Admin > Settings > Performance
2. Configure caching:
   - Enable caching: ON
   - Redis URL: "redis://localhost:6379"
   - Cache TTL: 3600 seconds
   - Enable query cache: ON
   - Enable page cache: ON
3. Configure database:
   - Connection pool size: 20
   - Query timeout: 30000ms
   - Enable slow query log: ON
4. Configure monitoring:
   - Enable monitoring: ON
   - Log level: "info"
   - Enable analytics: ON
   - Retention: 30 days
5. Save settings
6. Check performance metrics dashboard

**Expected Results:**
- ✅ Performance settings saved
- ✅ Caching works
- ✅ Database optimizations applied
- ✅ Monitoring tracks metrics

---

#### Backup Settings

**Test Steps:**
1. Navigate to Admin > Settings > Backup
2. Configure backup schedule:
   - Frequency: Daily
   - Time: 02:00 AM
   - Day of week: Sunday (for weekly)
3. Configure retention:
   - Keep daily: 7
   - Keep weekly: 4
   - Keep monthly: 6
   - Keep yearly: 2
4. Configure storage:
   - Provider: Supabase
   - Bucket: "municipality-backups"
   - Encryption: ON
5. Configure backup includes:
   - Database: ON
   - Files: ON
   - Settings: ON
   - Logs: OFF
6. Trigger manual backup
7. Verify backup created
8. Test restore functionality (in test environment only!)

**Expected Results:**
- ✅ Backup settings saved
- ✅ Scheduled backups run automatically
- ✅ Manual backup works
- ✅ Retention policy enforced
- ✅ Restore works (test env only)

---

#### Maintenance Settings

**Test Steps:**
1. Navigate to Admin > Settings > Maintenance
2. Enable maintenance mode
3. Set custom message: "System maintenance in progress. We'll be back soon!"
4. Add allowed IPs: ["192.168.1.100"]
5. Configure scheduled maintenance:
   - Enable: ON
   - Start: 2025-10-20 02:00
   - End: 2025-10-20 04:00
   - Recurrence: Weekly
   - Notify before: 24 hours
6. Configure health checks:
   - Enable: ON
   - Database check: ON
   - Storage check: ON
   - API check: ON
   - Check interval: 5 minutes
   - Alert on failure: ON
7. Configure system operations:
   - Auto cleanup: ON
   - Cleanup schedule: "0 2 * * *" (2 AM daily)
   - Log retention: 30 days
   - Session timeout: 60 minutes
   - Max upload size: 10 MB
8. Configure emergency contacts:
   - Primary email: "admin@example.com"
   - Secondary email: "backup@example.com"
   - Phone: "+1-555-123-4567"
   - Escalation: ON
9. Save settings
10. Test maintenance mode (access from non-whitelisted IP)
11. Disable maintenance mode

**Expected Results:**
- ✅ Maintenance mode works
- ✅ Custom message displays
- ✅ Whitelisted IPs can access
- ✅ Scheduled maintenance triggers automatically
- ✅ Health checks run on schedule
- ✅ Alerts sent on failures
- ✅ Auto cleanup runs
- ✅ Emergency contacts notified

---

## Testing Best Practices

### 1. Test Data Management

**Use Realistic Test Data**
```json
{
  "department": "Water & Field Services",
  "plan_title": "Strategic Plan FY2026-2028",
  "initiatives": [
    {
      "title": "Upgrade Water Treatment Plant",
      "priority": "NEED",
      "budget_year1": 500000
    }
  ]
}
```

**Reset Test Data Between Tests**
```bash
# Use database snapshots
npm run db:backup
npm run db:restore
```

### 2. Test Isolation

- Each test should be independent
- Don't rely on test execution order
- Clean up test data after tests
- Use unique identifiers for test data

### 3. Error Handling Testing

Test both happy paths and error scenarios:

```typescript
// Happy path
test('creates plan successfully', async () => {
  // ... valid data
})

// Error scenarios
test('fails with invalid fiscal year', async () => {
  // ... invalid data
  expect(result.error).toBeDefined()
})

test('fails without authentication', async () => {
  // ... no auth token
  expect(response.status).toBe(401)
})
```

### 4. Performance Testing

Monitor performance during testing:

- Page load times < 2 seconds
- API responses < 500ms
- Database queries < 100ms
- Report generation < 5 minutes

### 5. Accessibility Testing

Use automated tools:

```bash
# Install axe-core
npm install --save-dev @axe-core/react

# Run accessibility tests
npm run test:a11y
```

### 6. Browser Compatibility

Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### 7. Mobile Responsiveness

Test on different screen sizes:
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667

### 8. Security Testing

- Test role-based access control (RLS)
- Verify unauthorized access blocked
- Test SQL injection prevention
- Test XSS prevention
- Test CSRF protection

---

## Testing Schedule & Cadence

### Daily (Automated)

- ✅ Run type checking on commit
- ✅ Run linting on commit
- ✅ Run unit tests on push
- ✅ Run integration tests on push

### Weekly (Manual)

- ✅ Smoke test all critical paths
- ✅ Review new feature checklists
- ✅ Check admin settings functionality
- ✅ Review audit logs

### Before Each Release

- ✅ Complete epic checklists
- ✅ Run full test suite
- ✅ Performance testing
- ✅ Security review
- ✅ Accessibility audit
- ✅ Browser compatibility check
- ✅ Database backup before deployment

### Post-Release

- ✅ Smoke test production
- ✅ Monitor error logs (first 24 hours)
- ✅ Check performance metrics
- ✅ User acceptance testing

---

## Bug Tracking & Resolution

### Bug Severity Levels

**P0 (Critical - Fix Immediately)**
- System down or unusable
- Data loss or corruption
- Security vulnerabilities
- Unable to login

**P1 (High - Fix Within 24 Hours)**
- Major feature broken
- Significant user impact
- Workaround exists but difficult

**P2 (Medium - Fix Within 1 Week)**
- Minor feature broken
- Limited user impact
- Workaround exists

**P3 (Low - Fix When Possible)**
- Cosmetic issues
- Edge cases
- Minor UX improvements

### Bug Report Template

```markdown
## Bug Report

**Title:** [Clear, descriptive title]

**Severity:** P0 / P1 / P2 / P3

**Environment:**
- Browser: Chrome 120
- OS: macOS Sonoma
- User role: Department Director
- Deployment: Production / Staging / Local

**Steps to Reproduce:**
1. Login as department director
2. Create new plan
3. Add initiative
4. [Specific step that causes issue]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots:**
[Attach screenshots if applicable]

**Error Logs:**
[Paste any console errors or server logs]

**Additional Context:**
[Any other relevant information]
```

### Bug Resolution Workflow

```
[Bug Reported] → [Triaged] → [Assigned] → [In Progress] → [Fixed] → [Tested] → [Closed]
```

1. **Report** - User or tester reports bug
2. **Triage** - Team reviews, assigns severity
3. **Assign** - Developer assigned to fix
4. **Fix** - Developer fixes bug, creates PR
5. **Test** - QA verifies fix in staging
6. **Deploy** - Fix deployed to production
7. **Verify** - Confirm fix in production

---

## Appendix: Quick Reference

### Test Checklist Before Deployment

```
Pre-Deployment Checklist:
□ All TypeScript errors resolved (npm run type-check)
□ All linting issues resolved (npm run lint)
□ Code formatted (npm run format)
□ Database migrations tested
□ Epic 1 critical paths tested
□ Epic 2 critical paths tested
□ Epic 3 critical paths tested
□ Epic 4 critical paths tested
□ Admin settings tested (all 8 panels)
□ Security settings verified
□ Performance acceptable
□ Database backed up
□ Rollback plan ready
□ Monitoring configured
□ Error tracking enabled
□ Team notified of deployment
```

### Common Testing Commands

```bash
# Code Quality
npm run validate          # Run all checks
npm run type-check       # TypeScript
npm run lint             # ESLint
npm run lint:fix         # Auto-fix linting
npm run format           # Format code

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production

# Database
npm run db:health        # Check DB connection
npm run db:status        # Check migrations
npm run db:backup        # Backup database
npm run db:migrate       # Run migrations

# Health Check
npm run health           # API health check
curl http://localhost:3000/api/health
```

### Test Users (Development Only)

```
Admin:
- Email: admin@test.com
- Role: super_admin

Department Director:
- Email: director@test.com
- Role: department_director
- Department: Water & Field Services

City Manager:
- Email: manager@test.com
- Role: city_manager

Finance Director:
- Email: finance@test.com
- Role: finance_director
```

---

## Conclusion

This comprehensive testing plan ensures the Strategic Planning application works reliably across all features without breaking existing code. By following this plan, you can:

1. ✅ Fix type checking errors systematically
2. ✅ Implement automated testing gradually
3. ✅ Validate all epics and stories manually
4. ✅ Maintain code quality continuously
5. ✅ Deploy with confidence

**Next Steps:**
1. Fix critical TypeScript errors (see Section 2)
2. Run validation suite: `npm run validate`
3. Start manual testing with Epic 4 (Admin) checklists
4. Gradually add automated tests for critical paths
5. Establish regular testing cadence

**Questions?** Refer to the relevant epic documentation in `/docs/epics/` and story files in `/stories/`

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-16  
**Maintained By:** Development Team
