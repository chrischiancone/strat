# Story 1.5: Add Benchmarking Data

**Story ID:** STORY-1.5
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P1
**Story Points:** 5
**Status:** In Progress
**Assigned To:** Dev Team
**Created:** January 11, 2025

---

## User Story

**As a** Department Director
**I want to** document how we compare to peer municipalities
**So that** I can justify our investment requests with comparative data

---

## Acceptance Criteria

1. ✅ User can list peer municipalities compared (text list)
2. ✅ User can add benchmarking metrics in table format (Metric, Carrollton Current, Peer Average, Gap Analysis)
3. ✅ User can add/edit/delete metrics
4. ✅ User can add key findings (text entries)
5. ✅ System saves benchmarking data as JSONB in strategic_plans table
6. ✅ Benchmarking displays in formatted table on plan dashboard
7. ✅ System validates all inputs (required fields, data formats)
8. ✅ Changes auto-save when user exits edit dialog

---

## Business Context

### Problem
Department Directors need to justify budget requests and strategic initiatives with comparative data from peer municipalities. Without this benchmarking data, it's difficult to demonstrate performance gaps, justify investments, or show competitive positioning.

### Value
- **Data-Driven Justification**: Provides objective comparisons to support budget requests
- **Performance Insights**: Identifies areas where the department lags or excels vs. peers
- **Strategic Context**: Helps City Manager understand department performance relative to similar cities
- **Transparency**: Shows due diligence in researching best practices and competitive positioning

### Success Metrics
- 80% of strategic plans include benchmarking data
- Average 3-5 peer municipalities compared per plan
- Average 5-8 benchmarking metrics per plan
- City Manager satisfaction with data quality for decision-making

---

## Benchmarking Components

### 1. Peer Municipalities List
List of comparable cities/counties used for benchmarking analysis

**Examples:**
- "Plano, TX"
- "Frisco, TX"
- "Allen, TX"
- "McKinney, TX"
- "Richardson, TX"

**Validation:**
- Minimum 2 characters
- Maximum 100 characters per municipality
- No duplicates (case-insensitive)

### 2. Benchmarking Metrics Table
Structured comparison of key performance indicators

**Columns:**
1. **Metric Name**: The KPI or measure being compared
2. **Carrollton Current**: Current value for City of Carrollton
3. **Peer Average**: Average value across peer municipalities
4. **Gap Analysis**: Interpretation of the difference (ahead/behind/on par)

**Examples:**

| Metric | Carrollton Current | Peer Average | Gap Analysis |
|--------|-------------------|--------------|--------------|
| Police officers per 1,000 residents | 1.8 | 2.1 | 15% below peer average; need 18 additional officers |
| Park acres per 1,000 residents | 12.5 | 10.2 | 23% above peer average; maintaining excellent service |
| Average EMS response time (minutes) | 6.2 | 5.8 | 7% slower; opportunity for improvement |
| IT staff per 100 city employees | 3.2 | 4.5 | 29% below peer average; limiting digital transformation |

**Validation:**
- All fields required for each metric
- Metric name: 5-200 characters
- Carrollton Current: 1-100 characters (supports numbers, text, units)
- Peer Average: 1-100 characters
- Gap Analysis: 10-500 characters

### 3. Key Findings
High-level summary statements about benchmarking results

**Examples:**
- "Overall department performance is competitive but staffing levels are below peer average"
- "Technology infrastructure investment lags behind peer cities by 25-30%"
- "Service quality metrics (response times, customer satisfaction) exceed peer benchmarks"
- "Budgets are 10-15% lower than peer average despite serving similar population"

**Validation:**
- Minimum 20 characters
- Maximum 1000 characters per finding
- No duplicates (case-insensitive)

---

## Technical Implementation

### Database Schema
Benchmarking data is stored as JSONB in the `strategic_plans` table:

```sql
-- strategic_plans.benchmarking_data column (JSONB)
{
  "peer_municipalities": [
    "Plano, TX",
    "Frisco, TX",
    "Allen, TX"
  ],
  "metrics": [
    {
      "metric_name": "Police officers per 1,000 residents",
      "carrollton_current": "1.8",
      "peer_average": "2.1",
      "gap_analysis": "15% below peer average; need 18 additional officers"
    },
    {
      "metric_name": "Park acres per 1,000 residents",
      "carrollton_current": "12.5",
      "peer_average": "10.2",
      "gap_analysis": "23% above peer average; maintaining excellent service"
    }
  ],
  "key_findings": [
    "Overall department performance is competitive but staffing levels are below peer average",
    "Technology infrastructure investment lags behind peer cities by 25-30%"
  ]
}
```

