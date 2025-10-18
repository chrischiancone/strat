# Epic 1: Department Creates Strategic Plan

**Epic ID:** EPIC-001
**Priority:** P0 (Critical - MVP Launch Blocker)
**Status:** Not Started
**Owner:** Product Owner (Sarah)
**Target Release:** MVP (Week 1-6)

---

## Epic Goal

Enable Department Directors and their staff to create comprehensive 3-year strategic plans digitally, reducing plan creation time from 40-50 hours to <25 hours while improving data quality and collaboration.

---

## Business Value

**Problem Solved:**
- Current manual process (Word/Excel) takes 6 weeks and is error-prone
- No version control or real-time collaboration
- Budget data inconsistency across departments
- Difficult for City Manager and Finance to review plans

**Expected Outcomes:**
- 50% reduction in plan creation time
- 100% of plans created in the system (not Word)
- Real-time collaboration and feedback
- Automated budget validation

**Success Metrics:**
- 3+ departments create plans in system during pilot
- Average creation time ≤ 25 hours
- User satisfaction score ≥ 4.0/5.0
- Zero data entry errors in budget tables

---

## Epic Description

This epic covers the complete workflow for a Department Director and their Strategic Planning staff to create a new 3-year strategic plan from scratch. The system will provide structured templates, guided forms, and real-time validation to ensure high-quality, consistent strategic plans.

**Key Capabilities:**

1. **Plan Creation & Metadata**
   - Create new strategic plan for fiscal year span (e.g., FY2026-2028)
   - Pre-fill department information from previous plans
   - Define plan title, vision statement, executive summary

2. **Department Overview**
   - Update department mission, director info, staffing levels
   - Document core services provided
   - Review and update KPIs from previous cycle

3. **Strategic Analysis**
   - Complete SWOT analysis (structured form)
   - Environmental scan (demographics, economic, regulatory, technology, community)
   - Benchmarking data (peer municipality comparisons)

4. **Strategic Goals & Objectives**
   - Define 3-5 strategic goals aligned with city priorities
   - Specify SMART objectives for each goal
   - Define success measures

5. **Initiative Management**
   - Create initiatives organized under goals
   - Set priority level (NEED, WANT, NICE_TO_HAVE)
   - Rank initiatives within priority tiers
   - Detailed descriptions, rationale, expected outcomes

6. **Financial Analysis**
   - Initiative budgets with category breakdown (personnel, equipment, services, training, materials)
   - Multiple funding sources per initiative (General Fund, Grants, Bonds, Fees)
   - Funding status tracking (secured, requested, pending, projected)
   - ROI analysis (financial and non-financial)
   - Cost-benefit analysis

7. **Performance Tracking Setup**
   - Define KPIs at initiative, goal, or plan level
   - Set baseline and Year 1/2/3 targets
   - Specify measurement frequency and data source

8. **Collaboration & Review**
   - Invite collaborators (Strategic Planner, Assistant Director)
   - Real-time co-editing (future: Phase 2)
   - Inline comments for feedback

9. **Department Dashboard**
   - View plan summary and status
   - Initiatives by priority and status
   - Budget overview
   - KPI progress (once tracking begins)

---

## User Personas

**Primary Users:**
- **Department Director Donna** (Owner, approver)
- **Strategic Planner Sam** (Primary creator/editor)

**Secondary Users:**
- **Assistant Director** (Reviewer)
- **Finance Director Fran** (Budget validator)
- **City Manager Chris** (Approver)

---

## User Journey

### As-Is (Manual Process - 6 weeks)
1. Download Word template, copy/paste from last year (Week 1)
2. Gather input from division managers, draft content (Weeks 2-3)
3. Build budget tables in Excel, copy to Word (Week 3)
4. Email draft for internal review, incorporate feedback (Week 4)
5. Submit to City Manager via email for review (Week 5)
6. Address feedback, resubmit, get approval (Week 6)

### To-Be (Digital System - 3 weeks)
1. Log in, create new plan, system pre-fills data (2 hours)
2. Complete SWOT, goals, initiatives using structured forms (10 hours over 2 weeks)
3. Finance reviews budgets inline with real-time comments (concurrent)
4. City Manager reviews online, provides feedback (3 days)
5. Address feedback inline, get instant approval (1 day)
6. **Total: ~20 hours over 3 weeks (50% reduction)**

---

## Stories

### Story 1.1: Create New Strategic Plan
**As a** Department Director
**I want to** create a new 3-year strategic plan
**So that** I can start documenting my department's priorities for the upcoming planning cycle

