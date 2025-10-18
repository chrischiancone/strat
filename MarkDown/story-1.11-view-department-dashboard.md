# Story 1.11: View Department Dashboard

**Story ID:** STORY-1.11
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P0
**Story Points:** 13
**Status:** In Progress
**Created:** January 11, 2025

---

## User Story

**As a** Department Director
**I want to** see a dashboard summarizing my department's strategic plan
**So that** I can quickly understand status, budget, and progress

---

## Acceptance Criteria

### Dashboard Display
- [ ] Dashboard displays plan status and metadata
- [ ] Dashboard shows initiatives by priority (NEEDS: X, WANTS: Y, NICE TO HAVES: Z)
- [ ] Dashboard shows initiatives by status (not_started, in_progress, at_risk, completed, deferred)
- [ ] Dashboard shows total budget by fiscal year (bar chart)
- [ ] Dashboard shows budget by funding source (pie chart)
- [ ] Dashboard shows KPI progress summary (list of KPIs with % to target)

### Navigation & Access
- [ ] Dashboard is accessible from main navigation
- [ ] Dashboard loads quickly (<2 seconds with typical plan data)
- [ ] Dashboard works for users with multiple departments (shows dropdown to switch)

### Data Accuracy
- [ ] All counts and totals are accurate
- [ ] Charts reflect current plan data
- [ ] KPI progress calculations are correct
- [ ] Empty states display when no data exists

---

## Business Context

### Problem
Department Directors need a quick, visual way to understand the overall health of their strategic plan without digging through individual initiatives. Currently, they must manually review each section to get a complete picture.

### Solution
A comprehensive dashboard that aggregates data from across the strategic plan:
- High-level metrics (initiative counts, budget totals)
- Visual charts for budget distribution
- KPI progress tracking
- Quick access to initiatives by priority/status

### Value Proposition
- **For Department Directors:** At-a-glance view of plan health, budget allocation, and progress
- **For Strategic Planners:** Quick identification of areas needing attention (under-funded initiatives, off-track KPIs)
- **For City Manager:** Easy comparison across departments when reviewing plans
- **For Finance Director:** Budget distribution visibility for funding decisions

---

## Technical Implementation

### Dashboard Page

**Location:** `/app/plans/[id]/page.tsx` (already exists, will be enhanced)

**Route:** `/plans/{plan-id}`

### Data Aggregation

**New Server Actions: `app/actions/dashboard.ts`**

```typescript
export interface DashboardData {
  plan: {
    id: string
    title: string
    status: string
    fiscal_year_start: string
    fiscal_year_end: string
    department: {
      name: string
    }
  }

  initiativesByPriority: {
    NEED: number
    WANT: number
    NICE_TO_HAVE: number
  }

  initiativesByStatus: {
    not_started: number
    in_progress: number
    at_risk: number
    completed: number
    deferred: number
  }

  budgetByYear: {
    year_1: number
    year_2: number
    year_3: number
  }

  budgetByFundingSource: Array<{
    source_name: string
    total: number
  }>

  kpiProgress: Array<{
    metric_name: string
    baseline: string
    year_1_target: string
    year_2_target: string
    year_3_target: string
    initiative_name?: string
    goal_name?: string
  }>
}

export async function getDashboardData(planId: string): Promise<DashboardData>
```

### Dashboard Components

**New Components:**

1. **`components/dashboard/DashboardStats.tsx`**
   - Statistics cards showing key metrics
   - Initiatives by priority
   - Initiatives by status
   - Total budget across all years

2. **`components/dashboard/BudgetByYearChart.tsx`**
   - Bar chart showing budget distribution across 3 fiscal years
   - Uses recharts library

3. **`components/dashboard/BudgetBySourceChart.tsx`**
   - Pie chart showing budget by funding source
   - Uses recharts library

4. **`components/dashboard/KpiProgressList.tsx`**
   - Table/list of KPIs with progress indicators
   - Shows which initiatives/goals they're tied to
   - Visual progress bars or indicators

### Chart Library

We'll use **recharts** for visualization:
```bash
npm install recharts
```

Recharts is:
- React-friendly
- Responsive
- Customizable
- Well-documented

---

