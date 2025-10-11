# Story 1.4: Complete Environmental Scan

**Story ID:** STORY-1.4
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P1
**Story Points:** 5
**Status:** In Progress
**Assigned To:** Dev Team
**Created:** January 11, 2025

---

## User Story

**As a** Strategic Planner
**I want to** document environmental factors affecting my department
**So that** I can show we've considered external trends and pressures

---

## Acceptance Criteria

1. ✅ User can access Environmental Scan section from plan edit view
2. ✅ User can document five categories of environmental factors:
   - Demographic trends
   - Economic factors
   - Regulatory/legislative changes
   - Technology trends
   - Community expectations
3. ✅ Each subsection supports multiple text entries
4. ✅ User can add, edit, delete, and reorder items within each category
5. ✅ System saves environmental scan data as JSONB in strategic_plans table
6. ✅ Environmental scan displays in read-only formatted view on plan dashboard
7. ✅ System validates text entries (minimum and maximum character limits)
8. ✅ System prevents duplicate entries within the same category
9. ✅ Changes auto-save when user exits edit dialog

---

## Business Context

### Problem
Strategic planners need to document external factors that influence department operations and strategic priorities. This environmental scan provides context for strategic decisions and helps justify resource requests.

### Value
- **Comprehensive Analysis**: Ensures departments consider all relevant external factors
- **Justification**: Provides evidence for strategic initiatives tied to environmental trends
- **Historical Record**: Documents environmental context at time of planning
- **Stakeholder Communication**: Helps City Manager and Council understand external pressures

### Success Metrics
- 100% of strategic plans include at least 3 environmental factors
- Average 10-15 environmental factors documented per plan
- Users can complete environmental scan in <30 minutes
- Zero data loss during editing

---

## Environmental Scan Categories

### 1. Demographic Trends
Population changes, age distribution shifts, diversity trends, migration patterns, household composition changes

**Examples:**
- "Population growth of 12% over 5 years, straining infrastructure"
- "Aging population (65+) increased from 15% to 22% since 2020"
- "Hispanic/Latino population grew 18%, increasing demand for bilingual services"

### 2. Economic Factors
Economic conditions, employment trends, business development, tax base changes, property values, cost of living

**Examples:**
- "Median household income increased 8% above regional average"
- "Commercial development along I-35 corridor adding 2,000 jobs"
- "Property tax revenue growth slowing due to state appraisal caps"
- "Rising construction costs (+15%) impacting capital project budgets"

### 3. Regulatory/Legislative Changes
New laws, compliance requirements, unfunded mandates, grant opportunities, policy changes at state/federal level

**Examples:**
- "SB 2 property tax rate caps limiting revenue growth"
- "New EPA stormwater regulations requiring additional monitoring"
- "Federal infrastructure grants available for EV charging stations"
- "State requirement for body cameras on all patrol officers"

### 4. Technology Trends
Emerging technologies, digital transformation, cybersecurity threats, automation opportunities, IT infrastructure needs

**Examples:**
- "Cloud migration reducing on-premise data center costs"
- "Cybersecurity threats increasing, requiring SOC investment"
- "AI-powered chatbots reducing call center volume 20%"
- "GIS integration improving field service efficiency"
- "Mobile apps increasing citizen self-service adoption"

### 5. Community Expectations
Citizen priorities, service level expectations, communication preferences, transparency demands, equity concerns

**Examples:**
- "Community survey shows 78% want improved park access"
- "Residents expect 24/7 digital service access"
- "Increased demand for transparency in budget decisions"
- "Equity concerns about service distribution across neighborhoods"
- "Climate action expectations from youth and environmental groups"

---

## Technical Implementation

### Database Schema
Environmental scan is stored as JSONB in the `strategic_plans` table:

