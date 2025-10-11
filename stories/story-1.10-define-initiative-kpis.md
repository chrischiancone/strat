# Story 1.10: Define Initiative KPIs

**Story ID:** STORY-1.10
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P0
**Story Points:** 8
**Status:** In Progress
**Created:** January 10, 2025

---

## User Story

**As a** Strategic Planner
**I want to** define KPIs for an initiative
**So that** we can track progress toward expected outcomes

---

## Acceptance Criteria

### KPI Creation
- [ ] User can add KPIs to an initiative
- [ ] User can specify metric name (required)
- [ ] User can specify measurement frequency (required): Monthly, Quarterly, Semi-annually, Annually
- [ ] User can specify baseline value (required, numeric)
- [ ] User can specify Year 1/2/3 targets (required, numeric)
- [ ] User can specify data source (optional)
- [ ] User can specify responsible party (optional)

### KPI Management
- [ ] User can edit existing KPIs
- [ ] User can delete KPIs
- [ ] System validates required fields before saving
- [ ] KPIs display in initiative detail view
- [ ] KPIs show current progress vs. targets (once tracking begins)

### Future Scope (Story 1.10 Extension)
- [ ] User can add KPIs at goal level
- [ ] User can add KPIs at plan level
- [ ] System supports KPI hierarchies (plan → goal → initiative)

**Note:** For MVP (Story 1.10), we focus on **initiative-level KPIs only**. Goal-level and plan-level KPIs will be added in a future story.

---

## Business Context

### Problem
Departments need measurable indicators to track whether initiatives are achieving their expected outcomes. Without KPIs, it's difficult to demonstrate progress or make data-driven adjustments.

### Solution
Structured KPI definition form that captures:
- What to measure (metric name)
- How often to measure (frequency)
- Where we're starting (baseline)
- Where we want to be (Year 1/2/3 targets)
- Who's responsible and where data comes from

### Value Proposition
- **For Strategic Planners:** Clear success metrics tied to each initiative
- **For Department Directors:** Data-driven progress tracking
- **For City Manager:** Objective assessment of initiative success
- **For Citizens:** Transparent accountability with measurable outcomes

---

## Technical Implementation

### Database Schema

The `initiative_kpis` table structure:

```sql
CREATE TABLE initiative_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  measurement_frequency TEXT NOT NULL, -- 'monthly', 'quarterly', 'semi_annually', 'annually'
  baseline_value NUMERIC NOT NULL,
  year_1_target NUMERIC NOT NULL,
  year_2_target NUMERIC NOT NULL,
  year_3_target NUMERIC NOT NULL,
  data_source TEXT,
  responsible_party TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_initiative_kpis_initiative_id ON initiative_kpis(initiative_id);
```

### Component Structure

**New Component: `InitiativeKpisForm.tsx`**
- List of existing KPIs with expand/collapse
- Add new KPI button + dialog
- Edit KPI inline or in dialog
- Delete KPI with confirmation
- Validation for required fields

**Updated Component: `InitiativeCard.tsx`**
- Display KPI count in header
- Show KPIs in expanded view
- Link to manage KPIs

### Server Actions

**File: `app/actions/initiative-kpis.ts`**

```typescript
export interface InitiativeKpi {
  id: string
  initiative_id: string
  metric_name: string
  measurement_frequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually'
  baseline_value: number
  year_1_target: number
  year_2_target: number
  year_3_target: number
  data_source: string | null
  responsible_party: string | null
  created_at: string
  updated_at: string
}

export interface CreateKpiInput {
  initiative_id: string
  metric_name: string
  measurement_frequency: string
  baseline_value: number
  year_1_target: number
  year_2_target: number
  year_3_target: number
  data_source?: string
  responsible_party?: string
}

export async function getInitiativeKpis(initiativeId: string): Promise<InitiativeKpi[]>
export async function createInitiativeKpi(input: CreateKpiInput): Promise<{ id: string }>
export async function updateInitiativeKpi(input: UpdateKpiInput): Promise<void>
export async function deleteInitiativeKpi(id: string): Promise<void>
```

---

## UI/UX Design

### KPI Management Section

