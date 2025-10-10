# Story 1.9: Add Initiative ROI Analysis

**Story ID:** STORY-1.9
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P0
**Story Points:** 8
**Status:** In Progress
**Created:** January 10, 2025

---

## User Story

**As a** Department Director
**I want to** document expected return on investment for an initiative
**So that** I can justify the investment to City Manager and Finance

---

## Acceptance Criteria

### Financial ROI
- [ ] User can input projected annual savings (dollar amount)
- [ ] User can input projected revenue generation (dollar amount)
- [ ] User can input payback period in months
- [ ] System auto-calculates 3-year net financial impact
- [ ] Negative values allowed for costs/expenses

### Non-Financial ROI
- [ ] User can document service quality improvement (multi-line text)
- [ ] User can document efficiency gains (multi-line text)
- [ ] User can document risk reduction (multi-line text)
- [ ] User can document citizen satisfaction impact (multi-line text)
- [ ] User can document employee impact (multi-line text)

### Data Persistence
- [ ] ROI data saved to initiatives.roi_analysis JSONB column
- [ ] Changes auto-save on form blur/submit
- [ ] System shows "last saved" timestamp

### Display
- [ ] ROI displays in formatted sections on initiative detail view
- [ ] Financial ROI shows calculated totals
- [ ] Non-financial ROI shows as formatted text blocks
- [ ] ROI summary visible on initiative card (collapsed by default)

---

## Business Context

### Problem
Department Directors need to justify major investments to City Manager and Finance. Current Word-based process makes it difficult to quantify ROI and compare initiatives objectively.

### Solution
Structured ROI analysis form that captures both financial and non-financial returns. This enables:
- Objective comparison of initiatives
- Data-driven budget allocation
- Clear justification for NEED vs. WANT prioritization

### Value Proposition
- **For Department Directors:** Strengthen investment justifications with quantitative data
- **For City Manager:** Compare initiatives across departments on financial merit
- **For Finance:** Validate financial assumptions and payback calculations
- **For Citizens:** Transparent ROI reporting demonstrates fiscal responsibility

---

## Technical Implementation

### Database Schema

The `initiatives` table already has an `roi_analysis` JSONB column. Structure:

```json
{
  "financial": {
    "annual_savings": 50000,
    "annual_revenue": 25000,
    "payback_months": 24,
    "three_year_impact": 225000
  },
  "non_financial": {
    "service_quality": "Reduces average response time from 15 minutes to 5 minutes...",
    "efficiency_gains": "Automates manual data entry, saving 10 staff hours per week...",
    "risk_reduction": "Eliminates single point of failure in critical infrastructure...",
    "citizen_satisfaction": "Expected 20% increase in satisfaction based on peer city data...",
    "employee_impact": "Reduces workplace injuries by 30% through improved safety equipment..."
  }
}
```

### Component Structure

**New Component: `RoiAnalysisForm.tsx`**
- Financial ROI section with currency inputs
- Non-financial ROI section with textareas
- Auto-calculation of 3-year impact
- Save button with loading state

**Updated Component: `InitiativeFinancialForm.tsx`**
- Add third tab: "ROI Analysis"
- Pass ROI data from initiative
- Handle save callback

**Updated Component: `InitiativeCard.tsx`**
- Display ROI summary in expanded view
- Show payback period badge if < 36 months
- Color-coded ROI indicator (positive/negative)

### Server Actions

**File: `app/actions/initiative-budgets.ts`**

```typescript
export interface RoiAnalysis {
  financial: {
    annual_savings: number
    annual_revenue: number
    payback_months: number
    three_year_impact: number
  }
  non_financial: {
    service_quality: string
    efficiency_gains: string
    risk_reduction: string
    citizen_satisfaction: string
    employee_impact: string
  }
}

export async function updateInitiativeRoi(
  initiativeId: string,
  roi: RoiAnalysis
): Promise<void>
```

### Business Logic

**3-Year Net Financial Impact Calculation:**
```typescript
const annualBenefit = roi.financial.annual_savings + roi.financial.annual_revenue
const threeYearImpact = (annualBenefit * 3)
```

**Payback Period Validation:**
- Must be positive integer
- Warning if > 36 months (exceeds plan period)
- Consider initial investment from budget breakdown

---

## UI/UX Design

### ROI Analysis Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Financial ROI                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Projected Annual Savings                                    │
│ ┌──────────────────────────────────┐                        │
│ │ $                                │  (e.g., reduced costs) │
│ └──────────────────────────────────┘                        │
│                                                              │
│ Projected Annual Revenue Generation                          │
│ ┌──────────────────────────────────┐                        │
│ │ $                                │  (e.g., new fees)      │
│ └──────────────────────────────────┘                        │
│                                                              │
│ Payback Period                                               │
│ ┌──────────────────────────────────┐                        │
│ │              months              │                         │
│ └──────────────────────────────────┘                        │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 3-Year Net Financial Impact: $225,000                   ││
│ │ (Auto-calculated)                                       ││
│ └─────────────────────────────────────────────────────────┘│
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Non-Financial ROI                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Service Quality Improvement                                  │
│ ┌──────────────────────────────────────────────────────────┐│
│ │                                                          ││
│ │ Describe expected improvements to service quality...    ││
│ │                                                          ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Efficiency Gains                                             │
│ ┌──────────────────────────────────────────────────────────┐│
│ │                                                          ││
│ │ Describe time savings, process improvements...          ││
│ │                                                          ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Risk Reduction                                               │
│ ┌──────────────────────────────────────────────────────────┐│
│ │                                                          ││
│ │ Describe risks mitigated or eliminated...               ││
│ │                                                          ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Citizen Satisfaction Impact                                  │
│ ┌──────────────────────────────────────────────────────────┐│
│ │                                                          ││
│ │ Expected impact on citizen satisfaction scores...       ││
│ │                                                          ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Employee Impact                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │                                                          ││
│ │ Impact on employee satisfaction, safety, workload...    ││
│ │                                                          ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│                                             [Save ROI]       │
└─────────────────────────────────────────────────────────────┘
```

### Initiative Card ROI Display

When initiative card is expanded and ROI exists:

```
Initiative Card (Expanded)
├── Basic Info (name, priority, status)
├── Description
├── Rationale
├── Expected Outcomes
└── ROI Summary
    ├── Financial Impact: $225K over 3 years
    ├── Payback: 24 months
    └── Non-Financial: Service quality ↑, Efficiency ↑, Risk ↓
