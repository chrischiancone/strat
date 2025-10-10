# Story 1.6: Define Strategic Goals

**Story ID:** STORY-1.6
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P0 (Critical - MVP Launch Blocker)
**Story Points:** 8
**Status:** In Progress
**Assigned To:** Developer
**Created:** January 10, 2025
**Updated:** January 10, 2025

---

## User Story

**As a** Department Director
**I want to** define 3-5 strategic goals for my plan
**So that** I can organize initiatives thematically and show alignment with city priorities

---

## Acceptance Criteria

1. **Goal Creation**
   - User can add goals (up to 5) with required fields:
     - Goal number (e.g., "1", "2", "3")
     - Title (e.g., "Enhance Public Safety")
     - Description (multi-line text)
   - User can select city priority alignment from dropdown
   - User can add multiple SMART objectives (list of text items)
   - User can add success measures (list of text items)

2. **Goal Management**
   - User can reorder goals (drag-and-drop or up/down arrows)
   - User can edit existing goals
   - User can delete goals with confirmation dialog
   - If goal has associated initiatives, show warning before deletion

3. **Display**
   - Goals display in plan overview with initiative count
   - Goals are numbered sequentially
   - Empty state shows helpful message when no goals exist

4. **Validation**
   - Cannot create more than 5 goals per plan
   - Required fields: goal number, title, description
   - City priority alignment is required
   - At least one SMART objective required
   - At least one success measure required

---

## Database Schema

### Table: `strategic_goals`

```sql
CREATE TABLE strategic_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  goal_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  city_priority_alignment TEXT NOT NULL,
  smart_objectives JSONB DEFAULT '[]',
  success_measures JSONB DEFAULT '[]',
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  CONSTRAINT unique_goal_number_per_plan UNIQUE (strategic_plan_id, goal_number)
);

-- Index for querying goals by plan
CREATE INDEX idx_strategic_goals_plan_id ON strategic_goals(strategic_plan_id);

-- Index for display order
CREATE INDEX idx_strategic_goals_display_order ON strategic_goals(strategic_plan_id, display_order);
```

### City Priority Alignment Options

These will be stored as an enum or lookup table:
- Economic Development
- Public Safety
- Infrastructure & Transportation
- Environmental Sustainability
- Community Health & Wellness
- Parks & Recreation
- Administrative Excellence
- Technology & Innovation

---

## Technical Implementation

### Server Actions (`app/actions/strategic-goals.ts`)

```typescript
export interface StrategicGoal {
  id: string
  strategic_plan_id: string
  goal_number: number
  title: string
  description: string
  city_priority_alignment: string
  smart_objectives: string[]
  success_measures: string[]
  display_order: number
  created_at: string
  updated_at: string
  created_by: string
}

export async function getStrategicGoals(planId: string): Promise<StrategicGoal[]>
export async function createStrategicGoal(input: CreateGoalInput): Promise<{ id: string }>
export async function updateStrategicGoal(input: UpdateGoalInput): Promise<void>
export async function deleteStrategicGoal(goalId: string): Promise<void>
export async function reorderStrategicGoals(planId: string, goalIds: string[]): Promise<void>
```

### Components

1. **`components/plans/GoalsSection.tsx`**
   - Main container for goals management
   - Shows list of goals with expand/collapse
   - "Add Goal" button (disabled if 5 goals exist)

2. **`components/plans/GoalCard.tsx`**
   - Displays single goal in list
   - Edit and delete buttons
   - Shows initiative count badge
   - Drag handle for reordering

3. **`components/plans/GoalForm.tsx`**
   - Form for creating/editing goals
   - Fields: goal number, title, description, city priority
   - Dynamic list inputs for SMART objectives and success measures
   - Auto-save on blur or explicit save button

4. **`components/plans/DeleteGoalDialog.tsx`**
   - Confirmation dialog for goal deletion
   - Warning if goal has initiatives
   - Cancel/Confirm actions

### UI/UX Design

**Goals Section Layout:**
```
┌─────────────────────────────────────────────┐
│ Strategic Goals                    [Add Goal]│
├─────────────────────────────────────────────┤
│                                              │
│ ≡ Goal 1: Enhance Public Safety        [✏️][🗑️]│
│   City Priority: Public Safety              │
│   3 initiatives                             │
│   ▼ Show Details                            │
│                                              │
│ ≡ Goal 2: Improve Infrastructure       [✏️][🗑️]│
│   City Priority: Infrastructure             │
│   2 initiatives                             │
│   ▼ Show Details                            │
│                                              │
└─────────────────────────────────────────────┘
```