## UI/UX Design

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Department of Public Works Strategic Plan (FY2026-2028)        │
│ Status: Draft                                      [Edit Plan]  │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Key Metrics                                                        │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│ │  Strategic   │  │   Total      │  │   Total      │            │
│ │    Goals     │  │ Initiatives  │  │   Budget     │            │
│ │      4       │  │     12       │  │  $2.4M       │            │
│ └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Initiatives by Priority                 Initiatives by Status     │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  NEEDS:            5                    Not Started:     3        │
│  WANTS:            4                    In Progress:     6        │
│  NICE TO HAVES:    3                    At Risk:         1        │
│                                         Completed:       2        │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Budget by Fiscal Year                                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  [Bar Chart]                                                       │
│  FY2026: $800K                                                     │
│  FY2027: $900K                                                     │
│  FY2028: $700K                                                     │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Budget by Funding Source                                           │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  [Pie Chart]                                                       │
│  General Fund:     60% ($1.44M)                                   │
│  State Grant:      25% ($600K)                                    │
│  Federal Grant:    10% ($240K)                                    │
│  Revenue/Fees:      5% ($120K)                                    │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Key Performance Indicators Progress                                │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Response Time (Fire & Rescue)                [Initiative 1.1]   │
│  Baseline: 6 min → Target: 4 min                                  │
│  Progress: ████████░░ 80%                                         │
│                                                                    │
│  Citizen Satisfaction Score                   [Goal 2]            │
│  Baseline: 72% → Target: 85%                                      │
│  Progress: ██████░░░░ 60%                                         │
│                                                                    │
│  [View All KPIs →]                                                │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Recent Activity                                                    │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  • Initiative 1.3 status changed to "At Risk"  (2 hours ago)     │
│  • Budget updated for Initiative 2.1           (1 day ago)       │
│  • New KPI added to Goal 3                     (3 days ago)      │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

### Empty States

When no data exists:
- **No Initiatives:** "No initiatives defined yet. Click 'Edit Plan' to add goals and initiatives."
- **No Budget Data:** "Budget information not yet provided."
- **No KPIs:** "No KPIs defined. Add KPIs to track progress."

---

## Data Queries

### Initiative Counts by Priority

```typescript
const { data: initiativesByPriority } = await supabase
  .from('initiatives')
  .select('priority_level')
  .eq('strategic_goals.strategic_plan_id', planId)
  .group('priority_level')
```

### Initiative Counts by Status

```typescript
const { data: initiativesByStatus } = await supabase
  .from('initiatives')
  .select('status')
  .eq('strategic_goals.strategic_plan_id', planId)
  .group('status')
```

### Budget by Year

Sum totals from `initiatives` table:
```typescript
const { data: initiatives } = await supabase
  .from('initiatives')
  .select('total_year_1_cost, total_year_2_cost, total_year_3_cost')
  .eq('strategic_goals.strategic_plan_id', planId)
```

### Budget by Funding Source

Aggregate from `initiative_budgets` table:
```typescript
const { data: fundingSources } = await supabase
  .from('initiative_budgets')
  .select('source_name, amount')
  .eq('initiatives.strategic_goals.strategic_plan_id', planId)
```

### KPI Progress

Get all KPIs associated with the plan:
```typescript
const { data: kpis } = await supabase
  .from('initiative_kpis')
  .select(`
    *,
    initiatives(name),
    strategic_goals(title)
  `)
  .or(`
    initiative_id.in.(select id from initiatives where strategic_goal_id in (select id from strategic_goals where strategic_plan_id = '${planId}')),
    strategic_goal_id.in.(select id from strategic_goals where strategic_plan_id = '${planId}'),
    strategic_plan_id.eq.${planId}
  `)
```

---

## Validation Rules

### Data Accuracy
- All counts must accurately reflect database records
- Budget totals must match sum of individual initiative budgets
- Funding source totals must match sum of all funding source records

### Performance
- Dashboard data should load in <2 seconds for typical plan (5 goals, 15 initiatives)
- Queries should be optimized with proper indexes
- Consider caching dashboard data if queries are slow

---

## Test Scenarios

### Scenario 1: View Dashboard with Complete Data
**Given** I'm a Department Director with a complete strategic plan
**When** I navigate to the dashboard
**Then** I see:
- All key metrics populated
- Initiatives broken down by priority and status
- Budget charts showing distribution
- KPI progress indicators

### Scenario 2: View Dashboard with Partial Data
**Given** I have a plan with only goals defined (no initiatives yet)
**When** I navigate to the dashboard
**Then** I see:
- Goal count displayed
- Empty states for initiatives, budget, KPIs
- Helpful messages guiding me to add data

### Scenario 3: View Dashboard After Adding Initiative
**Given** I'm on the dashboard
**When** I edit the plan and add a new initiative
**And** I return to the dashboard
**Then** Initiative counts update to reflect the new initiative

### Scenario 4: Budget Chart Visualization
**Given** I have initiatives with budgets across 3 fiscal years
**When** I view the dashboard
**Then** Bar chart shows three bars (one per year)
**And** Bar heights correspond to budget amounts
**And** Values are formatted as currency

