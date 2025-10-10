# Story 1.8: Add Initiative Financial Analysis

**Story ID:** STORY-1.8
**Epic:** Epic 1 - Department Creates Strategic Plan
**Priority:** P0 (Critical - MVP Launch Blocker)
**Story Points:** 13
**Status:** In Progress
**Assigned To:** Developer
**Created:** January 10, 2025
**Updated:** January 10, 2025

---

## User Story

**As a** Strategic Planner
**I want to** document initiative budget and funding sources
**So that** Finance can validate and City Manager can make funding decisions

---

## Acceptance Criteria

1. **Budget Breakdown**
   - User can input budget for Years 1, 2, and 3
   - Each year broken down by categories:
     - Personnel costs
     - Equipment & technology
     - Professional services
     - Training & development
     - Materials & supplies
     - Other costs
   - System auto-calculates totals per year and overall total

2. **Funding Sources**
   - User can add multiple funding sources per initiative
   - Each funding source includes:
     - Source name (e.g., "General Fund", "Grant XYZ")
     - Amount
     - Status: Secured, Requested, Pending, Projected
   - User can edit/delete funding sources

3. **Budget Validation**
   - System validates: Sum of funding sources = Total budget (all years)
   - Show warning if funding is insufficient or exceeds budget
   - Show validation status (balanced, under-funded, over-funded)

4. **Display**
   - Budget summary displays on initiative cards
   - Detailed budget breakdown accessible in edit mode
   - Funding source status indicated with color badges
   - Total costs updated in initiative list

5. **Data Storage**
   - Detailed budget stored in `financial_analysis` JSONB field
   - Year totals stored in `total_year_1_cost`, `total_year_2_cost`, `total_year_3_cost`
   - Funding sources stored in separate `initiative_budgets` table

---

## Database Schema

### Initiatives Table (existing fields)

```sql
-- Already exists in initiatives table
financial_analysis JSONB DEFAULT '{}'::jsonb,
total_year_1_cost NUMERIC(12,2) DEFAULT 0,
total_year_2_cost NUMERIC(12,2) DEFAULT 0,
total_year_3_cost NUMERIC(12,2) DEFAULT 0,
```

### Initiative Budgets Table (from migration)

```sql
CREATE TABLE initiative_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE RESTRICT,
    funding_source TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    funding_status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT initiative_budgets_status_check CHECK (funding_status IN ('secured', 'requested', 'pending', 'projected'))
);
```

---

## Technical Implementation

### Budget Breakdown Structure (JSONB)

```typescript
interface BudgetBreakdown {
  year_1: {
    personnel: number
    equipment: number
    services: number
    training: number
    materials: number
    other: number
    total: number  // calculated
  }
  year_2: {
    personnel: number
    equipment: number
    services: number
    training: number
    materials: number
    other: number
    total: number  // calculated
  }
  year_3: {
    personnel: number
    equipment: number
    services: number
    training: number
    materials: number
    other: number
    total: number  // calculated
  }
  grand_total: number  // calculated
}
```

### Server Actions

**New actions in `app/actions/initiatives.ts`:**
```typescript
export async function updateInitiativeBudget(
  initiativeId: string,
  budgetBreakdown: BudgetBreakdown
): Promise<void>

export async function addFundingSource(input: AddFundingSourceInput): Promise<{ id: string }>
export async function updateFundingSource(input: UpdateFundingSourceInput): Promise<void>
export async function deleteFundingSource(id: string): Promise<void>
export async function getFundingSources(initiativeId: string): Promise<FundingSource[]>
```

### Components

1. **`components/initiatives/BudgetBreakdownForm.tsx`**
   - Three-year budget input form
   - Category breakdown with numeric inputs
   - Auto-calculation of totals
   - Displays validation warnings

2. **`components/initiatives/FundingSourcesForm.tsx`**
   - List of funding sources
   - Add/edit/delete funding source dialog
   - Status dropdown (Secured, Requested, Pending, Projected)
   - Shows total funded vs. budget needed

3. **`components/initiatives/BudgetSummary.tsx`**
   - Read-only budget display
   - Shows year-by-year totals
   - Funding sources breakdown
   - Validation status indicator

### UI/UX Design

