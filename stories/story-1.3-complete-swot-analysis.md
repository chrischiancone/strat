# Story 1.3: Complete SWOT Analysis

**Story ID:** STORY-1.3
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P0
**Story Points:** 5
**Status:** In Progress
**Created:** January 11, 2025

---

## User Story

**As a** Strategic Planner
**I want to** complete a SWOT analysis for my department
**So that** I can identify our strengths, weaknesses, opportunities, and threats

---

## Acceptance Criteria

### SWOT Management
- [ ] User can access SWOT section from plan navigation
- [ ] User can add items in each category (Strengths, Weaknesses, Opportunities, Threats)
- [ ] User can edit existing items in each category
- [ ] User can delete items in each category (with confirmation)
- [ ] Each item is a text field with multi-line support
- [ ] User can reorder items within a category (drag-and-drop or up/down buttons)
- [ ] System saves SWOT data as JSONB in strategic_plans table
- [ ] SWOT displays in read-only mode on plan detail view

### Validation
- [ ] Each SWOT item has minimum length (e.g., 10 characters)
- [ ] Each SWOT item has maximum length (e.g., 500 characters)
- [ ] User can save with empty categories (not required)
- [ ] Changes are saved when user clicks "Save" button

---

## Business Context

### Problem
Department strategic plans need to include strategic analysis to demonstrate thoughtful consideration of internal capabilities and external factors. SWOT analysis is a standard framework used in strategic planning to identify:
- **Strengths:** Internal positive factors (e.g., skilled staff, good reputation)
- **Weaknesses:** Internal negative factors (e.g., aging equipment, budget constraints)
- **Opportunities:** External positive factors (e.g., new funding sources, technology advances)
- **Threats:** External negative factors (e.g., regulatory changes, budget cuts)

### Solution
Structured SWOT form that allows planners to:
- Add multiple items per category
- Edit and refine items as planning progresses
- Reorder items by importance
- Save all SWOT data as JSONB for flexible schema

### Value Proposition
- **For Strategic Planners:** Structured framework for strategic analysis
- **For Department Directors:** Evidence-based planning with clear internal/external factors
- **For City Manager:** Understanding of department capabilities and challenges
- **For Finance Director:** Context for budget requests (e.g., aging equipment = capital needs)

---

## Technical Implementation

### Database Schema

SWOT data will be stored in the `strategic_plans` table in a JSONB column:

```sql
-- strategic_plans table already has this column
swot_analysis JSONB
```

**JSONB Structure:**
```json
{
  "strengths": [
    "Highly skilled and experienced workforce",
    "Strong community partnerships",
    "Modern fleet of vehicles"
  ],
  "weaknesses": [
    "Aging IT infrastructure",
    "Limited budget for training",
    "High staff turnover in entry-level positions"
  ],
  "opportunities": [
    "State grant funding available for technology upgrades",
    "Growing demand for services creates expansion opportunities",
    "Partnership opportunities with neighboring municipalities"
  ],
  "threats": [
    "Potential state budget cuts affecting funding",
    "Increasing regulatory compliance requirements",
    "Difficulty recruiting qualified candidates in competitive market"
  ]
}
```

### Component Structure

**New Component: `components/plans/SwotAnalysisForm.tsx`**
- Four sections (Strengths, Weaknesses, Opportunities, Threats)
- Each section has:
  - List of current items
  - Add new item button
  - Edit/Delete buttons for each item
  - Reorder buttons (up/down arrows)
- Save button at bottom
- Auto-save on blur (optional)

**Component Pattern:**
```typescript
interface SwotData {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

interface SwotAnalysisFormProps {
  planId: string
  initialSwot?: SwotData
  onSave: (swot: SwotData) => Promise<void>
  disabled?: boolean
}
```

### Server Actions

**File: `app/actions/plans.ts` (extend existing)**