```sql
-- strategic_plans.environmental_scan column (JSONB)
{
  "demographic_trends": [
    "Population growth of 12% over 5 years, straining infrastructure",
    "Aging population (65+) increased from 15% to 22% since 2020"
  ],
  "economic_factors": [
    "Median household income increased 8% above regional average",
    "Commercial development along I-35 corridor adding 2,000 jobs"
  ],
  "regulatory_changes": [
    "SB 2 property tax rate caps limiting revenue growth",
    "New EPA stormwater regulations requiring additional monitoring"
  ],
  "technology_trends": [
    "Cloud migration reducing on-premise data center costs",
    "Cybersecurity threats increasing, requiring SOC investment"
  ],
  "community_expectations": [
    "Community survey shows 78% want improved park access",
    "Residents expect 24/7 digital service access"
  ]
}
```

### Type Definitions

```typescript
// app/actions/strategic-plans.ts
export interface EnvironmentalScan {
  demographic_trends: string[]
  economic_factors: string[]
  regulatory_changes: string[]
  technology_trends: string[]
  community_expectations: string[]
}
```

### Component Structure

1. **EnvironmentalScanForm.tsx** (Client Component)
   - Dynamic form with 5 collapsible sections
   - Add/Edit/Delete/Reorder functionality for each category
   - Dialog-based editing for individual items
   - Validation and duplicate detection
   - Toast notifications

2. **EnvironmentalScanSection.tsx** (Client Component)
   - Wrapper component for edit page
   - Passes planId and initial data to form
   - Handles save action

3. **EnvironmentalScanDisplay.tsx** (Server Component)
   - Read-only formatted display for dashboard
   - Conditional rendering (only shows categories with content)
   - Color-coded sections for visual distinction

### Server Actions

```typescript
// app/actions/strategic-plans.ts

export async function updateEnvironmentalScan(
  planId: string,
  scan: EnvironmentalScan
): Promise<void> {
  // 1. Authenticate user
  // 2. Check edit permissions (creator, same department, or admin)
  // 3. Update environmental_scan JSONB column
  // 4. Revalidate relevant paths
}
```

---

## UI/UX Design

### Edit View Layout

```
┌─────────────────────────────────────────────────────┐
│ Environmental Scan                                  │
│ Document external factors affecting your department │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ▼ Demographic Trends                   [+ Add]     │
│   ┌───────────────────────────────────────────┐   │
│   │ 1. Population growth of 12% over 5 years  │   │
│   │    [↑] [↓] [Edit] [Delete]                │   │
│   │ 2. Aging population increased to 22%      │   │
│   │    [↑] [↓] [Edit] [Delete]                │   │
│   └───────────────────────────────────────────┘   │
│                                                     │
│ ▼ Economic Factors                      [+ Add]     │
│   ┌───────────────────────────────────────────┐   │
│   │ 1. Median household income +8%            │   │
│   │    [↑] [↓] [Edit] [Delete]                │   │
│   └───────────────────────────────────────────┘   │
│                                                     │
│ ▼ Regulatory/Legislative Changes        [+ Add]     │
│ ▼ Technology Trends                     [+ Add]     │
│ ▼ Community Expectations                [+ Add]     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Add/Edit Dialog

```
┌──────────────────────────────────────────┐
│ Add Demographic Trend                    │
├──────────────────────────────────────────┤
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Describe the demographic trend...    │ │
│ │                                      │ │
│ │                                      │ │
│ │                                      │ │
│ └──────────────────────────────────────┘ │
│ 15 / 1000 characters                     │
│                                          │
│ ℹ️  Be specific and include data where   │
│    possible (e.g., percentages, years)  │
│                                          │
│              [Cancel]  [Save]            │
└──────────────────────────────────────────┘
```

### Dashboard Display View

```
┌─────────────────────────────────────────────────────┐
│ Environmental Scan                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Demographic Trends                                  │
│ • Population growth of 12% over 5 years, straining │
│   infrastructure                                    │
│ • Aging population (65+) increased from 15% to 22%  │
│   since 2020                                        │
│                                                     │
│ Economic Factors                                    │
│ • Median household income increased 8% above        │
│   regional average                                  │
│ • Commercial development adding 2,000 jobs          │
│                                                     │
│ Regulatory/Legislative Changes                      │
│ • SB 2 property tax rate caps limiting revenue      │
│                                                     │
│ Technology Trends                                   │
│ • Cloud migration reducing data center costs        │
│ • Cybersecurity threats requiring SOC investment    │
│                                                     │
│ Community Expectations                              │
│ • 78% want improved park access (survey)            │
│ • Residents expect 24/7 digital service access      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Validation Rules