```
┌─────────────────────────────────────────────────────────────┐
│ Key Performance Indicators (3)                  [+ Add KPI] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Response Time (minutes)                        [Edit]│  │
│ │ ───────────────────────────────────────────────────────  │
│ │ Frequency: Monthly                                     │  │
│ │ Baseline: 15 min → Year 1: 10 min → Year 2: 7 min     │  │
│ │               → Year 3: 5 min                          │  │
│ │ Data Source: CAD System                                │  │
│ │ Responsible: Operations Manager                        │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Citizen Satisfaction Score                     [Edit]│  │
│ │ ───────────────────────────────────────────────────────  │
│ │ Frequency: Quarterly                                   │  │
│ │ Baseline: 72% → Year 1: 75% → Year 2: 80%             │  │
│ │               → Year 3: 85%                            │  │
│ │ Data Source: Annual Survey                             │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Staff Training Hours                           [Edit]│  │
│ │ ───────────────────────────────────────────────────────  │
│ │ Frequency: Annually                                    │  │
│ │ Baseline: 20 hrs → Year 1: 30 hrs → Year 2: 35 hrs    │  │
│ │                  → Year 3: 40 hrs                      │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Add/Edit KPI Dialog

```
┌──────────────────────────────────────────────────────────┐
│ Add Key Performance Indicator                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Metric Name *                                             │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ e.g., Response Time, Citizen Satisfaction           │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ Measurement Frequency *                                   │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ ○ Monthly  ○ Quarterly  ○ Semi-annually  ○ Annually│  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ Baseline Value *                                          │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ 15                                                   │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ Year 1 Target *      Year 2 Target *      Year 3 Target *│
│ ┌────────────┐      ┌────────────┐      ┌────────────┐  │
│ │ 10         │      │ 7          │      │ 5          │  │
│ └────────────┘      └────────────┘      └────────────┘  │
│                                                           │
│ Data Source                                               │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ e.g., CAD System, Annual Survey                     │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ Responsible Party                                         │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ e.g., Operations Manager, Data Analyst              │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│                                 [Cancel]  [Save KPI]     │
└──────────────────────────────────────────────────────────┘
```

---

## Validation Rules

### Required Fields
1. **Metric Name:** Required, max 200 characters
2. **Measurement Frequency:** Required, must be one of: monthly, quarterly, semi_annually, annually
3. **Baseline Value:** Required, numeric
4. **Year 1 Target:** Required, numeric
5. **Year 2 Target:** Required, numeric
6. **Year 3 Target:** Required, numeric

### Optional Fields
1. **Data Source:** Optional, max 200 characters
2. **Responsible Party:** Optional, max 200 characters

### Business Rules
- **No duplicate metric names** within the same initiative (case-insensitive check)
- **Targets should show progress** (warning if all targets = baseline, but allow)
- **Numeric precision:** Allow decimals (e.g., 72.5% satisfaction)

---

## Test Scenarios

### Scenario 1: Add KPI to Initiative
**Given** I'm editing an initiative
**When** I click "Add KPI"
**And** I fill in:
- Metric: "Response Time (minutes)"
- Frequency: Monthly
- Baseline: 15
- Year 1: 10, Year 2: 7, Year 3: 5
- Data Source: "CAD System"
**Then** KPI saves successfully
**And** Displays in initiative KPI list

### Scenario 2: Edit Existing KPI
**Given** Initiative has existing KPI
**When** I click Edit on the KPI
**And** I change Year 2 target from 7 to 8
**Then** KPI updates successfully
**And** Shows updated value in display

### Scenario 3: Delete KPI
**Given** Initiative has multiple KPIs
**When** I click delete on one KPI
**Then** System shows confirmation dialog
**When** I confirm deletion
**Then** KPI is removed from list
**And** Other KPIs remain intact

### Scenario 4: Validation - Missing Required Fields
**Given** I'm adding a new KPI
**When** I leave metric name blank
**And** I click Save
**Then** System shows validation error
**And** KPI is not saved

### Scenario 5: Display KPIs in Initiative Card
**Given** Initiative has 3 KPIs
**When** I expand the initiative card
**Then** All 3 KPIs display with baseline and targets
**And** Shows measurement frequency
**And** Shows data source and responsible party if provided

---

## Edge Cases

### Case 1: Very Long Metric Names
**Scenario:** User enters 500-character metric name
**Handling:** Truncate at 200 chars, show validation error

### Case 2: Negative Values
**Scenario:** User enters negative baseline or targets
**Handling:** Allow (some metrics decrease, e.g., incident count)

### Case 3: Large Numbers
**Scenario:** Baseline = 10,000,000
**Handling:** Display with comma formatting: "10,000,000"

### Case 4: Decimal Values
**Scenario:** Baseline = 72.5, Year 1 = 75.3
**Handling:** Allow up to 2 decimal places

### Case 5: No KPIs Defined
**Scenario:** Initiative has no KPIs
**Handling:** Show "No KPIs defined" message with "Add KPI" button

---

## Dependencies

**Requires:**
- Story 1.7 (Create Initiative) - COMPLETED
- initiative_kpis table in database
- Permission checking for initiative edits

**Blocks:**
- Story 1.11 (Department Dashboard) - needs KPI data for progress tracking

---

## Accessibility

- Form labels have `htmlFor` attributes
- Radio buttons have accessible labels
- Numeric inputs have `aria-label` with units
- Validation errors announced via `aria-live`
- Keyboard navigation for all interactive elements
- Focus management in dialogs

---

## Performance Considerations

- KPIs loaded with initiative (single query)
- Index on initiative_id for fast lookups
- Lazy load KPI form dialog (not on initial page load)
- Debounce validation on numeric inputs

---

## Future Enhancements (Out of Scope)

1. **Goal-Level KPIs:** Track progress across multiple initiatives
2. **Plan-Level KPIs:** Department-wide metrics
3. **KPI Tracking:** Actual values vs. targets over time
4. **KPI Dashboard:** Visual progress charts
5. **KPI Alerts:** Notifications when off-track
6. **KPI Templates:** Pre-defined KPIs by service area

---

## Definition of Done

- [x] Story documented with acceptance criteria
- [ ] initiative_kpis table verified in database
- [ ] InitiativeKpisForm component created
- [ ] Server actions for CRUD operations implemented
- [ ] KPI management integrated into initiative workflow
- [ ] KPI display added to InitiativeCard expanded view
- [ ] Validation rules implemented
- [ ] Build passes with no TypeScript errors
- [ ] Manual testing: Create, edit, delete KPIs
- [ ] Git commit with descriptive message
- [ ] Story marked as complete in backlog

---

## Notes

- Focus on **initiative-level KPIs** for MVP
- Goal-level and plan-level KPIs deferred to future story
- KPI actual value tracking (vs. targets) is Epic 5 (Performance Monitoring)
- Consider adding KPI suggestions/templates in future
- City Manager dashboard will aggregate KPIs across departments (Epic 2)

---

**Story Created:** January 10, 2025
**Last Updated:** January 10, 2025