```typescript
export interface SwotAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export async function updateSwotAnalysis(
  planId: string,
  swot: SwotAnalysis
): Promise<void> {
  // Permission checking
  // Update strategic_plans.swot_analysis
  // Revalidate paths
}

export async function getSwotAnalysis(planId: string): Promise<SwotAnalysis | null> {
  // Fetch strategic_plans.swot_analysis
  // Return parsed JSONB
}
```

---

## UI/UX Design

### SWOT Form Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ SWOT Analysis                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ Strengths                                    [+ Add Item]  │  │
│ ├───────────────────────────────────────────────────────────┤  │
│ │                                                            │  │
│ │ 1. Highly skilled workforce            [↑] [↓] [Edit] [×] │  │
│ │ 2. Strong community partnerships       [↑] [↓] [Edit] [×] │  │
│ │ 3. Modern fleet of vehicles            [↑] [↓] [Edit] [×] │  │
│ │                                                            │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ Weaknesses                                   [+ Add Item]  │  │
│ ├───────────────────────────────────────────────────────────┤  │
│ │                                                            │  │
│ │ 1. Aging IT infrastructure             [↑] [↓] [Edit] [×] │  │
│ │ 2. Limited training budget             [↑] [↓] [Edit] [×] │  │
│ │                                                            │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ Opportunities                                [+ Add Item]  │  │
│ ├───────────────────────────────────────────────────────────┤  │
│ │                                                            │  │
│ │ 1. State grant funding available       [↑] [↓] [Edit] [×] │  │
│ │ 2. Growing service demand              [↑] [↓] [Edit] [×] │  │
│ │                                                            │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ Threats                                      [+ Add Item]  │  │
│ ├───────────────────────────────────────────────────────────┤  │
│ │                                                            │  │
│ │ 1. Potential state budget cuts         [↑] [↓] [Edit] [×] │  │
│ │ 2. Increasing regulatory requirements  [↑] [↓] [Edit] [×] │  │
│ │                                                            │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│                                           [Cancel]  [Save SWOT]  │
└─────────────────────────────────────────────────────────────────┘
```

### Add/Edit Item Dialog

```
┌──────────────────────────────────────────────────────────┐
│ Add Strength                                             │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Highly skilled and experienced workforce            │  │
│ │                                                     │  │
│ │                                                     │  │
│ └─────────────────────────────────────────────────────┘  │
│ 0/500 characters                                          │
│                                                           │
│                                     [Cancel]  [Add Item]  │
└──────────────────────────────────────────────────────────┘
```

### Read-Only Display (Plan Detail View)

```
┌─────────────────────────────────────────────────────────────────┐
│ SWOT Analysis                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Strengths                                                         │
│ • Highly skilled and experienced workforce                        │
│ • Strong community partnerships                                   │
│ • Modern fleet of vehicles                                        │
│                                                                   │
│ Weaknesses                                                        │
│ • Aging IT infrastructure                                         │
│ • Limited budget for training                                     │
│                                                                   │
│ Opportunities                                                     │
│ • State grant funding available for technology upgrades           │
│ • Growing demand for services creates expansion opportunities     │
│                                                                   │
│ Threats                                                           │
│ • Potential state budget cuts affecting funding                   │
│ • Increasing regulatory compliance requirements                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Validation Rules

### Item Validation
- **Minimum Length:** 10 characters (prevents trivial entries like "good staff")
- **Maximum Length:** 500 characters (keeps items concise)
- **Required:** No - categories can be empty if not applicable

### Business Rules
- Items within a category should be unique (case-insensitive check)
- At least one category should have at least one item (recommendation, not enforced)
- Items are stored in order (array index = display order)

---

## Test Scenarios

### Scenario 1: Add SWOT Items
**Given** I'm editing a strategic plan
**When** I navigate to the SWOT Analysis section
**And** I click "Add Item" under Strengths
**And** I enter "Highly skilled workforce"
**And** I click "Add Item"
**Then** The item appears in the Strengths list
**And** I can add more items to other categories