### Text Entry Validation

| Field | Min Length | Max Length | Required |
|-------|-----------|-----------|----------|
| Any environmental factor | 15 characters | 1000 characters | No |

### Business Rules

1. **Minimum Character Count**: Each entry must be at least 15 characters to ensure meaningful content
2. **Maximum Character Count**: Limit to 1000 characters to keep entries concise
3. **No Duplicates**: Cannot add duplicate entries within the same category (case-insensitive comparison)
4. **Trimmed Text**: Leading/trailing whitespace is automatically removed
5. **No Empty Categories Required**: All categories are optional, but at least one entry recommended

### UI Validation Feedback

```typescript
// Validation states
- Too short: "Entry must be at least 15 characters"
- Too long: "Entry cannot exceed 1000 characters"
- Duplicate: "This entry already exists in this category"
- Empty: "Please enter a description"
```

---

## Category Color Coding

To visually distinguish categories:

| Category | Background | Border | Text |
|----------|-----------|--------|------|
| Demographic Trends | bg-purple-50 | border-purple-200 | text-purple-900 |
| Economic Factors | bg-green-50 | border-green-200 | text-green-900 |
| Regulatory/Legislative Changes | bg-orange-50 | border-orange-200 | text-orange-900 |
| Technology Trends | bg-blue-50 | border-blue-200 | text-blue-900 |
| Community Expectations | bg-pink-50 | border-pink-200 | text-pink-900 |

---

## User Workflow

### Adding Environmental Factors

1. User navigates to plan edit page
2. User scrolls to "Environmental Scan" section
3. User expands a category (e.g., "Demographic Trends")
4. User clicks "+ Add" button
5. Dialog opens with textarea
6. User types description (min 15, max 1000 characters)
7. System validates input:
   - Shows character count
   - Shows error if too short/long
   - Checks for duplicates
8. User clicks "Save"
9. Entry appears in category list with action buttons
10. Toast confirms "Added successfully"

### Editing an Entry

1. User clicks "Edit" button on an entry
2. Dialog opens pre-filled with current text
3. User modifies text
4. System validates
5. User clicks "Save"
6. Entry updates inline
7. Toast confirms "Updated successfully"

### Deleting an Entry

1. User clicks "Delete" button
2. Confirmation dialog appears: "Are you sure you want to delete this entry?"
3. User confirms
4. Entry removed from list
5. Toast confirms "Deleted successfully"

### Reordering Entries

1. User clicks "↑" (move up) or "↓" (move down) button
2. Entry swaps position with adjacent entry
3. Order persists immediately (no toast needed)

---

## Test Scenarios

### Happy Path Testing

#### Test 1: Add Environmental Factor
**Given** user is on plan edit page
**When** user adds "Population growth of 12%" to Demographic Trends
**Then** entry appears in list with action buttons
**And** data saves to database as JSONB

#### Test 2: Edit Environmental Factor
**Given** entry exists in Economic Factors
**When** user edits entry and saves
**Then** entry updates inline
**And** database reflects changes

#### Test 3: Delete Environmental Factor
**Given** entry exists in Regulatory Changes
**When** user clicks Delete and confirms
**Then** entry removed from list
**And** database updated

#### Test 4: Reorder Entries
**Given** 3 entries exist in Technology Trends
**When** user moves entry 2 up
**Then** entry 2 becomes entry 1
**And** order persists in database

#### Test 5: View on Dashboard
**Given** environmental scan has data
**When** user views plan dashboard
**Then** environmental scan displays in formatted view
**And** only categories with content are shown

### Edge Cases

#### Edge 1: Entry Too Short
**Given** user is adding an entry
**When** user types only 10 characters
**Then** system shows error "Entry must be at least 15 characters"
**And** Save button is disabled

#### Edge 2: Entry Too Long
**Given** user is adding an entry
**When** user types 1001 characters
**Then** textarea stops accepting input at 1000
**And** character counter shows "1000 / 1000"