### Type Definitions

```typescript
// app/actions/strategic-plans.ts
export interface BenchmarkingData {
  peer_municipalities: string[]
  metrics: BenchmarkingMetric[]
  key_findings: string[]
}

export interface BenchmarkingMetric {
  metric_name: string
  carrollton_current: string
  peer_average: string
  gap_analysis: string
}
```

### Component Structure

1. **BenchmarkingDataForm.tsx** (Client Component)
   - Three sections: Peer Municipalities, Metrics Table, Key Findings
   - Add/Edit/Delete functionality for all sections
   - Dialog-based editing for individual items
   - Table-based display for metrics
   - Validation and duplicate detection
   - Toast notifications

2. **BenchmarkingDataSection.tsx** (Client Component)
   - Wrapper component for edit page
   - Passes planId and initial data to form
   - Handles save action

3. **BenchmarkingDataDisplay.tsx** (Server Component)
   - Read-only formatted display for dashboard
   - Table layout for metrics
   - List layout for peer municipalities and key findings
   - Conditional rendering (only shows if data exists)

### Server Actions

```typescript
// app/actions/strategic-plans.ts

export async function updateBenchmarkingData(
  planId: string,
  data: BenchmarkingData
): Promise<void> {
  // 1. Authenticate user
  // 2. Check edit permissions (creator, same department, or admin)
  // 3. Update benchmarking_data JSONB column
  // 4. Revalidate relevant paths
}
```

---

## UI/UX Design

### Edit View Layout

```
┌─────────────────────────────────────────────────────┐
│ Benchmarking Data                                   │
│ Compare your department to peer municipalities      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Peer Municipalities                      [+ Add]    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ • Plano, TX                 [Edit] [Delete]     │ │
│ │ • Frisco, TX                [Edit] [Delete]     │ │
│ │ • Allen, TX                 [Edit] [Delete]     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Benchmarking Metrics                     [+ Add]    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Metric          │ Current │ Peer Avg│ Gap       │ │
│ │ Police officers │ 1.8     │ 2.1     │ 15% below │ │
│ │ per 1,000       │         │         │ [Actions] │ │
│ │──────────────────────────────────────────────────│ │
│ │ Park acres per  │ 12.5    │ 10.2    │ 23% above │ │
│ │ 1,000 residents │         │         │ [Actions] │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Key Findings                             [+ Add]    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 1. Overall performance competitive but staffing │ │
│ │    below peer average   [Edit] [Delete]        │ │
│ │ 2. Technology investment lags 25-30%           │ │
│ │                         [Edit] [Delete]        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Add/Edit Dialogs

**Add Peer Municipality:**
```
┌──────────────────────────────────────────┐
│ Add Peer Municipality                    │
├──────────────────────────────────────────┤
│                                          │
│ Municipality Name                        │
│ ┌──────────────────────────────────────┐ │
│ │ Plano, TX                            │ │
│ └──────────────────────────────────────┘ │
│                                          │
│              [Cancel]  [Save]            │
└──────────────────────────────────────────┘
```

**Add/Edit Benchmarking Metric:**
```
┌──────────────────────────────────────────┐
│ Add Benchmarking Metric                  │
├──────────────────────────────────────────┤
│                                          │
│ Metric Name *                            │
│ ┌──────────────────────────────────────┐ │
│ │ Police officers per 1,000 residents  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Carrollton Current Value *               │
│ ┌──────────────────────────────────────┐ │
│ │ 1.8                                  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Peer Average *                           │
│ ┌──────────────────────────────────────┐ │
│ │ 2.1                                  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Gap Analysis *                           │
│ ┌──────────────────────────────────────┐ │
│ │ 15% below peer average; need 18      │ │
│ │ additional officers to reach parity  │ │
│ │                                      │ │
│ └──────────────────────────────────────┘ │
│                                          │
│              [Cancel]  [Save]            │
└──────────────────────────────────────────┘
```

**Add Key Finding:**
```
┌──────────────────────────────────────────┐
│ Add Key Finding                          │
├──────────────────────────────────────────┤
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Overall department performance is    │ │
│ │ competitive but staffing levels are  │ │
│ │ below peer average                   │ │
│ │                                      │ │
│ └──────────────────────────────────────┘ │
│ 20 / 1000 characters                     │
│                                          │
│              [Cancel]  [Save]            │
└──────────────────────────────────────────┘
```

### Dashboard Display View

```
┌─────────────────────────────────────────────────────┐
│ Benchmarking Data                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Peer Municipalities Compared                        │
│ • Plano, TX                                         │
│ • Frisco, TX                                        │
│ • Allen, TX                                         │
│                                                     │
│ Performance Comparison                              │
│ ┌───────────────┬─────────┬──────────┬────────────┐│
│ │ Metric        │ Current │ Peer Avg │ Gap        ││
│ ├───────────────┼─────────┼──────────┼────────────┤│
│ │ Police        │ 1.8     │ 2.1      │ 15% below  ││
│ │ officers per  │         │          │ peer; need ││
│ │ 1,000         │         │          │ 18 more    ││
│ ├───────────────┼─────────┼──────────┼────────────┤│
│ │ Park acres    │ 12.5    │ 10.2     │ 23% above  ││
│ │ per 1,000     │         │          │ peer avg   ││
│ └───────────────┴─────────┴──────────┴────────────┘│
│                                                     │
│ Key Findings                                        │
│ • Overall performance competitive but staffing      │
│   below peer average                                │
│ • Technology infrastructure investment lags behind  │
│   peer cities by 25-30%                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Validation Rules