**Budget Breakdown Form:**
```
┌─────────────────────────────────────────────────────────┐
│ Budget Breakdown                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Category          │  Year 1  │  Year 2  │  Year 3  │   │
│ ──────────────────┼──────────┼──────────┼──────────┤   │
│ Personnel         │ $50,000  │ $52,000  │ $54,000  │   │
│ Equipment & Tech  │ $25,000  │  $5,000  │  $5,000  │   │
│ Prof. Services    │ $10,000  │ $10,000  │ $10,000  │   │
│ Training & Dev    │  $3,000  │  $3,000  │  $3,000  │   │
│ Materials         │  $2,000  │  $2,000  │  $2,000  │   │
│ Other             │  $1,000  │  $1,000  │  $1,000  │   │
│ ──────────────────┼──────────┼──────────┼──────────┤   │
│ Total             │ $91,000  │ $73,000  │ $75,000  │   │
│                                                          │
│ Grand Total: $239,000                                   │
└─────────────────────────────────────────────────────────┘
```

**Funding Sources Form:**
```
┌─────────────────────────────────────────────────────────┐
│ Funding Sources                        [Add Source]     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ General Fund                                             │
│ Amount: $150,000    Status: Secured        [Edit][Del]  │
│                                                          │
│ State Grant Program                                      │
│ Amount: $50,000     Status: Requested      [Edit][Del]  │
│                                                          │
│ Bond Funding                                             │
│ Amount: $39,000     Status: Projected      [Edit][Del]  │
│                                                          │
│ ──────────────────────────────────────────────────────  │
│ Total Funding: $239,000                                  │
│ Budget Needed: $239,000                                  │
│ Status: ✓ Balanced                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Business Rules

1. **Budget Calculation**
   - Year totals = sum of all categories for that year
   - Grand total = sum of all year totals
   - Update `total_year_X_cost` fields when budget changes

2. **Funding Validation**
   - Total funding = sum of all funding source amounts
   - If total funding < grand total → Under-funded (warning)
   - If total funding > grand total → Over-funded (warning)
   - If total funding = grand total → Balanced (success)

3. **Funding Status**
   - **Secured**: Funding confirmed and available
   - **Requested**: Application submitted, awaiting approval
   - **Pending**: Under review or in pipeline
   - **Projected**: Expected but not yet formally requested

4. **Permissions**
   - Same as initiative editing permissions
   - Only department staff and admins can modify budgets

---

## Validation Rules

1. All budget amounts must be ≥ 0
2. Budget amounts support up to 2 decimal places
3. Funding source amounts must be > 0
4. At least one funding source required if budget > 0
5. Funding source name required (max 100 chars)

---

## Test Scenarios

### Happy Path
1. User opens initiative financial section
2. User enters budget breakdown for 3 years
3. System calculates totals automatically
4. User adds funding sources
5. System validates funding matches budget
6. User saves successfully
7. Budget displays on initiative card

### Edge Cases
1. User enters $0 for all categories → valid, no funding required
2. User has partial funding → shows under-funded warning
3. User has excess funding → shows over-funded warning
4. User deletes funding source → recalculates validation
5. User changes budget → recalculates validation

### Error Cases
1. User enters negative amounts → validation error
2. User enters non-numeric values → validation error
3. Database error during save → show error toast
4. Permission denied → show error

---

## Integration Points

1. **Initiative Edit Flow**
   - Add "Financial Analysis" section after basic info
   - Tab or accordion UI to organize sections
   - Auto-save budget changes

2. **Initiative Display**
   - Show budget summary on initiative cards
   - Color-code funding status (balanced/under/over)
   - Display funding sources with status badges

3. **Plan Summary**
   - Roll up initiative budgets to goal level
   - Roll up to plan level for total investment
   - Update `total_investment_amount` on strategic_plans

---

## Definition of Done

- [ ] Story documentation created
- [ ] Budget breakdown form component built
- [ ] Funding sources form component built
- [ ] Server actions for budget CRUD implemented
- [ ] Budget validation logic working
- [ ] Financial section integrated into initiative edit
- [ ] Budget summary displays on initiative cards
- [ ] Numeric calculations accurate (tested with edge cases)
- [ ] Funding status badges color-coded correctly
- [ ] Build passes with no errors
- [ ] Code committed to git with descriptive message

---

## Notes

- Budget breakdown stored in JSONB for flexibility
- Normalized funding sources in separate table for easier queries
- Year totals in numeric columns for fast aggregation queries
- Consider adding budget approval workflow in future
- Future: Track actual spending vs. budget (Phase 2)
- Future: Multi-year budget forecasting (Phase 2)

---

## Related Stories

- **Depends on:** Story 1.7 (Create Initiative with Basic Info)
- **Blocks:** Story 1.9 (Add Initiative ROI Analysis)
- **Related to:** Story 1.11 (View Department Dashboard) - budget rollups

---

**Story Progress:**
- [x] Documentation created
- [ ] Budget breakdown form built
- [ ] Funding sources form built
- [ ] Server actions implemented
- [ ] Integration complete
- [ ] Testing complete
- [ ] Committed to git