**Acceptance Criteria:**
- User can click "Create New Plan" button from dashboard
- System prompts for: Department (auto-filled if user has only one), Start Fiscal Year, End Fiscal Year
- System creates draft plan with pre-filled department metadata
- User is redirected to plan edit view
- Plan appears in user's plan list with status "draft"

**Story Points:** 5
**Priority:** P0
**Dependencies:** None

---

### Story 1.2: Edit Plan Metadata & Overview
**As a** Department Director
**I want to** edit plan metadata and department overview
**So that** I can provide context for my strategic plan

**Acceptance Criteria:**
- User can edit: Plan title, Executive summary, Department vision
- User can update department info: Director name/email, Mission statement
- User can edit core services (list)
- User can edit current staffing levels (form: Executive/Management, Professional Staff, Technical/Support)
- System auto-saves on field blur
- System shows "last saved" timestamp

**Story Points:** 8
**Priority:** P0
**Dependencies:** Story 1.1

---

### Story 1.3: Complete SWOT Analysis
**As a** Strategic Planner
**I want to** complete a SWOT analysis for my department
**So that** I can identify our strengths, weaknesses, opportunities, and threats

**Acceptance Criteria:**
- User can access SWOT section from plan navigation
- User can add/edit/delete items in each category (Strengths, Weaknesses, Opportunities, Threats)
- Each item is a text field with multi-line support
- User can reorder items within a category
- System saves SWOT data as JSONB
- SWOT displays in read-only mode on plan detail view

**Story Points:** 5
**Priority:** P0
**Dependencies:** Story 1.2

---

### Story 1.4: Complete Environmental Scan
**As a** Strategic Planner
**I want to** document environmental factors affecting my department
**So that** I can show we've considered external trends and pressures

**Acceptance Criteria:**
- User can access Environmental Scan section
- User can document: Demographic trends, Economic factors, Regulatory/legislative changes, Technology trends, Community expectations
- Each subsection supports multiple text entries
- System saves as JSONB
- Environmental scan displays in formatted view

**Story Points:** 5
**Priority:** P1
**Dependencies:** Story 1.2

---

### Story 1.5: Add Benchmarking Data
**As a** Department Director
**I want to** document how we compare to peer municipalities
**So that** I can justify our investment requests with comparative data

**Acceptance Criteria:**
- User can list peer municipalities compared (text list)
- User can add benchmarking metrics in table format (Metric, Carrollton Current, Peer Average, Gap Analysis)
- User can add key findings (text)
- System saves as JSONB
- Benchmarking displays in formatted table

**Story Points:** 5
**Priority:** P1
**Dependencies:** Story 1.2

---

### Story 1.6: Define Strategic Goals
**As a** Department Director
**I want to** define 3-5 strategic goals for my plan
**So that** I can organize initiatives thematically and show alignment with city priorities

**Acceptance Criteria:**
- User can add goals (up to 5) with: Goal number, Title, Description
- User can select city priority alignment from dropdown
- User can add multiple SMART objectives (bullet list)
- User can add success measures (bullet list)
- User can reorder goals
- User can delete goals (with confirmation if initiatives exist)
- Goals display in plan overview with initiative count

**Story Points:** 8
**Priority:** P0
**Dependencies:** Story 1.2

---

### Story 1.7: Create Initiative with Basic Info
**As a** Strategic Planner
**I want to** create an initiative under a strategic goal
**So that** I can document a specific project or investment

**Acceptance Criteria:**
- User can click "Add Initiative" on a goal
- User can specify: Initiative number (e.g., "1.1"), Name, Description, Rationale
- User can select Priority level (NEED, WANT, NICE_TO_HAVE)
- User can set rank within priority
- User can add expected outcomes (list)
- User can specify responsible party (text)
- System validates required fields
- Initiative appears in goal's initiative list

**Story Points:** 8
**Priority:** P0
**Dependencies:** Story 1.6

---

### Story 1.8: Add Initiative Financial Analysis
**As a** Strategic Planner
**I want to** document initiative budget and funding sources
**So that** Finance can validate and City Manager can make funding decisions

**Acceptance Criteria:**
- User can input Year 1/2/3 budget breakdown:
  - Personnel costs
  - Equipment & technology
  - Professional services
  - Training & development
  - Materials & supplies
  - Other costs
  - System auto-calculates total
- User can add multiple funding sources with: Source name, Amount, Status (secured/requested/pending/projected)
- System validates: Sum of funding sources = total budget
- System creates initiative_budgets records (normalized)
- Budget data displays in formatted table

**Story Points:** 13
**Priority:** P0
**Dependencies:** Story 1.7

---

### Story 1.9: Add Initiative ROI Analysis
**As a** Department Director
**I want to** document expected return on investment for an initiative
**So that** I can justify the investment to City Manager and Finance

