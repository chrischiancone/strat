# Story 1.7: Create Initiative with Basic Info

**Story ID:** STORY-1.7
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P0 (Critical - MVP Launch Blocker)
**Story Points:** 8
**Status:** In Progress
**Assigned To:** Developer
**Created:** January 10, 2025
**Updated:** January 10, 2025

---

## User Story

**As a** Strategic Planner
**I want to** create an initiative under a strategic goal
**So that** I can document a specific project or investment

---

## Acceptance Criteria

1. **Initiative Creation**
   - User can click "Add Initiative" on a goal
   - User can specify required fields:
     - Initiative number (e.g., "1.1", "2.3")
     - Name/Title
     - Description (multi-line text)
     - Rationale (why is this needed?)
   - User can select Priority level: NEED, WANT, NICE_TO_HAVE
   - User can set rank within priority (integer, for ordering)
   - User can add expected outcomes (list of text items)
   - User can specify responsible party (text field)

2. **Initiative Management**
   - User can edit existing initiatives
   - User can delete initiatives (with confirmation)
   - Initiatives display under their parent goal
   - Initiatives are grouped by priority level

3. **Display**
   - Initiatives show priority badge (color-coded)
   - Initiative number acts as identifier
   - Show status indicator (not_started by default)
   - Empty state shows helpful message

4. **Validation**
   - Required fields: initiative_number, name, description, priority_level
   - Initiative number must be unique within a plan
   - Rank must be positive integer
   - At least one expected outcome required

---

## Database Schema

### Table: `initiatives`

From migration 20250109000002_create_planning_tables.sql:

```sql
CREATE TABLE initiatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategic_goal_id UUID NOT NULL REFERENCES strategic_goals(id) ON DELETE CASCADE,
    lead_department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE RESTRICT,
    initiative_number TEXT NOT NULL,
    name TEXT NOT NULL,
    priority_level TEXT NOT NULL,
    rank_within_priority INTEGER DEFAULT 0,
    description TEXT,
    rationale TEXT,
    expected_outcomes JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'not_started',

    -- JSONB fields for complex data (Story 1.8, 1.9)
    financial_analysis JSONB DEFAULT '{}'::jsonb,
    roi_analysis JSONB DEFAULT '{}'::jsonb,
    cost_benefit_analysis JSONB DEFAULT '{}'::jsonb,
    implementation_timeline JSONB DEFAULT '{}'::jsonb,
    dependencies JSONB DEFAULT '{}'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,

    -- Numeric fields for aggregation (Story 1.8)
    total_year_1_cost NUMERIC(12,2) DEFAULT 0,
    total_year_2_cost NUMERIC(12,2) DEFAULT 0,
    total_year_3_cost NUMERIC(12,2) DEFAULT 0,

    responsible_party TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT initiatives_priority_check CHECK (priority_level IN ('NEED', 'WANT', 'NICE_TO_HAVE')),
    CONSTRAINT initiatives_status_check CHECK (status IN ('not_started', 'in_progress', 'at_risk', 'completed', 'deferred'))
);
```

**Note:** This story focuses only on basic initiative info. Financial analysis (Story 1.8) and ROI (Story 1.9) will use the JSONB fields later.

### Priority Levels

- **NEED**: Critical initiatives that must be funded
- **WANT**: Important initiatives that should be funded if budget allows
- **NICE_TO_HAVE**: Beneficial initiatives to fund if resources permit

### Status Values

- **not_started**: Initiative not yet begun (default)
- **in_progress**: Initiative is actively being worked on
- **at_risk**: Initiative is behind schedule or over budget
- **completed**: Initiative is finished
- **deferred**: Initiative postponed to future cycle

---

## Technical Implementation

### Server Actions (`app/actions/initiatives.ts`)

```typescript
export interface Initiative {
  id: string
  strategic_goal_id: string
  lead_department_id: string
  fiscal_year_id: string
  initiative_number: string
  name: string
  priority_level: 'NEED' | 'WANT' | 'NICE_TO_HAVE'
  rank_within_priority: number
  description: string | null
  rationale: string | null
  expected_outcomes: string[]
  status: string
  responsible_party: string | null
  created_at: string
  updated_at: string
  goal?: {
    goal_number: number
    title: string
  }
}

export async function getInitiatives(planId: string): Promise<Initiative[]>
export async function getInitiativesByGoal(goalId: string): Promise<Initiative[]>
export async function createInitiative(input: CreateInitiativeInput): Promise<{ id: string }>
export async function updateInitiative(input: UpdateInitiativeInput): Promise<void>
export async function deleteInitiative(initiativeId: string): Promise<void>
```

### Components

1. **`components/initiatives/InitiativesList.tsx`**
   - Main container showing all initiatives for a plan
   - Grouped by goal, then by priority level
   - "Add Initiative" button per goal

2. **`components/initiatives/InitiativeCard.tsx`**
   - Displays single initiative
   - Shows priority badge, status, initiative number
   - Edit and delete buttons
   - Expand/collapse for details

3. **`components/initiatives/InitiativeForm.tsx`**
   - Form for creating/editing initiatives
   - Fields: number, name, description, rationale, priority, rank, outcomes, responsible party
   - Dynamic list for expected outcomes
   - Validation

4. **`components/initiatives/InitiativesByGoal.tsx`**
   - Shows initiatives grouped by priority under a specific goal
   - Used in goal expansion view

### UI/UX Design