```

---

## Validation Rules

### Financial ROI
1. **Annual Savings:** Optional, numeric, >= 0
2. **Annual Revenue:** Optional, numeric, >= 0
3. **Payback Period:** Optional, integer, > 0
4. **At least one financial metric:** Required if ROI section is filled

### Non-Financial ROI
1. **All fields optional** but encouraged
2. **Character limits:** 500 characters per field
3. **At least one non-financial field:** Recommended but not required

### Combined Validation
- **Warning if payback > 36 months:** "Payback period exceeds 3-year plan cycle"
- **Warning if no ROI data:** "Consider adding ROI analysis to strengthen justification"

---

## Test Scenarios

### Scenario 1: Add Financial ROI
**Given** I'm editing an initiative
**When** I enter:
- Annual savings: $50,000
- Annual revenue: $25,000
- Payback period: 24 months
**Then** System calculates:
- 3-year impact: $225,000 ($75K × 3)
**And** Data saves to roi_analysis JSONB

### Scenario 2: Add Non-Financial ROI
**Given** I'm editing an initiative
**When** I fill in service quality improvement: "Reduces response time from 15 to 5 minutes"
**And** I fill in efficiency gains: "Saves 10 staff hours weekly"
**Then** Data saves to roi_analysis JSONB
**And** ROI displays in initiative card when expanded

### Scenario 3: Long Payback Warning
**Given** I'm editing an initiative
**When** I enter payback period: 48 months
**Then** System shows warning: "Payback period exceeds 3-year plan cycle"
**But** Allows me to save anyway

### Scenario 4: Edit Existing ROI
**Given** Initiative has existing ROI data
**When** I open ROI form
**Then** Form pre-fills with saved values
**When** I change annual savings to $60,000
**Then** 3-year impact recalculates to $255,000
**And** Changes save correctly

### Scenario 5: No ROI Data
**Given** Initiative has no ROI data
**When** I view initiative card
**Then** No ROI section displays
**And** No warnings shown (ROI is optional)

---

## Edge Cases

### Case 1: Negative Financial Impact
**Scenario:** Initiative costs money but has strong non-financial ROI
**Handling:** Allow negative values, display as "(Cost)" in UI

### Case 2: Zero Payback Period
**Scenario:** User enters 0 months
**Handling:** Validation error: "Payback period must be at least 1 month"

### Case 3: Very Large Numbers
**Scenario:** Annual savings = $10,000,000
**Handling:** Format with commas: "$10,000,000", no scientific notation

### Case 4: Empty ROI Form Submission
**Scenario:** User saves ROI form with all fields empty
**Handling:** Save null/empty object, don't show ROI section in display

### Case 5: Partial Financial ROI
**Scenario:** User only fills annual savings, not revenue
**Handling:** Calculate 3-year impact with partial data (savings only)

---

## Dependencies

**Requires:**
- Story 1.8 (Initiative Financial Analysis) - COMPLETED
- Initiative edit workflow in place
- Initiative JSONB roi_analysis column

**Blocks:**
- Story 1.11 (Department Dashboard) - needs ROI data for reporting

---

## Accessibility

- All form inputs have labels with `htmlFor` attributes
- Currency inputs include aria-label for screen readers
- Textareas have placeholder text and character count
- Auto-calculated fields marked as `aria-readonly`
- Validation errors announced via aria-live regions

---

## Performance Considerations

- ROI data stored in JSONB, indexed for queries
- Auto-calculation happens client-side (no server round-trip)
- Debounce auto-save by 500ms to reduce server calls
- ROI form lazy-loaded in dialog (not on initial page load)

---

## Future Enhancements (Out of Scope)

1. **ROI Templates:** Pre-defined ROI templates by initiative type
2. **Comparison Tool:** Compare ROI across initiatives
3. **ROI Validation:** Finance can approve/reject ROI assumptions
4. **Actual vs. Projected:** Track actual ROI during implementation
5. **ROI Scoring:** Automated ROI score (0-100) for ranking

---

## Definition of Done

- [x] Story documented with acceptance criteria
- [ ] RoiAnalysisForm component created with all fields
- [ ] 3-year impact auto-calculation working
- [ ] Server action for saving ROI implemented
- [ ] ROI tab added to InitiativeFinancialForm
- [ ] ROI summary displays in InitiativeCard (expanded view)
- [ ] Validation rules implemented
- [ ] Build passes with no TypeScript errors
- [ ] Manual testing: Create, edit, delete ROI data
- [ ] Git commit with descriptive message
- [ ] Story marked as complete in backlog

---

## Notes

- ROI analysis is **optional** but highly recommended for NEED-priority initiatives
- Finance Director will use ROI data to validate budget requests in Epic 3
- City Manager dashboard will show initiatives by ROI for comparison (Epic 2)
- Consider adding ROI templates in future for common initiative types (e.g., technology upgrades, facility improvements)

---

**Story Created:** January 10, 2025
**Last Updated:** January 10, 2025