#### Edge 3: Duplicate Entry (Case-Insensitive)
**Given** entry "Population growth" exists
**When** user tries to add "POPULATION GROWTH"
**Then** system shows error "This entry already exists"
**And** Save button is disabled

#### Edge 4: Empty Environmental Scan
**Given** no environmental factors documented
**When** user views dashboard
**Then** environmental scan section does not display

#### Edge 5: Only One Category with Data
**Given** only Demographic Trends has entries
**When** user views dashboard
**Then** only Demographic Trends section displays
**And** other categories are hidden

#### Edge 6: Reorder First Item Up
**Given** user is viewing first entry
**When** user clicks "↑" button
**Then** button is disabled (no action)

#### Edge 7: Reorder Last Item Down
**Given** user is viewing last entry
**When** user clicks "↓" button
**Then** button is disabled (no action)

#### Edge 8: Permission Denied
**Given** user is not creator and not in same department
**When** user tries to update environmental scan
**Then** server action throws "You do not have permission to edit this plan"

### Negative Testing

#### Negative 1: Concurrent Edits
**Given** two users editing same plan
**When** both add entries simultaneously
**Then** both entries save (last write wins for array)
**Note:** Full conflict resolution is out of scope for MVP

#### Negative 2: Database Connection Failure
**Given** database is unavailable
**When** user tries to save
**Then** error message displays: "Failed to update environmental scan. Please try again."

#### Negative 3: JSONB Parse Error
**Given** corrupted JSONB in database
**When** component tries to render
**Then** gracefully handles with empty state

---

## Accessibility

- **Keyboard Navigation**: All buttons accessible via Tab
- **Screen Readers**:
  - Form labeled "Environmental Scan Form"
  - Each category has heading (h3)
  - Action buttons have aria-labels
- **Focus Management**: Focus returns to trigger button after dialog closes
- **Color Contrast**: All text meets WCAG 2.1 Level AA (4.5:1 minimum)
- **Error Announcements**: Validation errors announced to screen readers

---

## Dependencies

**Requires:**
- Story 1.2 (Plan metadata and edit page structure) ✅ Complete
- Supabase PostgreSQL with strategic_plans table ✅ Available
- environmental_scan column (JSONB) in strategic_plans table (add in migration if needed)
- shadcn/ui components: Card, Dialog, Button, Textarea, AlertDialog ✅ Available
- Sonner toast library ✅ Available

**Enables:**
- Comprehensive strategic planning analysis
- Better justification for strategic initiatives
- Historical record of environmental context

---

## Definition of Done

- [ ] EnvironmentalScanForm component created with full CRUD
- [ ] EnvironmentalScanSection wrapper component created
- [ ] EnvironmentalScanDisplay read-only component created
- [ ] Server action updateEnvironmentalScan implemented with permission checks
- [ ] EnvironmentalScan interface added to strategic-plans.ts
- [ ] Environmental scan integrated into plan edit page
- [ ] Environmental scan display added to plan dashboard
- [ ] getStrategicPlanForEdit and getDashboardData updated to fetch environmental_scan
- [ ] All validation rules implemented (character limits, duplicates)
- [ ] All 5 categories implemented with correct color coding
- [ ] Reorder functionality working correctly
- [ ] Build passes with no TypeScript errors
- [ ] Manual testing of all workflows completed
- [ ] Story committed to git
- [ ] Story documentation created

---

## Notes

**Design Decisions:**
- Five categories match Epic 1 requirements exactly
- 15-1000 character range balances meaningful content with brevity
- Color coding helps users distinguish categories at a glance
- Similar UX pattern to SWOT Analysis for consistency
- JSONB storage provides flexibility for future schema changes

**Future Enhancements (Post-MVP):**
- AI-powered suggestions based on city data and trends
- Import demographic data from Census API
- Link environmental factors to specific initiatives
- Trend analysis across multiple plan cycles
- Comparative analysis with other departments

---

**Story Created:** January 11, 2025
**Story Implemented:** January 11, 2025
**Last Updated:** January 11, 2025