### Scenario 2: Edit SWOT Item
**Given** I have existing SWOT items
**When** I click "Edit" on a strength item
**And** I change the text to "Highly skilled and experienced workforce"
**And** I click "Save"
**Then** The item text is updated
**And** The item remains in the same position

### Scenario 3: Delete SWOT Item
**Given** I have multiple items in Weaknesses
**When** I click "Delete" on one item
**Then** System shows confirmation dialog
**When** I confirm deletion
**Then** The item is removed from the list
**And** Remaining items maintain their order

### Scenario 4: Reorder SWOT Items
**Given** I have 3 items in Opportunities
**When** I click "Down" arrow on the first item
**Then** The first item becomes the second item
**And** The previous second item becomes the first item

### Scenario 5: Save SWOT Analysis
**Given** I have added/edited SWOT items
**When** I click "Save SWOT"
**Then** System saves all changes to database
**And** Shows success message
**And** SWOT data persists when I navigate away and return

### Scenario 6: View SWOT in Read-Only Mode
**Given** Strategic plan has SWOT data
**When** I view the plan detail page
**Then** SWOT displays in formatted view
**And** Shows all categories with items
**And** Does not show edit/delete buttons

---

## Edge Cases

### Case 1: Empty SWOT
**Scenario:** User hasn't added any SWOT items
**Handling:** Show empty state message: "No SWOT analysis completed yet. Click 'Add Item' to begin."

### Case 2: Very Long Items
**Scenario:** User enters 500 characters
**Handling:** Show character count, truncate at 500 characters, show validation error if exceeded

### Case 3: Duplicate Items
**Scenario:** User tries to add "Skilled workforce" when "skilled workforce" already exists
**Handling:** Show warning: "Similar item already exists in this category"

### Case 4: Reorder at Boundaries
**Scenario:** User clicks "Up" on first item or "Down" on last item
**Handling:** Disable buttons when at boundaries (first item can't move up, last item can't move down)

### Case 5: Delete Last Item
**Scenario:** User deletes the only item in a category
**Handling:** Show empty state for that category

---

## Dependencies

**Requires:**
- Story 1.2 (Edit Plan Metadata & Overview) - COMPLETED
- strategic_plans.swot_analysis JSONB column (should already exist)

**Blocks:**
- None (SWOT is optional analysis)

---

## Accessibility

- All form fields have proper labels
- Add/Edit dialogs have focus management
- Delete confirmations are keyboard accessible
- Reorder buttons have aria-labels ("Move up", "Move down")
- Character count announced to screen readers
- SWOT categories use proper heading structure

---

## Performance Considerations

- SWOT data loaded with plan (no additional query needed)
- Reorder operations are client-side (no server call until save)
- Save operation updates entire SWOT object (atomic update)
- Consider debouncing if implementing auto-save

---

## Future Enhancements (Out of Scope)

1. **Drag-and-Drop Reordering:** Replace up/down buttons with drag handles
2. **SWOT Templates:** Pre-populate common items for specific departments
3. **SWOT Matrix View:** 2x2 grid visualization
4. **AI-Assisted SWOT:** Suggest items based on department type
5. **Import from Previous Plans:** Copy SWOT from prior year

---

## Definition of Done

- [ ] Story documented with acceptance criteria
- [ ] SWOT data structure defined
- [ ] SwotAnalysisForm component created
- [ ] Server actions for SWOT operations implemented
- [ ] SWOT section integrated into plan edit page
- [ ] SWOT display added to plan detail view
- [ ] Validation implemented
- [ ] Build passes with no TypeScript errors
- [ ] Manual testing: Add, edit, delete, reorder SWOT items
- [ ] Git commit with descriptive message
- [ ] Story marked as complete in backlog

---

## Notes

- SWOT is a P0 story but was deprioritized for initial MVP
- SWOT analysis helps justify budget requests and strategic priorities
- Keep items concise and actionable
- Order matters - most important items should be first
- SWOT is typically completed early in planning process (before defining goals)

---

**Story Created:** January 11, 2025
**Last Updated:** January 11, 2025
