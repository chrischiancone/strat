# Story 1.1: Create New Strategic Plan

**Story ID:** STORY-1.1
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P0 (Critical - MVP Launch Blocker)
**Story Points:** 5
**Status:** In Progress
**Assigned To:** Developer
**Created:** January 10, 2025
**Last Updated:** January 10, 2025

---

## User Story

**As a** Department Director
**I want to** create a new 3-year strategic plan
**So that** I can start documenting my department's priorities for the upcoming planning cycle

---

## Acceptance Criteria

- [ ] User can click "Create New Plan" button from dashboard
- [ ] System prompts for: Department (auto-filled if user has only one), Start Fiscal Year, End Fiscal Year
- [ ] System creates draft plan with pre-filled department metadata
- [ ] User is redirected to plan edit view (or plan detail view)
- [ ] Plan appears in user's plan list with status "draft"
- [ ] Plan is scoped to user's municipality
- [ ] System validates: Start year < End year, Fiscal years exist in system
- [ ] Only users with role "department_director" or "admin" can create plans

---

## Technical Tasks

### Task 1: Review Database Schema
- [ ] Verify `strategic_plans` table exists with required columns
- [ ] Check foreign keys to departments, fiscal_years, users
- [ ] Verify RLS policies for strategic_plans table

### Task 2: Create Server Actions
- [ ] Create `getStrategicPlans()` - fetch user's plans
- [ ] Create `createStrategicPlan()` - create new plan
- [ ] Create `getFiscalYears()` - fetch available fiscal years for dropdown
- [ ] Validate user permissions (department_director or admin)
- [ ] Auto-fill department from user's profile
- [ ] Set initial status to "draft"

### Task 3: Create Strategic Plans List Page
- [ ] Create `/app/(dashboard)/plans/page.tsx`
- [ ] Display user's strategic plans in table
- [ ] Show: Plan title, Fiscal years, Status, Last updated, Actions
- [ ] "Create New Plan" button in header
- [ ] Empty state when no plans exist

### Task 4: Create New Plan Form/Modal
- [ ] Create `components/plans/CreatePlanDialog.tsx` (or form page)
- [ ] Department dropdown (pre-filled if user has one dept, required if admin)
- [ ] Start Fiscal Year dropdown
- [ ] End Fiscal Year dropdown
- [ ] Validation: End year > Start year
- [ ] Submit creates plan and redirects

### Task 5: Testing & Validation
- [ ] Test as department_director role (auto-fill department)
- [ ] Test as admin role (can select any department)
- [ ] Test validation (end year > start year)
- [ ] Test that plan appears in list after creation
- [ ] Verify RLS: users only see plans for their municipality

---

## UI/UX Design Notes

**Plans List Page Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Strategic Plans                              [+ Create New Plan] │
├─────────────────────────────────────────────────────────────────┤
│ Title | Department | Fiscal Years | Status | Updated | Actions  │
│ ────────────────────────────────────────────────────────────── │
│ FY26-28 | Parks  | 2026-2028 | Draft | Jan 10 | [Edit][View]   │
│ FY25-27 | Parks  | 2025-2027 | Approved | Dec 5 | [View]        │
└─────────────────────────────────────────────────────────────────┘
```

**Create Plan Dialog:**
```
┌──────────────────────────────────┐
│ Create New Strategic Plan        │
├──────────────────────────────────┤
│ Department: [Parks & Recreation] │ (auto-filled or dropdown)
│ Start Year: [2026 ▼]             │
│ End Year:   [2028 ▼]             │
│                                  │
│        [Cancel]  [Create Plan]   │
└──────────────────────────────────┘
```

---

## Database Schema

### strategic_plans Table (verify exists)
```sql
CREATE TABLE strategic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality_id UUID NOT NULL REFERENCES municipalities(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  created_by UUID NOT NULL REFERENCES users(id),
  title TEXT,
  start_fiscal_year INTEGER NOT NULL,
  end_fiscal_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
    -- draft, submitted, under_review, approved, archived
  executive_summary TEXT,
  vision_statement TEXT,
  mission_statement TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_year_range CHECK (end_fiscal_year > start_fiscal_year)
);
```

### RLS Policies Needed
```sql
-- Users can view plans for their municipality
CREATE POLICY "Users can view plans in their municipality"
  ON strategic_plans FOR SELECT
  USING (municipality_id IN (
    SELECT municipality_id FROM users WHERE id = auth.uid()
  ));

-- Department directors can create plans for their department
CREATE POLICY "Department directors can create plans"
  ON strategic_plans FOR INSERT
  WITH CHECK (
    department_id IN (
      SELECT department_id FROM users
      WHERE id = auth.uid() AND role = 'department_director'
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update plans they created (or are collaborators on)
CREATE POLICY "Users can update their plans"
  ON strategic_plans FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

## Server Actions

### getStrategicPlans()
```typescript
export interface StrategicPlan {
  id: string
  department_id: string
  department_name: string
  title: string | null
  start_fiscal_year: number
  end_fiscal_year: number
  status: string
  created_at: string
  updated_at: string
}

export async function getStrategicPlans(): Promise<StrategicPlan[]>
```

### createStrategicPlan()
```typescript
export interface CreatePlanInput {
  department_id: string
  start_fiscal_year: number
  end_fiscal_year: number
}

export async function createStrategicPlan(
  input: CreatePlanInput
): Promise<{ id: string }>
```

---

## Dependencies

**Depends On:**
- Story 4.0: Project Initialization (COMPLETED)
- Story 4.6: Department Management (COMPLETED)
- Story 4.8: Fiscal Year Management (COMPLETED)
- Database: strategic_plans table exists with RLS policies

**Blocks:**
- Story 1.2: Edit Plan Metadata & Overview

---

## Testing Checklist

- [ ] Page loads without errors
- [ ] "Create New Plan" button visible
- [ ] Dialog opens when button clicked
- [ ] Department pre-filled for department_director role
- [ ] Fiscal year dropdowns populated
- [ ] Validation: End year must be > Start year
- [ ] Plan created successfully
- [ ] Redirects to plan detail/edit page
- [ ] New plan appears in plans list
- [ ] Plan has status "draft"
- [ ] RLS: Users only see plans for their municipality
- [ ] Admin can select any department
- [ ] Department director can only create for their department

---

## Dev Notes

- Default plan title can be generated: "FY{start}-{end} Strategic Plan"
- User's department should be auto-filled from their profile
- Admins should be able to select any department (dropdown not pre-filled)
- After creation, redirect to plan edit page (Story 1.2)
- Plans list should be accessible from main navigation
- Consider adding plan status badges (Draft, Submitted, Approved)
- Empty state should encourage user to create first plan
- Start/End fiscal years should only show years configured in system

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Server actions created and tested
- [ ] Plans list page displays correctly
- [ ] Create plan dialog/form works
- [ ] Plan creation successful
- [ ] Redirects to appropriate page after creation
- [ ] RLS policies enforced
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