**Initiatives Section Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Goal 1: Enhance Public Safety       [Add Initiative]│
├─────────────────────────────────────────────────────┤
│ 📌 NEEDS (2)                                         │
│   1.1: Emergency Response Upgrade           [✏️][🗑️] │
│        Status: Not Started | Rank: 1                │
│   1.2: Equipment Modernization              [✏️][🗑️] │
│        Status: Not Started | Rank: 2                │
│                                                      │
│ 💡 WANTS (1)                                         │
│   1.3: Training Program Expansion           [✏️][🗑️] │
│        Status: Not Started | Rank: 1                │
│                                                      │
│ ⭐ NICE TO HAVES (0)                                 │
│   No initiatives in this category                   │
└─────────────────────────────────────────────────────┘
```

**Initiative Form:**
```
┌─────────────────────────────────────────────────────┐
│ Add Initiative                                [✕]   │
├─────────────────────────────────────────────────────┤
│ Goal: Goal 1: Enhance Public Safety (read-only)    │
│                                                      │
│ Initiative Number: [1.1___]                         │
│                                                      │
│ Name: [_____________________________________]       │
│                                                      │
│ Priority Level: [● NEED  ○ WANT  ○ NICE TO HAVE]   │
│                                                      │
│ Rank Within Priority: [1__]                         │
│ (Lower numbers appear first)                        │
│                                                      │
│ Description:                                         │
│ [_______________________________________________]   │
│ [_______________________________________________]   │
│ [_______________________________________________]   │
│                                                      │
│ Rationale (Why is this needed?):                    │
│ [_______________________________________________]   │
│ [_______________________________________________]   │
│                                                      │
│ Expected Outcomes:                                   │
│ • [Outcome 1_________________________] [Remove]     │
│ • [Outcome 2_________________________] [Remove]     │
│ [+ Add Outcome]                                     │
│                                                      │
│ Responsible Party: [_____________________]          │
│                                                      │
│              [Cancel] [Save Initiative]             │
└─────────────────────────────────────────────────────┘
```

---

## Integration Points

1. **Plan Edit Page (`app/(dashboard)/plans/[id]/edit/page.tsx`)**
   - Add Initiatives section after Goals section
   - Fetch both goals and initiatives

2. **Plan Detail Page (`app/(dashboard)/plans/[id]/page.tsx`)**
   - Display initiatives in read-only format
   - Group by goal and priority

3. **Goal Expansion**
   - When goal is expanded, show its initiatives
   - Quick access to add initiative to that goal

---

## Business Rules

1. **Initiative Numbering**
   - Format: `{goal_number}.{sequence}` (e.g., "1.1", "1.2", "2.1")
   - Must be unique within the strategic plan
   - System should suggest next available number for selected goal

2. **Priority Levels**
   - NEED: Must be funded (highest priority)
   - WANT: Should be funded (medium priority)
   - NICE_TO_HAVE: Could be funded (lowest priority)

3. **Rank Within Priority**
   - Used to order initiatives within same priority level
   - Lower numbers appear first (1, 2, 3...)
   - Can have gaps (allows reordering without renumbering all)

4. **Lead Department**
   - Defaults to the plan's department
   - Can be changed if cross-department initiative

5. **Fiscal Year**
   - Defaults to plan's start fiscal year
   - Represents when initiative begins

6. **Deletion**
   - Simple confirmation dialog
   - In future stories, will check for budgets/KPIs before allowing deletion

---

## Test Scenarios

### Happy Path
1. User expands a goal, clicks "Add Initiative"
2. User fills in all required fields
3. System suggests next initiative number (e.g., "2.3")
4. User selects priority "NEED", rank 1
5. User adds 2 expected outcomes
6. User saves initiative
7. Initiative appears under correct goal, in NEEDS section

### Edge Cases
1. User tries to use duplicate initiative number → validation error
2. User tries to save without required fields → validation errors
3. User changes priority → initiative moves to correct section
4. User changes rank → initiatives reorder
5. Multiple initiatives with same rank → display by creation date

### Error Cases
1. Database error during save → show error toast
2. Permission denied (wrong department) → show error
3. Goal not found → show error
4. Plan locked/archived → prevent editing

---

## Definition of Done

- [ ] Story documentation created
- [ ] Server actions implemented with permission checks
- [ ] InitiativeForm component creates/edits initiatives
- [ ] InitiativeCard component displays initiative details
- [ ] InitiativesList component groups by goal and priority
- [ ] Initiatives section integrated into plan edit page
- [ ] Initiatives display on plan detail page (read-only)
- [ ] Validation prevents duplicate initiative numbers
- [ ] Validation requires all mandatory fields
- [ ] Priority badges color-coded (NEED=red, WANT=yellow, NICE_TO_HAVE=green)
- [ ] Initiatives sorted by rank within priority
- [ ] Build passes with no errors
- [ ] Code committed to git with descriptive message

---

## Notes

- This story focuses on **basic initiative info only**
- Financial analysis (budgets, funding sources) is Story 1.8
- ROI analysis is Story 1.9
- KPI tracking is Story 1.10
- Initiative numbering convention: `{goal_number}.{sequence}`
- Lead department and fiscal year are required but can default from plan context
- Expected outcomes stored as JSONB array for flexibility
- Rank allows manual ordering within priority levels

---

## Related Stories

- **Depends on:** Story 1.6 (Define Strategic Goals)
- **Required by:** Story 1.8 (Add Initiative Financial Analysis)
- **Required by:** Story 1.9 (Add Initiative ROI Analysis)
- **Required by:** Story 1.10 (Define Initiative KPIs)

---

**Story Progress:**
- [x] Documentation created
- [ ] Database schema verified
- [ ] Server actions implemented
- [ ] Components built
- [ ] Integration complete
- [ ] Testing complete
- [ ] Committed to git