**Goal Form:**
```
┌─────────────────────────────────────────────┐
│ Add Strategic Goal                    [✕]   │
├─────────────────────────────────────────────┤
│ Goal Number: [1___]                         │
│                                              │
│ Title: [_____________________________]      │
│                                              │
│ City Priority Alignment:                    │
│ [Select priority ▼]                         │
│                                              │
│ Description:                                │
│ [________________________________]          │
│ [________________________________]          │
│ [________________________________]          │
│                                              │
│ SMART Objectives:                           │
│ • [Objective 1_______________] [Remove]     │
│ • [Objective 2_______________] [Remove]     │
│ [+ Add Objective]                           │
│                                              │
│ Success Measures:                           │
│ • [Measure 1_________________] [Remove]     │
│ • [Measure 2_________________] [Remove]     │
│ [+ Add Measure]                             │
│                                              │
│              [Cancel] [Save Goal]           │
└─────────────────────────────────────────────┘
```

---

## Integration Points

1. **Plan Edit Page (`app/(dashboard)/plans/[id]/edit/page.tsx`)**
   - Add Goals section after Department Info/Staffing
   - Before SWOT/Environmental Scan sections

2. **Plan Detail Page (`app/(dashboard)/plans/[id]/page.tsx`)**
   - Display goals in read-only format
   - Show initiative count per goal
   - Link to initiatives section

3. **Database Queries**
   - Always order goals by `display_order`
   - Include initiative count in goal queries (LEFT JOIN count)
   - Check for initiatives before allowing deletion

---

## Business Rules

1. **Goal Number Validation**
   - Must be unique within a plan
   - Typically 1, 2, 3, 4, 5
   - System should suggest next available number

2. **Display Order**
   - Separate from goal_number (allows reordering without changing numbers)
   - Reordering updates display_order but not goal_number
   - New goals get max(display_order) + 1

3. **Deletion Rules**
   - Can delete goal without initiatives (show simple confirmation)
   - Cannot delete goal with initiatives (show error or force cascade option)
   - Cascade delete should be explicit user choice

4. **City Priority Alignment**
   - Required field
   - Should come from municipality's configured priorities
   - For MVP, use hardcoded list

---

## Test Scenarios

### Happy Path
1. User clicks "Add Goal"
2. User fills in all required fields
3. User adds 2 SMART objectives
4. User adds 2 success measures
5. User saves goal
6. Goal appears in list with correct display

### Edge Cases
1. User tries to add 6th goal → blocked with message
2. User tries to save goal without required fields → validation errors
3. User deletes goal with no initiatives → success
4. User tries to delete goal with initiatives → warning/error
5. User reorders goals → display_order updates correctly
6. User edits goal and changes goal_number → validates uniqueness

### Error Cases
1. Database error during save → show error toast
2. Permission denied (wrong department) → show error
3. Plan not found → show error

---

## Definition of Done

- [ ] Story documentation created
- [ ] `strategic_goals` table exists (verify in Supabase)
- [ ] Server actions implemented with permission checks
- [ ] GoalsSection component displays goals list
- [ ] GoalForm component creates/edits goals
- [ ] Delete confirmation dialog works
- [ ] Reordering functionality works
- [ ] Goals section integrated into plan edit page
- [ ] Goals display on plan detail page (read-only)
- [ ] Validation prevents >5 goals
- [ ] Validation requires all mandatory fields
- [ ] Initiative count displays correctly
- [ ] Auto-save or manual save works reliably
- [ ] Build passes with no errors
- [ ] Code committed to git with descriptive message

---

## Notes

- This story is foundational for Story 1.7 (Create Initiative), which depends on goals existing
- Goal reordering is nice-to-have; can use simple up/down arrows instead of drag-and-drop if faster
- Consider making city priority alignment configurable per municipality in future
- SMART objectives and success measures are stored as JSONB arrays for flexibility
- Display order allows reordering without changing goal numbers (which may be referenced elsewhere)

---

**Story Progress:**
- [x] Documentation created
- [ ] Database schema verified
- [ ] Server actions implemented
- [ ] Components built
- [ ] Integration complete
- [ ] Testing complete
- [ ] Committed to git
