# Epic 3: Finance Validates Budgets

**Epic ID:** EPIC-003
**Priority:** P0 (High - MVP)
**Status:** Not Started
**Owner:** Product Owner (Sarah)
**Target Release:** MVP (Week 7-10)

---

## Epic Goal

Enable Finance Director to validate initiative budgets across all departments, track funding sources, identify funding gaps, and ensure financial accuracy - reducing budget validation time from 4 weeks to 1 week.

---

## Business Value

**Problem Solved:**
- Finance receives inconsistent budget formats from departments
- Manual data extraction from Word/Excel
- Slow feedback loops (email back-and-forth)
- Difficult to track grant funding status city-wide
- No visibility into over-committed funding sources

**Expected Outcomes:**
- 75% time reduction in budget validation
- 100% consistent budget data format
- Real-time feedback to departments
- Instant funding source tracking

**Success Metrics:**
- Finance validates 100% of initiative budgets via system
- Average budget validation time ≤ 1 week
- Zero budget math errors
- 100% of grant funding tracked in system

---

## Epic Description

This epic provides Finance Department with tools to review, validate, and track budget data across all departmental strategic plans. Finance can provide inline feedback, track funding sources, and run scenario analyses.

**Key Capabilities:**

1. **View All Initiative Budgets**
   - Cross-department budget dashboard
   - Filter by: Department, Fiscal Year, Funding Source, Status
   - Drill into individual initiatives

2. **Budget Validation**
   - Inline comments on initiative budgets
   - Flag issues (funding gaps, math errors, unrealistic estimates)
   - Mark budgets as "validated" (optional workflow)

3. **Funding Source Tracking**
   - Dashboard showing total by funding source (General Fund, Grants, Bonds, Fees)
   - Funding status tracking (secured, requested, pending)
   - Alert if funding source over-committed

4. **Grant Management**
   - List of all grant-funded initiatives
   - Grant status tracking
   - Grant application deadlines (future enhancement)

5. **Finance Dashboard**
   - City-wide budget summary
   - Budget by fiscal year
   - Budget by category
   - Funding source breakdown

6. **Budget Scenario Analysis** (Future: Phase 2)
   - What-if analysis (100%/75%/50% funding scenarios)
   - Identify which initiatives to defer if budget cut

---

## User Personas

**Primary User:**
- **Finance Director Fran** (Budget validator, funding tracker)

**Secondary Users:**
- **Finance Staff** (Support validation process)
- **City Manager** (Funding decisions)

---

## User Journey

### As-Is (Manual Process - 4 weeks)
1. Departments email Word docs with budget tables (1 week to receive all)
2. Extract data to Excel, check math, validate formats (1 week)
3. Email correction requests to departments, wait for updates (1 week)
4. Re-validate, consolidate city-wide budget (1 week)

### To-Be (Digital System - 1 week)
1. Finance has real-time access to all budgets as departments create them (concurrent)
2. Review budgets online, add comments inline (2 days)
3. Departments see comments immediately, make corrections (1 day)
4. Finance re-reviews, marks validated (1 day)
5. Generate consolidated funding report instantly (5 minutes)

---

## Stories

### Story 3.1: View All Initiative Budgets Dashboard
**As a** Finance Director
**I want to** see all initiative budgets across departments
**So that** I can validate financial data and track funding

**Acceptance Criteria:**
- Dashboard displays table of all initiatives with budget data
- Columns: Department, Initiative #, Name, Priority, Year 1/2/3 Costs, Total, Funding Sources, Status
- User can filter by: Department, Fiscal Year, Priority, Funding Source
- User can sort by: Budget amount, Department, Priority
- User can click initiative to view detail
- Dashboard shows summary: Total budget, Budget by fiscal year, Budget by department

**Story Points:** 13
**Priority:** P0
**Dependencies:** Epic 1 (initiative budgets exist)

---

### Story 3.2: View Initiative Budget Detail
**As a** Finance Director
**I want to** view detailed budget breakdown for an initiative
**So that** I can validate the accuracy of cost estimates

**Acceptance Criteria:**
- User can navigate to initiative budget detail view
- View displays:
  - Year 1/2/3 budget breakdown (Personnel, Equipment, Services, Training, Materials, Other)
  - Total per year and grand total
  - Funding sources with amounts and status
  - ROI analysis (financial and non-financial)
- View is read-only for Finance (cannot edit)
- User can add comments on budget (see Story 3.3)

**Story Points:** 5
**Priority:** P0
**Dependencies:** Epic 1, Story 3.1

---

### Story 3.3: Comment on Initiative Budgets
**As a** Finance Director
**I want to** add comments on initiative budgets
**So that** I can provide feedback on cost estimates or funding sources

**Acceptance Criteria:**
- User can add comment on initiative budget (same comment system as Epic 2)
- Comment appears in initiative detail view
- Department is notified of comment (future: Phase 2)
- User can mark budget comment resolved
- Unresolved budget comments count displays on initiative

**Story Points:** 3
**Priority:** P0
**Dependencies:** Story 3.2, Epic 2 Story 2.3 (comment system exists)

---

### Story 3.4: Funding Source Tracking Dashboard
**As a** Finance Director
**I want to** see total funding by source across all initiatives
**So that** I can track how much we're relying on each funding source

