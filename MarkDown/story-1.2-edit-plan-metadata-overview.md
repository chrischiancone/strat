# Story 1.2: Edit Plan Metadata & Overview

**Story ID:** STORY-1.2
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P0 (Critical - MVP Launch Blocker)
**Story Points:** 8
**Status:** In Progress
**Assigned To:** Developer
**Created:** January 10, 2025
**Last Updated:** January 10, 2025

---

## User Story

**As a** Department Director
**I want to** edit plan metadata and department overview
**So that** I can provide context for my strategic plan

---

## Acceptance Criteria

- [ ] User can edit: Plan title, Executive summary, Department vision
- [ ] User can update department info: Director name/email, Mission statement
- [ ] User can edit core services (list)
- [ ] User can edit current staffing levels (form: Executive/Management, Professional Staff, Technical/Support)
- [ ] System auto-saves on field blur
- [ ] System shows "last saved" timestamp
- [ ] Only users with edit permissions can modify plan
- [ ] Form validation prevents saving empty required fields
- [ ] Changes are reflected immediately in plan detail view

---

## Technical Tasks

### Task 1: Create Server Actions
- [ ] Create `updateStrategicPlan()` - update plan metadata fields
- [ ] Create `getStrategicPlanForEdit()` - fetch plan with all metadata
- [ ] Validate user has edit permissions (plan creator or admin)
- [ ] Return updated data after save

### Task 2: Create Edit Form Components
- [ ] Create `PlanMetadataForm.tsx` - title, executive summary, vision
- [ ] Create `DepartmentInfoForm.tsx` - director, mission, core services
- [ ] Create `StaffingLevelsForm.tsx` - staffing breakdown form
- [ ] Auto-save on blur functionality
- [ ] Loading states during save
- [ ] Success/error toast notifications

### Task 3: Create Plan Edit Page
- [ ] Create `/app/(dashboard)/plans/[id]/edit/page.tsx`
- [ ] Fetch plan data on load
- [ ] Display forms in sections
- [ ] Show last saved timestamp
- [ ] Breadcrumb navigation
- [ ] "View Plan" button to go back to detail view

### Task 4: Testing & Validation
- [ ] Test auto-save on blur
- [ ] Test all form fields save correctly
- [ ] Test permissions (only plan creator or admin can edit)
- [ ] Test validation (required fields)
- [ ] Test that changes appear in plan detail view
- [ ] Test with long text inputs

---

## UI/UX Design Notes

**Edit Page Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [< Back to Plans] Strategic Plan Edit                [View Plan] │
├─────────────────────────────────────────────────────────────────┤
│ Plan Metadata                                Last saved: 2:30 PM │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Plan Title: [FY2026-2028 Strategic Plan              ]      │ │
│ │                                                               │ │
│ │ Executive Summary:                                            │ │
│ │ [                                                             ] │
│ │ [  Large textarea for summary                                ] │
│ │ [                                                             ] │
│ │                                                               │ │
│ │ Department Vision:                                            │ │
│ │ [                                                             ] │
│ │ [  Large textarea for vision                                 ] │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Department Information                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Director Name:  [John Smith                           ]      │ │
│ │ Director Email: [john.smith@city.gov                  ]      │ │
│ │                                                               │ │
│ │ Mission Statement:                                            │ │
│ │ [                                                             ] │
│ │ [  Textarea                                                  ] │
│ │                                                               │ │
│ │ Core Services:                                                │ │
│ │ • [Water Distribution                        ] [Remove]       │ │
│ │ • [Wastewater Treatment                      ] [Remove]       │ │
│ │ [+ Add Service]                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Current Staffing Levels                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Executive/Management:     [5  ]                              │ │
│ │ Professional Staff:       [12 ]                              │ │
│ │ Technical/Support Staff:  [8  ]                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Auto-save Behavior:**
- Save icon appears when typing
- On blur (field loses focus), auto-save triggers
- Show success message briefly
- Update "last saved" timestamp
- If error, show error toast and keep unsaved indicator

---

## Database Schema

### strategic_plans Table Fields to Update
```typescript
{
  title: string
  executive_summary: string | null
  department_vision: string | null
  updated_at: timestamp (auto-updated by trigger)
}
```

### departments Table Fields to Update
```typescript
{
  director_name: string | null
  director_email: string | null
  mission_statement: string | null
  core_services: JSONB // array of strings
  current_staffing: JSONB // object with categories
}
```

### Core Services Format (JSONB)
```json
[
  "Water Distribution",
  "Wastewater Treatment",
  "Infrastructure Maintenance"
]
```

### Staffing Levels Format (JSONB)
```json
{
  "executive_management": 5,
  "professional_staff": 12,
  "technical_support": 8
}
```

---

## Server Actions

### updateStrategicPlan()
```typescript
export interface UpdatePlanMetadataInput {
  id: string
  title?: string
  executive_summary?: string | null
  department_vision?: string | null
}

export async function updateStrategicPlan(
  input: UpdatePlanMetadataInput
): Promise<void>
```

### updateDepartmentInfo()
```typescript
export interface UpdateDepartmentInput {
  id: string
  director_name?: string | null
  director_email?: string | null
  mission_statement?: string | null
  core_services?: string[]
  current_staffing?: {
    executive_management?: number
    professional_staff?: number
    technical_support?: number
  }
}

export async function updateDepartmentInfo(
  input: UpdateDepartmentInput
): Promise<void>
```

---

## Dependencies

**Depends On:**
- Story 1.1: Create New Strategic Plan (COMPLETED)

**Blocks:**
- Story 1.3: Complete SWOT Analysis
- Story 1.6: Define Strategic Goals

---

## Testing Checklist

- [ ] Page loads with existing plan data
- [ ] All fields are editable
- [ ] Auto-save triggers on blur
- [ ] Success message shows after save
- [ ] "Last saved" timestamp updates
- [ ] Changes persist after page refresh
- [ ] Required field validation works
- [ ] Can add/remove core services
- [ ] Staffing numbers validated (positive integers)
- [ ] Non-owners cannot edit (permission check)
- [ ] Error handling if save fails
- [ ] Long text doesn't break layout

---

## Dev Notes

- Auto-save debounce: 500ms after blur
- Use optimistic UI updates where possible
- Validate department email format
- Core services: min 1 required
- Staffing levels: allow 0 but must be integers
- Show loading spinner during save
- Use toast notifications (not alerts)
- Preserve cursor position in textareas
- Department info updates the department record, not the plan
- Only plan creator, department staff, or admin can edit
- Consider using a form library like react-hook-form for validation

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All technical tasks completed
- [ ] Edit page loads correctly
- [ ] All fields save properly
- [ ] Auto-save works on blur
- [ ] Permissions enforced
- [ ] Code reviewed (self-review for now)
- [ ] No console errors or warnings
- [ ] Build passes
- [ ] Lint passes
- [ ] Story documented and committed to git

---

**Story Status:** In Progress
**Last Updated:** January 10, 2025