### Scenario 5: Funding Source Pie Chart
**Given** I have multiple funding sources (General Fund, Grants, etc.)
**When** I view the dashboard
**Then** Pie chart shows slices proportional to funding amounts
**And** Legend displays source names and amounts

### Scenario 6: KPI Progress Calculation
**Given** Initiative has KPI: Baseline = 10, Year 1 Target = 20
**And** Current actual value = 15 (if we have tracking data)
**When** I view dashboard
**Then** Progress shows 50% (15 is halfway from 10 to 20)

---

## Edge Cases

### Case 1: No Initiatives
**Scenario:** Plan has goals but no initiatives
**Handling:** Show empty state with message: "No initiatives defined yet"

### Case 2: No Budget Data
**Scenario:** Initiatives exist but no budgets defined
**Handling:** Show "$0" in budget totals, display message encouraging budget input

### Case 3: No Funding Sources
**Scenario:** Budget totals exist but no funding sources assigned
**Handling:** Show budget totals but hide funding source chart, display warning: "Funding sources not yet assigned"

### Case 4: Zero-Budget Initiatives
**Scenario:** Some initiatives have $0 budget (e.g., policy changes)
**Handling:** Include in initiative counts, exclude from budget calculations

### Case 5: Unbalanced Funding
**Scenario:** Sum of funding sources ≠ total budget
**Handling:** Display warning indicator: "⚠ Funding sources don't match total budget"

### Case 6: Large Numbers
**Scenario:** Budget totals in millions ($5,000,000)
**Handling:** Format as "$5.0M" in charts for readability

---

## Dependencies

**Requires:**
- Story 1.6 (Define Strategic Goals) - COMPLETED
- Story 1.7 (Create Initiative) - COMPLETED
- Story 1.8 (Initiative Financial Analysis) - COMPLETED
- Story 1.10 (Define Initiative KPIs) - COMPLETED
- recharts library for chart visualizations

**Blocks:**
- None (this is a read-only dashboard, doesn't block other features)

---

## Accessibility

- All charts have accessible labels and descriptions
- Statistics cards have proper heading structure
- Color is not the only means of conveying information (use labels + color)
- Charts provide data table alternative for screen readers
- Keyboard navigation works for all interactive elements

---

## Performance Considerations

- Dashboard data loaded via single server action (minimize round trips)
- Queries use proper indexes on strategic_plan_id, strategic_goal_id, initiative_id
- Consider materialized views if aggregation queries are slow
- Client-side caching with React Query or SWR for 30-second refresh
- Lazy load charts (render after initial stats cards load)

---

## Chart Configuration

### Budget by Year Bar Chart
- **X-axis:** Fiscal years (FY2026, FY2027, FY2028)
- **Y-axis:** Dollar amounts
- **Bar color:** Blue (#3b82f6)
- **Format:** Currency with abbreviations ($1.2M)

### Budget by Funding Source Pie Chart
- **Colors:** Distinct palette (General Fund: blue, Grants: green, Bonds: orange, Fees: purple)
- **Labels:** Show percentage and dollar amount
- **Legend:** Display below chart with color indicators

---

## Future Enhancements (Out of Scope)

1. **Real-Time KPI Tracking:** Show actual values vs. targets (requires Epic 5)
2. **Trend Charts:** Show budget changes over time across multiple plan cycles
3. **Comparison View:** Compare current plan to previous year's plan
4. **Export Dashboard:** PDF export for presentations
5. **Custom Widgets:** Let users choose which dashboard sections to display
6. **Drill-Down:** Click on chart segments to see detailed initiative lists

---

## Definition of Done

- [ ] Story documented with acceptance criteria
- [ ] Dashboard server actions created (getDashboardData)
- [ ] Dashboard statistics cards component created
- [ ] Budget by year bar chart component created
- [ ] Budget by funding source pie chart created
- [ ] KPI progress list component created
- [ ] Dashboard page updated to show all sections
- [ ] Navigation to dashboard added from main menu
- [ ] Empty states implemented for missing data
- [ ] Build passes with no TypeScript errors
- [ ] Manual testing: View dashboard with various data states
- [ ] Git commit with descriptive message
- [ ] Story marked as complete in backlog

---

## Notes

- This is the **final story in Epic 1** - completing this delivers a fully functional plan creation workflow
- Dashboard is critical for user satisfaction and plan overview
- Consider performance optimization if queries are slow with large datasets
- Charts should be responsive and work well on tablets/mobile
- Empty states are just as important as data-filled states (guide users on next steps)

---

**Story Created:** January 11, 2025
**Last Updated:** January 11, 2025