**Acceptance Criteria:**
- Dashboard displays:
  - Total budget by funding source (pie chart): General Fund, Grants, Bonds, Fees, Other
  - Table: Funding Source, Total Amount, # Initiatives, Secured Amount, Pending Amount
  - Alert if General Fund over-committed (>100% of budget capacity)
- User can click funding source to see all initiatives using that source
- User can filter by: Fiscal Year, Status (secured vs. pending)

**Story Points:** 13
**Priority:** P0
**Dependencies:** Epic 1, Story 3.1

---

### Story 3.5: Grant-Funded Initiatives List
**As a** Finance Director
**I want to** see all grant-funded initiatives
**So that** I can track grant applications and reporting requirements

**Acceptance Criteria:**
- Dashboard lists all initiatives with grant funding
- Table shows: Department, Initiative, Grant Source, Amount, Status (secured/pending/applied)
- User can filter by: Grant status, Department, Fiscal Year
- User can export list to Excel
- Future: Track grant application deadlines, reporting requirements (Phase 2)

**Story Points:** 8
**Priority:** P1
**Dependencies:** Story 3.1

---

### Story 3.6: Budget Category Analysis
**As a** Finance Director
**I want to** see budget breakdown by category city-wide
**So that** I can understand spending patterns (e.g., how much on personnel vs. equipment)

**Acceptance Criteria:**
- Dashboard displays total budget by category (pie or bar chart):
  - Personnel
  - Equipment & Technology
  - Professional Services
  - Training & Development
  - Materials & Supplies
  - Other
- User can drill down into initiatives in each category
- User can filter by: Department, Fiscal Year

**Story Points:** 8
**Priority:** P1
**Dependencies:** Story 3.1

---

### Story 3.7: Budget Validation Workflow (Optional)
**As a** Finance Director
**I want to** mark initiative budgets as "validated"
**So that** I can track which budgets I've reviewed

**Acceptance Criteria:**
- Finance can mark initiative budget as "validated" (checkbox or status field)
- Validation status displays on initiative list
- Dashboard shows: # budgets validated, # pending validation
- Only Finance role can validate budgets
- Optional: Budget cannot be changed after validated without Finance approval

**Story Points:** 5
**Priority:** P2 (Nice to have)
**Dependencies:** Story 3.2

---

### Story 3.8: Export Budget Data to Excel
**As a** Finance Director
**I want to** export budget data to Excel
**So that** I can perform additional analysis in my financial systems

**Acceptance Criteria:**
- User clicks "Export to Excel" from budget dashboard
- Excel file includes tabs:
  - All Initiatives (Department, Initiative, Budget breakdown, Funding sources)
  - Budget by Department (summary)
  - Budget by Funding Source (summary)
  - Budget by Category (summary)
  - Budget by Fiscal Year (summary)
- Export completes within 10 seconds

**Story Points:** 5
**Priority:** P1
**Dependencies:** Story 3.1

---

## Feature Requirements References

- FR-004: Initiative Budgets
- FR-006: Dashboard & Reporting (Finance Dashboard)
- FR-007: User Roles & Permissions (Finance role)
- FR-008: Comments & Collaboration

---

## Technical Considerations

**Authorization:**
- Finance role must have read access to all initiative budgets (RLS)
- Finance can comment but not edit budgets
- Optional: Finance can "validate" budgets (status field)

**Performance:**
- City-wide budget aggregations may be expensive
- Queries must be optimized with proper indexes
- Consider caching for dashboard data

**Data Integrity:**
- Ensure initiative_budgets table stays in sync with initiative financial_analysis JSONB
- Validate funding sources sum to total budget

---

## Definition of Done

**Epic is complete when:**

- [ ] All 8 stories completed with acceptance criteria met
- [ ] Finance can view all initiative budgets across departments
- [ ] Finance can comment on budgets and provide feedback
- [ ] Finance can track funding sources city-wide
- [ ] Finance can view grant-funded initiatives
- [ ] Finance can export budget data to Excel
- [ ] RLS policies enforce Finance permissions correctly
- [ ] Dashboard queries perform well (<3 seconds)
- [ ] Unit and integration tests complete
- [ ] Accepted by Product Owner in UAT

---

## Dependencies & Risks

**Dependencies:**
- Epic 1 complete (initiative budgets exist)
- Epic 2 comment system implemented
- RLS policies configured for Finance role

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Budget data inconsistent between JSONB and normalized tables | Medium | High | Implement transaction updates, validation checks |
| Finance workflow preferences unclear | Medium | Medium | Early UAT with Finance Director, iterate on feedback |
| Dashboard queries slow | Medium | Medium | Optimize queries, add indexes, caching |

---

## Notes

- This epic is critical for Finance buy-in and budget accuracy
- Prioritize Stories 3.1, 3.2, 3.3, 3.4 first (viewing, commenting, funding tracking)
- Grant tracking (3.5) and category analysis (3.6) are important but lower priority
- Budget validation workflow (3.7) is optional - may be over-engineering for MVP
- Excel export (3.8) is valuable for Finance but could be Phase 2 if time-constrained

---

**Epic Created:** January 9, 2025
**Last Updated:** January 9, 2025