**Acceptance Criteria:**
- User can input Financial ROI:
  - Projected annual savings
  - Projected revenue generation
  - Payback period (months)
  - 3-year net financial impact
- User can input Non-Financial ROI:
  - Service quality improvement (text)
  - Efficiency gains (text)
  - Risk reduction (text)
  - Citizen satisfaction impact (text)
  - Employee impact (text)
- System saves as JSONB
- ROI displays in formatted sections

**Story Points:** 8
**Priority:** P0
**Dependencies:** Story 1.8

---

### Story 1.10: Define Initiative KPIs
**As a** Strategic Planner
**I want to** define KPIs for an initiative
**So that** we can track progress toward expected outcomes

**Acceptance Criteria:**
- User can add KPIs to an initiative
- User can specify: Metric name, Measurement frequency, Baseline value, Year 1/2/3 targets
- User can specify data source and responsible party
- User can add KPIs at goal level or plan level (not just initiative)
- KPIs display in initiative detail view
- System validates: baseline and targets are provided

**Story Points:** 8
**Priority:** P0
**Dependencies:** Story 1.7

---

### Story 1.11: View Department Dashboard
**As a** Department Director
**I want to** see a dashboard summarizing my department's strategic plan
**So that** I can quickly understand status, budget, and progress

**Acceptance Criteria:**
- Dashboard displays:
  - Plan status and metadata
  - Initiatives by priority (NEEDS: X, WANTS: Y, NICE TO HAVES: Z)
  - Initiatives by status (not_started, in_progress, at_risk, completed)
  - Total budget by fiscal year (bar chart)
  - Budget by funding source (pie chart)
  - KPI progress summary (list of KPIs with % to target)
- Dashboard updates in real-time as plan is edited
- Dashboard is accessible from main navigation

**Story Points:** 13
**Priority:** P0
**Dependencies:** Stories 1.7, 1.8, 1.10

---

## Feature Requirements References

- FR-001: Strategic Plan Management
- FR-002: Strategic Goals
- FR-003: Initiative Management
- FR-004: Initiative Budgets
- FR-005: KPI Tracking
- FR-006: Dashboard & Reporting (Department Dashboard)

---

## Technical Considerations

**Database Tables:**
- `strategic_plans`
- `strategic_goals`
- `initiatives`
- `initiative_budgets`
- `initiative_kpis`

**Complex Forms:**
- JSONB fields require dynamic form rendering
- Budget tables with auto-calculation
- Multi-step wizard vs. single long form (TBD)

**Validation:**
- Required field validation
- Budget math validation (totals must match)
- Fiscal year date range validation

**Performance:**
- Dashboard queries may be expensive with many initiatives
- Consider caching or materialized views

---

## Definition of Done

**Epic is complete when:**

- [ ] All 11 stories completed with acceptance criteria met
- [ ] Department Director can create a complete strategic plan from scratch
- [ ] Plan includes: metadata, SWOT, environmental scan, goals, initiatives, budgets, KPIs
- [ ] Department dashboard displays accurate summary data
- [ ] System validates all required fields and budget math
- [ ] Data persists correctly in PostgreSQL (relational + JSONB)
- [ ] UI is responsive and accessible (WCAG 2.1 Level AA)
- [ ] Unit tests for business logic (budget calculations, validations)
- [ ] Integration tests for complete plan creation flow
- [ ] Documentation updated (user guide, technical docs)
- [ ] Accepted by Product Owner in UAT

---

## Dependencies & Risks

**Dependencies:**
- Supabase database setup with migrations complete
- User authentication working
- Department and fiscal year data seeded
- UI component library setup (TailwindCSS, shadcn/ui)

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| JSONB forms are complex to build | High | Medium | Use libraries like react-json-schema-form or build incremental prototypes |
| Budget validation logic is error-prone | Medium | High | Extensive unit tests, Finance review before launch |
| Dashboard queries are slow | Medium | Medium | Optimize queries, add indexes, consider caching |
| Users overwhelmed by long forms | Medium | Medium | Implement progressive disclosure, wizard-style flow, save progress frequently |

---

## Notes

- This is the **most critical epic** for MVP - without it, there's no product
- Prioritize Stories 1.1, 1.2, 1.6, 1.7, 1.8 first (core plan/goal/initiative creation)
- SWOT, environmental scan, benchmarking are lower priority (P1) - can be added later
- Consider building initiative creation as a multi-step wizard to reduce cognitive load
- Department dashboard is critical for user satisfaction - don't cut this

---

**Epic Created:** January 9, 2025
**Last Updated:** January 9, 2025