### Peer Municipality Validation

| Rule | Min | Max | Required |
|------|-----|-----|----------|
| Municipality name | 2 chars | 100 chars | Yes |
| Duplicate check | - | - | No duplicates |

### Benchmarking Metric Validation

| Field | Min | Max | Required |
|-------|-----|-----|----------|
| Metric name | 5 chars | 200 chars | Yes |
| Carrollton current | 1 char | 100 chars | Yes |
| Peer average | 1 char | 100 chars | Yes |
| Gap analysis | 10 chars | 500 chars | Yes |

### Key Finding Validation

| Field | Min | Max | Required |
|-------|-----|-----|----------|
| Finding text | 20 chars | 1000 chars | Yes |
| Duplicate check | - | - | No duplicates |

### Business Rules

1. **Minimum Data Requirements**: Users should add at least 2 peer municipalities and 2 metrics for meaningful comparison
2. **No Duplicate Peers**: Cannot add same municipality twice (case-insensitive comparison)
3. **No Duplicate Metrics**: Cannot add metric with same name twice
4. **No Duplicate Findings**: Cannot add duplicate key findings
5. **Trimmed Text**: Leading/trailing whitespace automatically removed

---

## User Workflow

### Adding Peer Municipality

1. User clicks "+ Add" in Peer Municipalities section
2. Dialog opens with single text input
3. User types municipality name (e.g., "Plano, TX")
4. System validates: length (2-100 chars), no duplicates
5. User clicks "Save"
6. Municipality appears in list with Edit/Delete actions
7. Toast confirms "Municipality added"

### Adding Benchmarking Metric

1. User clicks "+ Add" in Benchmarking Metrics section
2. Dialog opens with 4 input fields
3. User fills all required fields:
   - Metric name (e.g., "Police officers per 1,000 residents")
   - Carrollton current (e.g., "1.8")
   - Peer average (e.g., "2.1")
   - Gap analysis (e.g., "15% below peer average...")
4. System validates: all required, correct lengths
5. User clicks "Save"
6. Metric appears in table with Edit/Delete actions
7. Toast confirms "Metric added"

### Adding Key Finding

1. User clicks "+ Add" in Key Findings section
2. Dialog opens with textarea
3. User types finding (min 20, max 1000 chars)
4. System validates: length, no duplicates
5. User clicks "Save"
6. Finding appears in numbered list with Edit/Delete actions
7. Toast confirms "Finding added"

---

## Test Scenarios

### Happy Path Testing

#### Test 1: Add Peer Municipality
**Given** user is on benchmarking section
**When** user adds "Plano, TX" as peer
**Then** municipality appears in list
**And** data saves to database

#### Test 2: Add Benchmarking Metric
**Given** user is on benchmarking section
**When** user adds complete metric with all 4 fields
**Then** metric appears in table
**And** all columns display correctly

#### Test 3: Add Key Finding
**Given** user is on benchmarking section
**When** user adds finding with 50 characters
**Then** finding appears in numbered list
**And** data saves correctly

#### Test 4: Edit Existing Metric
**Given** metric exists in table
**When** user edits gap analysis field
**Then** metric updates inline
**And** database reflects changes

#### Test 5: Delete Peer Municipality
**Given** peer municipality exists
**When** user clicks Delete and confirms
**Then** municipality removed from list
**And** database updated

