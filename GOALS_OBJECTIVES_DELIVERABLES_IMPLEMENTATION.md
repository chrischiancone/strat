# Goals → Objectives → Deliverables Implementation Guide

## Overview

The Add Strategic Goals process has been restructured to follow a hierarchical model matching the provided examples:
- **Goals** (G1, G2, etc.)
  - **Objectives** (O1, O2, O3, etc.)
    - **Deliverables** (D1, D2, D3, etc.)

## Example Structure

```
G1 (Goal) Achieve operational efficiency by leveraging technology to automate processes.
  O1 (Objective) Implement Isolved as Leave Administration Software (FY 2024).
    D1 (Deliverable) Go live with Isolved in April/May 2024.
    D2 (Deliverable) Work with Strategic Services Training division to develop and roll out organizational FMLA training April/May 2024.
    D3 (Deliverable) Cross-train other Workforce Services team members on FMLA process and Isolved March – May 2024.
  O2 (Objective) Phase Two of Dayforce (FY 2024 -FY 2025).
    D1 (Deliverable) Audit various interfaces with Infor...
    D2 (Deliverable) Build out document management...
```

## Files Created/Modified

### 1. Database Migration
**File**: `supabase/migrations/20251023000001_restructure_goals_objectives_deliverables.sql`

Creates two new tables:
- `strategic_objectives`: Stores objectives with numbering (O1, O2, etc.)
- `strategic_deliverables`: Stores deliverables with numbering (D1, D2, etc.)

Features:
- Full RLS policies for both tables
- Audit triggers for tracking changes
- Cascading deletes (Goal → Objectives → Deliverables)
- Display order support for custom sorting
- Target date tracking for deliverables
- Status tracking (not_started, in_progress, completed, deferred)

### 2. TypeScript Types
**File**: `lib/types/database.ts`

New interfaces:
- `StrategicObjective`: Objective data structure
- `StrategicDeliverable`: Deliverable data structure
- `DeliverableStatus`: Status type for deliverables
- `StrategicObjectiveWithRelations`: Objective with nested deliverables

Updated interfaces:
- `StrategicGoal`: Added new fields, kept legacy fields for backward compatibility

### 3. Server Actions

#### Objectives Actions
**File**: `app/actions/strategic-objectives.ts`

Functions:
- `getStrategicObjectives(goalId)`: Fetch all objectives for a goal
- `createStrategicObjective(input)`: Create new objective
- `updateStrategicObjective(input)`: Update objective
- `deleteStrategicObjective(objectiveId)`: Delete objective (validates no deliverables)
- `reorderStrategicObjectives(goalId, objectiveIds)`: Reorder objectives

#### Deliverables Actions
**File**: `app/actions/strategic-deliverables.ts`

Functions:
- `getStrategicDeliverables(objectiveId)`: Fetch all deliverables for an objective
- `createStrategicDeliverable(input)`: Create new deliverable
- `updateStrategicDeliverable(input)`: Update deliverable (including status)
- `deleteStrategicDeliverable(deliverableId)`: Delete deliverable
- `reorderStrategicDeliverables(objectiveId, deliverableIds)`: Reorder deliverables

### 4. Form Component
**File**: `components/plans/GoalFormNew.tsx`

Features:
- Hierarchical form with nested objectives and deliverables
- Color-coded sections:
  - Blue background for objectives
  - Green background for deliverables
- Collapsible objectives for better UX
- Auto-numbering (O1, O2, O3... / D1, D2, D3...)
- Add/remove objectives and deliverables dynamically
- Target date picker for deliverables
- Validation:
  - At least one objective required
  - Each objective must have at least one deliverable
  - All required fields validated

### 5. Display Component
**File**: `components/plans/GoalCardNew.tsx`

Features:
- Shows goal with "G" prefix (G1, G2, etc.)
- Loads objectives and deliverables on expansion
- Visual hierarchy:
  - Goals in card header
  - Objectives in blue boxes
  - Deliverables in white boxes with green borders
- Status indicators for deliverables:
  - ✓ Completed (green)
  - ⏱ In Progress (blue)
  - ✕ Deferred (gray)
  - ○ Not Started (light gray)
- Target date display
- Backward compatibility with legacy objectives/success_measures

### 6. Updated GoalsSection
**File**: `components/plans/GoalsSection.tsx`

Changes:
- Uses `GoalFormNew` instead of `GoalForm`
- Uses `GoalCardNew` instead of `GoalCard`
- All existing functionality preserved (AI generation, reordering, etc.)

## Migration Steps

### Step 1: Run the Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or via Supabase Dashboard
# Navigate to Database → Migrations
# Upload: 20251023000001_restructure_goals_objectives_deliverables.sql
```

### Step 2: Test the New Structure

1. Navigate to a strategic plan
2. Click "Add Goal"
3. Fill in goal details
4. Add objectives (O1, O2, etc.)
5. For each objective, add deliverables (D1, D2, etc.)
6. Save and verify the hierarchical display

### Step 3: Migrate Existing Data (Optional)

If you have existing goals with legacy `objectives` and `success_measures` arrays:

```sql
-- Custom migration script would be needed to convert
-- existing JSONB arrays into the new table structure
-- Contact for assistance if needed
```

## Features

### Goal Level
- Goal number (G1, G2, G3, etc.)
- Title
- Description
- City priority alignment
- Display order with reordering

### Objective Level
- Objective number (O1, O2, O3, etc.)
- Title
- Description (optional)
- Display order
- Linked to parent goal

### Deliverable Level
- Deliverable number (D1, D2, D3, etc.)
- Title
- Description
- Target date (optional)
- Status tracking (not_started, in_progress, completed, deferred)
- Display order
- Linked to parent objective

## Backward Compatibility

The system maintains backward compatibility:
- Legacy `objectives` and `success_measures` JSONB fields preserved in `strategic_goals` table
- `GoalCardNew` displays legacy fields if no new objectives exist
- Old goals continue to work without breaking

## Benefits

1. **Better Organization**: Clear three-level hierarchy matches common strategic planning practices
2. **Individual Tracking**: Each deliverable can be tracked separately with status and dates
3. **Flexibility**: Add/remove objectives and deliverables independently
4. **Reporting**: Easy to query deliverables by status, date, objective, or goal
5. **Scalability**: Can extend with additional fields (assignees, progress %, etc.)

## Future Enhancements

Potential additions:
- Drag-and-drop reordering for objectives and deliverables
- Bulk status updates
- Progress tracking (percentage complete)
- Assignee/owner fields
- Dependencies between deliverables
- Gantt chart visualization
- Integration with calendar systems
- Notification system for approaching target dates

## AI Research Integration

The AI research system (`generateStrategicGoals`) currently generates suggestions in the old format. To update it for the new structure, the `StrategicGoalSuggestion` interface in `app/actions/ai-research.ts` would need to be updated to include structured objectives with deliverables.

## Support

For questions or issues with the new implementation:
1. Check the migration was applied successfully
2. Verify RLS policies are active
3. Check browser console for any errors
4. Review server action logs for permission issues

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Can create new goal with objectives and deliverables
- [ ] Can view goal with hierarchical display
- [ ] Can edit goal (note: currently only edits goal-level fields)
- [ ] Can delete goal (validates no initiatives)
- [ ] Can reorder goals
- [ ] Deliverable status indicators display correctly
- [ ] Target dates display correctly
- [ ] Legacy goals still display properly
- [ ] AI goal generation works (may need update)