#### Test 6: View on Dashboard
**Given** benchmarking data exists
**When** user views plan dashboard
**Then** benchmarking displays in formatted table and lists
**And** all data renders correctly

### Edge Cases

#### Edge 1: Duplicate Peer Municipality
**Given** "Plano, TX" already exists
**When** user tries to add "PLANO, TX"
**Then** system shows error "This municipality already exists"
**And** Save button disabled

#### Edge 2: Incomplete Metric
**Given** user is adding metric
**When** user leaves "Peer Average" empty
**Then** system shows error "All fields required"
**And** Save button disabled

#### Edge 3: Key Finding Too Short
**Given** user is adding finding
**When** user types only 15 characters
**Then** system shows error "Minimum 20 characters required"
**And** Save button disabled

#### Edge 4: Empty Benchmarking Data
**Given** no benchmarking data documented
**When** user views dashboard
**Then** benchmarking section does not display

#### Edge 5: Many Metrics in Table
**Given** 15 metrics added to benchmarking
**When** user views table
**Then** table scrolls or paginates appropriately
**And** all metrics accessible

#### Edge 6: Very Long Gap Analysis
**Given** user enters 500-character gap analysis
**When** viewing in table
**Then** text truncates with "..." or expands on click
**And** full text visible on hover/click

#### Edge 7: Permission Denied
**Given** user is not creator and not in same department
**When** user tries to update benchmarking data
**Then** server action throws "You do not have permission to edit this plan"

### Negative Testing

#### Negative 1: Invalid Characters
**Given** user enters special characters in peer municipality
**When** user saves
**Then** characters are accepted (no special validation needed)

#### Negative 2: Database Connection Failure
**Given** database is unavailable
**When** user tries to save
**Then** error message displays: "Failed to save. Please try again."

#### Negative 3: JSONB Parse Error
**Given** corrupted JSONB in database
**When** component tries to render
**Then** gracefully handles with empty state

---

## Accessibility

- **Keyboard Navigation**: All Add/Edit/Delete buttons accessible via Tab
- **Screen Readers**:
  - Form labeled "Benchmarking Data Form"
  - Table has proper headers and row labels
  - Action buttons have aria-labels
- **Focus Management**: Focus returns to appropriate element after dialog closes
- **Color Contrast**: All text meets WCAG 2.1 Level AA (4.5:1 minimum)
- **Error Announcements**: Validation errors announced to screen readers
- **Table Accessibility**: Proper `<thead>`, `<tbody>`, `<th>` tags for metrics table

---

## Dependencies

**Requires:**
- Story 1.2 (Plan metadata and edit page structure) ✅ Complete
- Supabase PostgreSQL with strategic_plans table ✅ Available
- benchmarking_data column (JSONB) in strategic_plans table (add in migration if needed)
- shadcn/ui components: Card, Dialog, Button, Input, Textarea, Table, AlertDialog ✅ Available
- useToast hook ✅ Available

**Enables:**
- Data-driven strategic planning with peer comparisons
- Objective justification for budget requests
- Performance gap identification

---

## Definition of Done

- [ ] BenchmarkingDataForm component created with full CRUD for all 3 sections
- [ ] BenchmarkingDataSection wrapper component created
- [ ] BenchmarkingDataDisplay read-only component created
- [ ] Server action updateBenchmarkingData implemented with permission checks
- [ ] BenchmarkingData interface added to strategic-plans.ts
- [ ] Benchmarking integrated into plan edit page
- [ ] Benchmarking display added to plan dashboard
- [ ] getStrategicPlanForEdit and getDashboardData updated to fetch benchmarking_data
- [ ] All validation rules implemented
- [ ] Build passes with no TypeScript errors
- [ ] Manual testing of all workflows completed
- [ ] Story committed to git
- [ ] Story documentation created

---

## Notes

**Design Decisions:**
- Three sections (peers, metrics, findings) provide comprehensive benchmarking picture
- Table format for metrics makes comparisons easy to scan
- Gap analysis field allows narrative interpretation beyond raw numbers
- JSONB storage provides flexibility for future schema changes
- Similar UX pattern to SWOT/Environmental Scan for consistency

**Future Enhancements (Post-MVP):**
- Import benchmarking data from national databases (ICMA, Bloomberg, etc.)
- Auto-calculate gap percentages based on numeric values
- Link benchmarking metrics to specific initiatives that address gaps
- Trend analysis across multiple planning cycles
- Export benchmarking data to Excel/PDF for presentations

---

**Story Created:** January 11, 2025
**Story Implemented:** January 11, 2025
**Last Updated:** January 11, 2025
