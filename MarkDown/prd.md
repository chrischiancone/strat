# Product Requirements Document (PRD)
## Strategic Planning System for Municipal Government

**Document Version:** 1.0
**Last Updated:** January 9, 2025
**Product Owner:** Sarah
**Status:** Draft

---

## Document Control

| Field | Value |
|-------|-------|
| **Product Name** | Strategic Planning System (Stratic Plan) |
| **Target Release** | MVP - Q2 2025 |
| **Document Status** | Draft |
| **Primary Stakeholder** | City of Carrollton, TX |
| **Technical Lead** | TBD |
| **PRD Version** | v4 |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision & Goals](#product-vision--goals)
3. [Problem Statement](#problem-statement)
4. [Target Users & Personas](#target-users--personas)
5. [User Journeys](#user-journeys)
6. [Product Scope](#product-scope)
7. [Feature Requirements](#feature-requirements)
8. [MVP Definition](#mvp-definition)
9. [Non-Functional Requirements](#non-functional-requirements)
10. [Technical Architecture](#technical-architecture)
11. [Success Metrics](#success-metrics)
12. [Release Plan](#release-plan)
13. [Dependencies & Risks](#dependencies--risks)
14. [Appendices](#appendices)

---

## Executive Summary

The Strategic Planning System (Stratic Plan) is a Next.js web application that digitizes and streamlines the municipal government strategic planning process. The system replaces manual, document-based workflows with a structured, collaborative platform that enables departments to:

- Create and manage 3-year strategic plans
- Track initiatives with detailed financial analysis
- Monitor KPIs and quarterly milestones
- Facilitate cross-departmental collaboration
- Provide AI-powered insights and comparative analysis

### Key Highlights

**Primary Goal:** Transform the City of Carrollton's strategic planning from static Word/PDF documents to a dynamic, data-driven system.

**Target Users:** Department Directors, City Manager, Finance Department, City Council, and Municipal Staff

**Core Value Propositions:**
- **For Departments:** Simplified plan creation with templates, real-time collaboration, automated reporting
- **For City Leadership:** Consolidated view of all departmental plans, budget oversight, progress tracking
- **For Citizens:** Transparent access to published strategic plans and progress updates

**Technical Foundation:**
- Next.js 14+ (App Router)
- Supabase (PostgreSQL + Auth + Realtime)
- pgvector for AI/RAG capabilities
- Hybrid data model (relational + JSONB)

**MVP Timeline:** 12 weeks from kickoff to initial deployment

---

## Product Vision & Goals

### Vision Statement

**"Empower municipal departments to create, execute, and communicate strategic plans that drive measurable outcomes and community impact."**

### Product Goals

#### Primary Goals

1. **Streamline Plan Creation** (Target: 50% reduction in plan creation time)
   - Provide structured templates matching the official strategic plan format
   - Enable progressive disclosure (start simple, add detail as needed)
   - Auto-save and version control to prevent data loss

2. **Enable Data-Driven Decision Making** (Target: 100% of initiatives with tracked metrics)
   - Real-time budget aggregation across initiatives and departments
   - KPI tracking with visual progress indicators
   - Scenario planning for different funding levels (100%/75%/50%)

3. **Improve Cross-Departmental Collaboration** (Target: 30% increase in collaborative initiatives)
   - Identify shared initiatives and resource opportunities
   - Comment and feedback system for stakeholder review
   - Dependency tracking to surface blocking relationships

4. **Increase Transparency & Accountability** (Target: Public dashboard with quarterly updates)
   - Published plans accessible to citizens
   - Comprehensive audit trail of all changes
   - Automated reporting for City Council presentations

#### Secondary Goals

5. **Leverage AI for Strategic Insights**
   - Semantic search across all plans ("Find all infrastructure initiatives")
   - Comparative analysis ("How does our IT budget compare to Parks?")
   - Best practice recommendations based on similar initiatives

6. **Support Long-Term Strategic Management**
   - Year-over-year comparison and trend analysis
   - Historical initiative success rate tracking
   - Portfolio management across multiple planning cycles

### Success Criteria

The product will be considered successful when:

- ✅ 5+ departments actively using the system for their strategic plans
- ✅ City Manager can generate consolidated budget reports in <5 minutes
- ✅ Average time to create a strategic plan reduced from 6 weeks to 3 weeks
- ✅ 90%+ user satisfaction score from Department Directors
- ✅ City Council approves plans directly from the system (paperless)
- ✅ Citizens can view published plans with >1,000 views per quarter

---

## Problem Statement

### Current State (As-Is)

Municipal strategic planning today relies on:

**Manual Document Creation:**
- Department Directors create strategic plans in Word/Excel
- 1,400+ line template must be manually filled
- Copy/paste from previous years with manual updates
- Version control via email attachments ("Plan_v3_final_FINAL.docx")

**Fragmented Data:**
- Budget data in spreadsheets
- KPIs tracked in separate systems
- Dependencies documented in text, not enforced
- No central repository for all department plans

**Limited Collaboration:**
- Plans reviewed via email attachments
- Comments in Word tracked changes or PDF annotations
- No visibility into other departments' plans during creation
- Cross-departmental initiatives coordinated via meetings

**Reporting Challenges:**
- City Manager must manually consolidate data from multiple plans
- Finance department recreates budget summaries from Word tables
- Council presentations require custom slide decks
- Progress tracking requires manual status updates

### Problems to Solve

**P1 - Critical Problems (Must Solve in MVP):**

1. **Plan Creation is Time-Consuming:** Directors spend 40-60 hours over 6 weeks creating plans manually
2. **Budget Data is Inconsistent:** Different departments use different formats for financial analysis
3. **No Single Source of Truth:** Plans exist as static documents, not living data
4. **Limited Visibility:** City leadership can't see real-time plan status or consolidated budgets
5. **Poor Version Control:** Unclear which document version is authoritative

**P2 - Important Problems (Post-MVP):**

6. **Difficult to Track Progress:** No structured way to monitor quarterly milestones
7. **Collaboration is Asynchronous:** Feedback loops are slow (days to weeks)
8. **Citizens Have Limited Access:** Plans published as PDFs on website, hard to navigate
9. **No Historical Analysis:** Can't easily compare year-over-year or track initiative success rates

**P3 - Nice-to-Have Problems (Future):**

10. **Duplicate Efforts:** Departments may propose similar initiatives without knowing
11. **Best Practices Not Shared:** Successful initiative patterns not surfaced
12. **Benchmarking is Manual:** Comparing to other cities requires external research

---

## Target Users & Personas

### Primary Users (Daily/Weekly Usage)

#### Persona 1: **Department Director Donna** 👔
**Role:** Director of Water & Field Services
**Age:** 48 | **Tech Savvy:** Medium
**Goals:**
- Create comprehensive 3-year strategic plan for her department
- Secure funding for critical infrastructure initiatives
- Demonstrate accountability and transparency to City Manager/Council
- Track progress and adjust plans mid-year if needed

**Pain Points:**
- Overwhelmed by the 1,400-line template
- Unsure if budget estimates are realistic compared to other departments
- Needs to coordinate with Public Works on shared initiatives
- Tracking quarterly milestones manually in spreadsheets

**Usage Patterns:**
- Intense usage during planning season (July-September)
- Monthly updates to initiative status and KPIs
- Quarterly milestone reviews
- Ad-hoc budget adjustments throughout the year

**Key Workflows:**
1. Create new strategic plan from template
2. Add initiatives with detailed financial analysis
3. Invite City Manager for review/comments
4. Submit for City Council approval
5. Monitor progress dashboards monthly

---

#### Persona 2: **Strategic Planner Sam** 📊
**Role:** Department Strategic Planning Coordinator
**Age:** 32 | **Tech Savvy:** High
**Goals:**
- Support Department Director in creating high-quality strategic plans
- Ensure consistency with city-wide strategic priorities
- Coordinate with Finance on budget validation
- Track dependencies with other departments

**Pain Points:**
- Manually formatting Word documents to match template
- Chasing down information from division managers
- Keeping track of comments from multiple reviewers
- Reconciling budget numbers between spreadsheets and document

**Usage Patterns:**
- Daily usage during planning season
- Collaborates with Finance, IT, HR on shared initiatives
- Generates reports for leadership meetings
- Updates KPIs and milestone status

**Key Workflows:**
1. Draft initiatives based on Director's priorities
2. Coordinate with collaborating departments
3. Input budget data and validate funding sources
4. Track review comments and implement changes
5. Generate status reports

---

### Secondary Users (Weekly/Monthly Usage)

#### Persona 3: **City Manager Chris** 🏛️
**Role:** City Manager
**Age:** 55 | **Tech Savvy:** Medium
**Goals:**
- Understand strategic priorities across all departments
- Ensure plans align with City Council's vision
- Make funding decisions based on ROI and priority
- Present consolidated plans to City Council

**Pain Points:**
- Must read through 10+ lengthy strategic plan documents
- Difficult to compare initiatives across departments
- Budget aggregation requires manual Excel work
- Can't easily identify high-risk or delayed initiatives

**Usage Patterns:**
- Reviews all department plans during approval cycle (Aug-Sept)
- Monthly dashboard reviews
- Prepares quarterly reports for City Council
- Ad-hoc queries ("What's our total IT investment?")

**Key Workflows:**
1. Review draft plans from all departments
2. Provide feedback via comments
3. Approve/request revisions
4. Generate consolidated budget reports
5. Monitor at-risk initiatives

---

#### Persona 4: **Finance Director Fran** 💰
**Role:** Director of Finance
**Age:** 52 | **Tech Savvy:** High (Excel expert)
**Goals:**
- Validate budget estimates and funding sources
- Track total investment by fiscal year
- Ensure initiatives align with available funding
- Support grant application processes

**Pain Points:**
- Departments submit inconsistent budget formats
- Must recreate financial summaries in Excel
- Grant funding status not centrally tracked
- Difficult to model funding scenarios (what if budget cut 10%?)

**Usage Patterns:**
- Heavy usage during budget planning (June-August)
- Reviews all initiative budgets for accuracy
- Monthly reconciliation with financial systems
- Quarterly funding source reports

**Key Workflows:**
1. Review and validate initiative budgets
2. Identify grant opportunities
3. Run funding scenario analyses
4. Generate financial reports for City Council
5. Track budget vs. actual spending

---

### Tertiary Users (Occasional Usage)

#### Persona 5: **City Council Member Carol** 🗳️
**Role:** Elected City Council Member
**Age:** 61 | **Tech Savvy:** Low-Medium
**Goals:**
- Understand departmental priorities and investments
- Make informed approval decisions
- Hold departments accountable for results
- Represent constituent interests

**Pain Points:**
- Strategic plans are long and dense
- Hard to understand trade-offs and alternatives
- Limited ability to track progress after approval
- Constituent questions about plan status

**Usage Patterns:**
- Reviews plans during approval cycle (September)
- Quarterly progress check-ins
- Responds to constituent inquiries

**Key Workflows:**
1. Review strategic plan summaries
2. Ask questions via comments (or in Council meetings)
3. Vote on plan approval
4. Monitor progress via public dashboards

---

#### Persona 6: **Engaged Citizen Emily** 🏘️
**Role:** Carrollton Resident, Community Advocate
**Age:** 38 | **Tech Savvy:** High
**Goals:**
- Understand how tax dollars are being invested
- Track progress on community priorities (parks, infrastructure)
- Provide feedback on proposed initiatives
- Hold government accountable

**Pain Points:**
- Plans published as lengthy PDFs, hard to navigate
- No way to see progress updates between annual reports
- Can't easily find initiatives relevant to her neighborhood
- No mechanism to provide feedback

**Usage Patterns:**
- Reviews published plans when available
- Checks progress quarterly (if available)
- Attends City Council meetings when major initiatives discussed

**Key Workflows:**
1. Browse published strategic plans by department
2. Search for initiatives (e.g., "park improvements near me")
3. View progress updates and KPIs
4. (Future) Comment or ask questions

---

## User Journeys

### Journey 1: Department Director Creates New Strategic Plan

**Actor:** Department Director Donna
**Goal:** Create and submit a 3-year strategic plan for FY2026-2028
**Timeline:** 6 weeks (target: reduce to 3 weeks)

#### Current Journey (As-Is) - Manual Process

1. **Week 1: Setup**
   - Download 1,400-line Word template from shared drive
   - Copy/paste data from last year's plan
   - Update fiscal years and dates manually
   - Save as "Draft_v1.docx"

2. **Weeks 2-3: Content Creation**
   - Meet with division managers to gather initiative ideas
   - Draft SWOT analysis based on notes
   - Create initiative descriptions in Word
   - Build budget tables in Excel, copy to Word
   - Email draft to Strategic Planner for formatting help

3. **Week 4: Internal Review**
   - Share "Draft_v3.docx" with Assistant Director
   - Receive comments via Track Changes
   - Update document, save as "Draft_v4_AD_reviewed.docx"
   - Email to Finance for budget validation
   - Receive Excel with corrections, manually update Word

4. **Week 5: City Manager Review**
   - Submit "Draft_FINAL.docx" via email
   - City Manager reviews, adds comments in PDF
   - Donna receives PDF with annotations, interprets feedback
   - Updates Word document
   - Resubmits "Draft_FINAL_v2.docx"

5. **Week 6: Approval**
   - City Manager approves via email
   - Plan submitted to City Council packet (PDF export)
   - Council reviews in meeting
   - Approved plan published to website as PDF

**Pain Points in Current Journey:**
- ❌ Version control nightmare (which file is latest?)
- ❌ Manual data entry and copy/paste errors
- ❌ Slow feedback loops (email turnaround)
- ❌ Budget data consistency issues
- ❌ No visibility until submitted

---

#### Future Journey (To-Be) - Digital System

1. **Week 1: Setup** (2 hours)
   - Log into Stratic Plan system
   - Click "Create New Strategic Plan"
   - System pre-fills: Department, Fiscal Years, Previous Plan Data
   - Review/update department overview (mission, staffing, KPIs)
   - System auto-saves continuously

2. **Weeks 2-3: Content Creation** (10 hours)
   - Complete SWOT analysis with structured form
   - Click "Add Initiative" for each priority
   - Use initiative wizard: Name → Description → Budget → KPIs
   - System validates: required fields, budget math, funding sources
   - Invite Strategic Planner as collaborator (real-time co-editing)
   - Assign initiatives to goals, system tracks completion %

3. **Week 3: Internal Review** (Concurrent with creation)
   - Share plan link with Assistant Director (view-only or edit)
   - AD adds inline comments on specific initiatives
   - Donna responds and marks comments resolved
   - System notifies participants of updates
   - Finance reviews budget data via dashboard (no file exchange)

4. **Week 4: City Manager Review** (3 days)
   - Change plan status: Draft → Under Review
   - System notifies City Manager (link in email)
   - City Manager reviews online, adds comments
   - Donna receives notification, addresses feedback inline
   - City Manager marks plan Approved (single click)

5. **Week 5: Council Presentation**
   - Generate PDF export for Council packet (automated)
   - City Manager presents using live dashboard
   - Council members view summary online (optional)
   - Vote recorded in system
   - Status changes: Approved → Active

6. **Ongoing: Progress Tracking**
   - Monthly: Update KPI actual values (5 min)
   - Quarterly: Mark milestones complete (10 min)
   - Ad-hoc: Adjust budgets or status as needed
   - Public dashboard updates automatically

**Improvements:**
- ✅ 50% time reduction (40 hours → 20 hours)
- ✅ No version control issues (single source of truth)
- ✅ Real-time collaboration and feedback
- ✅ Automated data validation
- ✅ Instant budget aggregation
- ✅ Full audit trail

---

### Journey 2: City Manager Prepares for City Council Meeting

**Actor:** City Manager Chris
**Goal:** Present consolidated strategic plan overview to City Council
**Timeline:** Quarterly (4x per year)

#### Current Journey (As-Is)

1. **Week Before Meeting: Data Gathering** (8 hours)
   - Request status updates from all departments via email
   - Receive mix of PDFs, Word docs, Excel sheets
   - Manually extract key data points
   - Build PowerPoint slides with charts

2. **3 Days Before: Analysis** (4 hours)
   - Calculate total budget across all departments (Excel)
   - Count initiatives by priority (NEEDS/WANTS/NICE TO HAVES)
   - Identify at-risk initiatives from status emails
   - Manually update slides

3. **Day Before: Final Prep** (2 hours)
   - Review slides with Assistant City Manager
   - Print copies for Council members
   - Prepare talking points

4. **Council Meeting: Presentation** (30 min)
   - Present static slides
   - Council asks questions ("What's Public Works' total grant funding?")
   - Chris doesn't have answer readily, promises follow-up email
   - Meeting notes taken manually

**Pain Points:**
- ❌ Labor-intensive data gathering
- ❌ Data potentially out-of-date (departments may not have responded)
- ❌ Can't answer ad-hoc questions live
- ❌ Static presentation, no drill-down

---

#### Future Journey (To-Be)

1. **Week Before Meeting: Generate Report** (30 minutes)
   - Log into Stratic Plan dashboard
   - Select "City Council Report - Q2 FY2025"
   - System generates report with live data:
     - Total investment by department
     - Initiatives by priority and status
     - KPI progress summary
     - At-risk initiatives alert
   - Review report, add narrative comments if needed

2. **3 Days Before: Collaborate** (15 minutes)
   - Share report link with Assistant City Manager
   - Review together in real-time
   - Export to PDF for Council packet (optional)

3. **Day Before: Final Prep** (5 minutes)
   - Refresh report to ensure latest data
   - Prepare talking points (data is current)

4. **Council Meeting: Presentation** (30 min)
   - Present live dashboard (or export)
   - Council asks question: "What's Public Works' grant funding?"
   - Chris filters dashboard: Department=Public Works, Funding Source=Grants
   - Answer instantly: "$2.3M across 5 initiatives"
   - Council members can access read-only dashboard on their tablets

**Improvements:**
- ✅ 90% time reduction (14 hours → 1 hour)
- ✅ Always current data (real-time)
- ✅ Can answer questions live
- ✅ Interactive exploration vs. static slides

---

### Journey 3: Finance Director Validates Initiative Budgets

**Actor:** Finance Director Fran
**Goal:** Ensure all initiative budgets are accurate and fundable
**Timeline:** During plan creation (August-September)

#### Current Journey (As-Is)

1. **Receive Budget Data** (Ongoing, 2 weeks)
   - Departments email Word docs with budget tables
   - Budget tables have inconsistent formats
   - Extract data to Excel for validation
   - Check math (totals, funding sources)

2. **Validate Funding Sources** (1 week)
   - Cross-reference grants with grants database
   - Confirm General Fund capacity
   - Identify funding gaps
   - Create correction notes in Excel

3. **Provide Feedback** (1 week)
   - Email departments with correction requests
   - Wait for updated documents
   - Re-validate (repeat cycle)

4. **Consolidate Budgets** (3 days)
   - Manually sum budgets across all departments
   - Create budget summary spreadsheet
   - Generate charts for City Manager

**Pain Points:**
- ❌ Inconsistent data formats
- ❌ Manual data entry and extraction
- ❌ Slow feedback loops
- ❌ Errors in budget math

---

#### Future Journey (To-Be)

1. **Real-Time Budget Review** (Concurrent with plan creation)
   - Finance has read access to all department plans as they're created
   - Dashboard shows: All initiatives with budget data
   - Filter by: Funding status "Pending" or "Requested"
   - Drill into any initiative for detailed breakdown

2. **Inline Validation** (Ongoing)
   - System auto-validates budget math (sum of categories = total)
   - Fran adds comments directly on initiative budgets
   - Department notified instantly
   - Corrections made inline, Fran sees immediately

3. **Funding Source Tracking** (Automated)
   - Dashboard shows total by funding source:
     - General Fund: $12.3M (80% of capacity)
     - Grants (secured): $3.2M
     - Grants (pending): $5.1M
     - Bonds: $8.0M
   - Identify over-committed sources instantly

4. **Consolidated Reporting** (5 minutes)
   - Export consolidated budget report (auto-generated)
   - Charts and tables up-to-date automatically
   - Share with City Manager via system link

**Improvements:**
- ✅ 80% time reduction (4 weeks → 1 week)
- ✅ No data entry (direct database access)
- ✅ Real-time validation and feedback
- ✅ Automated consolidation

---

## Product Scope

### In Scope for MVP

**Core Strategic Planning Features:**
- ✅ Create/edit/delete strategic plans (3-year cycle)
- ✅ Define strategic goals (3-5 per plan) with objectives
- ✅ Create initiatives with full detail (NEEDS/WANTS/NICE TO HAVES)
- ✅ SWOT analysis, environmental scan, benchmarking (JSONB forms)
- ✅ Initiative dependencies (track blocking relationships)
- ✅ Cross-departmental collaboration (multi-department initiatives)

**Budget & Financial Tracking:**
- ✅ Initiative budgets with category breakdown
- ✅ Multiple funding sources per initiative
- ✅ Funding status tracking (secured, pending, requested)
- ✅ Year 1/2/3 budget allocation
- ✅ Consolidated budget dashboards
- ✅ Budget aggregation by department, fiscal year, funding source

**Performance Metrics:**
- ✅ Define KPIs at initiative, goal, or plan level
- ✅ Set baseline and Year 1/2/3 targets
- ✅ Track actual values over time
- ✅ KPI progress dashboards

**Workflow & Collaboration:**
- ✅ Plan status workflow (draft → under_review → approved → active)
- ✅ Threaded comments on plans, goals, initiatives
- ✅ User roles and permissions (RLS)
- ✅ Review and approval process

**Reporting & Dashboards:**
- ✅ Department-level dashboards (my plan, my initiatives)
- ✅ City Manager dashboard (all departments, budget overview)
- ✅ Initiative status tracking (not_started, in_progress, at_risk, completed)
- ✅ Export plans to PDF (for Council packets)

**User Management:**
- ✅ Supabase authentication
- ✅ Role-based access (admin, director, staff, city_manager, finance, council, public)
- ✅ Department assignment
- ✅ User profiles

---

### In Scope for Post-MVP (Phase 2)

**Quarterly Milestones:**
- ⚠️ Create quarterly milestones per initiative
- ⚠️ Track milestone status (not_started, in_progress, completed, delayed)
- ⚠️ Milestone dashboard with alerts for delayed items
- ⚠️ Budget impact per quarter

**Enhanced Collaboration:**
- ⚠️ Real-time editing (Supabase Realtime)
- ⚠️ Presence indicators (who's viewing/editing)
- ⚠️ Notification system (email/in-app)
- ⚠️ @mentions in comments
- ⚠️ Comment resolution workflow

**AI-Powered Features:**
- ⚠️ Document embeddings (pgvector)
- ⚠️ Semantic search ("Find all infrastructure initiatives")
- ⚠️ Q&A over plans ("What's our total IT investment?")
- ⚠️ Comparative analysis ("Compare my budget to Parks & Rec")
- ⚠️ Best practice recommendations

**Public Portal:**
- ⚠️ Public-facing dashboard (published plans only)
- ⚠️ Search and filter published initiatives
- ⚠️ KPI progress visualization for citizens
- ⚠️ (Optional) Public comment period

**Advanced Analytics:**
- ⚠️ Year-over-year comparison
- ⚠️ Initiative success rate tracking
- ⚠️ Predictive analytics (at-risk initiative detection)
- ⚠️ Funding scenario planning (what-if analysis)

---

### Out of Scope

**Not Planned (Ever or Distant Future):**
- ❌ Integration with external financial systems (ERP, accounting)
- ❌ Grant application management (separate product)
- ❌ Project management features (Gantt charts, resource allocation)
- ❌ Document management system (file storage, version control for attachments)
- ❌ Performance review / HR integration
- ❌ GIS integration for geographic initiatives
- ❌ Mobile app (responsive web only)
- ❌ Offline mode
- ❌ Multi-language support (English only for MVP)

---

## Feature Requirements

*Detailed feature specifications will be sharded into separate documents in `docs/prd/` directory for maintainability.*

### FR-001: Strategic Plan Management

**Priority:** P0 (Critical - MVP)

**Description:** Departments can create, edit, view, and manage 3-year strategic plans.

**User Stories:**
- As a Department Director, I want to create a new strategic plan for my department so that I can document our priorities for the next 3 years.
- As a Department Director, I want to edit my draft strategic plan so that I can refine it before submitting for review.
- As a City Manager, I want to view all department strategic plans so that I can understand city-wide priorities.

**Acceptance Criteria:**
- [ ] User can create a new strategic plan via "Create Plan" button
- [ ] System pre-fills department info, fiscal years from previous plan
- [ ] User can edit plan metadata: title, vision, executive summary
- [ ] User can complete SWOT analysis via structured form (4 sections)
- [ ] User can complete environmental scan (demographics, economic, regulatory, tech, community)
- [ ] User can input benchmarking data (peer cities, metrics)
- [ ] System auto-calculates total investment from initiatives
- [ ] User can change plan status: draft → under_review
- [ ] System validates required fields before status change
- [ ] User can view plan in read-only mode
- [ ] User can export plan to PDF
- [ ] System tracks created_by, created_at, updated_at
- [ ] RLS: Users can only see/edit plans from their municipality
- [ ] RLS: Department users can only edit their own department's plans

**Dependencies:**
- Department and fiscal year data must exist
- User authentication and role assignment

**Technical Notes:**
- Use JSONB for swot_analysis, environmental_scan, benchmarking_data
- Implement progressive disclosure (don't show all sections at once)
- Auto-save on field blur or every 30 seconds

---

### FR-002: Strategic Goals

**Priority:** P0 (Critical - MVP)

**Description:** Users can define 3-5 strategic goals per plan with SMART objectives.

**User Stories:**
- As a Department Director, I want to define strategic goals so that I can organize initiatives thematically.
- As a Department Director, I want to align goals with city priorities so that my plan supports the city's overall vision.

**Acceptance Criteria:**
- [ ] User can add goals to a strategic plan (up to 5)
- [ ] User can specify: goal number, title, description
- [ ] User can select city priority alignment (dropdown from city config)
- [ ] User can add multiple SMART objectives (bullet list, JSONB)
- [ ] User can add success measures (bullet list, JSONB)
- [ ] User can reorder goals (drag-and-drop or up/down buttons)
- [ ] User can delete goals (with confirmation)
- [ ] System prevents deleting goals with associated initiatives
- [ ] Goals display in plan overview with initiative count

**Dependencies:**
- Strategic plan must exist
- City strategic priorities configured in system

**Technical Notes:**
- Store objectives and success_measures as JSONB arrays
- Use `goal_number` for ordering (1-5)

---

### FR-003: Initiative Management

**Priority:** P0 (Critical - MVP)

**Description:** Users can create detailed initiatives with financial analysis, expected outcomes, and priority levels.

**User Stories:**
- As a Department Strategic Planner, I want to create initiatives so that I can document specific projects and investments.
- As a Department Director, I want to prioritize initiatives (NEEDS/WANTS/NICE TO HAVES) so that funding decisions are clear.
- As a Finance Director, I want to see initiative budgets so that I can validate funding.

**Acceptance Criteria:**
- [ ] User can add initiative to a strategic goal
- [ ] User can specify: initiative number, name, description, rationale
- [ ] User can select priority level (NEED, WANT, NICE_TO_HAVE)
- [ ] User can rank initiatives within priority tier
- [ ] User can add expected outcomes (list)
- [ ] User can input financial analysis:
  - [ ] Year 1/2/3 budget breakdown (personnel, equipment, services, training, materials, other)
  - [ ] Funding sources (multiple, with amounts and status)
- [ ] User can input ROI analysis:
  - [ ] Financial ROI (savings, revenue, payback, 3-year impact)
  - [ ] Non-financial ROI (service quality, efficiency, risk, satisfaction)
- [ ] User can add cost-benefit analysis (benefits vs. costs)
- [ ] User can specify responsible party (text field)
- [ ] User can change initiative status (not_started, in_progress, at_risk, completed, deferred)
- [ ] System validates: budget math, required fields
- [ ] User can view initiative detail page
- [ ] User can delete initiative (with confirmation)

**Dependencies:**
- Strategic goal must exist
- Fiscal years configured

**Technical Notes:**
- Use JSONB for: expected_outcomes, financial_analysis, roi_analysis, cost_benefit_analysis
- Use numeric fields for: total_year_1_cost, total_year_2_cost, total_year_3_cost (for aggregation)
- Create normalized initiative_budgets records on save for reporting

---

### FR-004: Initiative Budgets

**Priority:** P0 (Critical - MVP)

**Description:** System tracks initiative budgets in normalized table for aggregation and reporting.

**User Stories:**
- As a Finance Director, I want to see total budget by fiscal year so that I can plan funding.
- As a City Manager, I want to see budget by funding source so that I understand our grant dependence.

**Acceptance Criteria:**
- [ ] System creates initiative_budgets records when initiative saved
- [ ] Each budget entry has: initiative, fiscal year, category, amount, funding source, status
- [ ] User can query: Total budget by fiscal year
- [ ] User can query: Total budget by funding source
- [ ] User can query: Budget by category (personnel, equipment, etc.)
- [ ] Dashboard shows budget aggregations with filters

**Dependencies:**
- Initiative financial_analysis data

**Technical Notes:**
- Normalize JSONB financial_analysis into initiative_budgets rows
- Update initiative_budgets on initiative save/update

---

### FR-005: KPI Tracking

**Priority:** P0 (Critical - MVP)

**Description:** Users can define and track KPIs at initiative, goal, or plan level.

**User Stories:**
- As a Department Director, I want to define KPIs so that I can measure success.
- As a Department Planner, I want to update KPI actual values so that I can track progress.
- As a City Manager, I want to see KPI progress so that I can hold departments accountable.

**Acceptance Criteria:**
- [ ] User can add KPI to initiative, goal, or plan
- [ ] User can specify: metric name, measurement frequency, baseline, year 1/2/3 targets
- [ ] User can specify data source and responsible party
- [ ] User can update actual values (date, value pairs in JSONB)
- [ ] System calculates % progress toward target
- [ ] Dashboard displays KPIs with visual indicators (green/yellow/red)
- [ ] User can export KPI data to CSV

**Dependencies:**
- Initiative, goal, or plan must exist

**Technical Notes:**
- Use nullable FKs to allow KPI at any level
- Store actual_values as JSONB: `{"2025-01-15": "85%", "2025-02-15": "87%"}`

---

### FR-006: Dashboard & Reporting

**Priority:** P0 (Critical - MVP)

**Description:** Users can view dashboards tailored to their role with relevant data.

**User Stories:**
- As a Department Director, I want to see my department's plan summary so that I can monitor progress.
- As a City Manager, I want to see city-wide budget overview so that I can make informed decisions.
- As a Finance Director, I want to see funding source breakdown so that I can track grant funding.

**Acceptance Criteria:**
- [ ] Department Dashboard shows:
  - [ ] Plan status and metadata
  - [ ] Initiatives by priority and status (counts and %)
  - [ ] Total budget by fiscal year
  - [ ] KPI progress summary
  - [ ] At-risk initiatives (status = at_risk or delayed milestones)
- [ ] City Manager Dashboard shows:
  - [ ] All departments' plan status
  - [ ] City-wide budget by department
  - [ ] Budget by funding source
  - [ ] Initiative count by priority
  - [ ] At-risk initiatives across all departments
- [ ] Finance Dashboard shows:
  - [ ] Budget by fiscal year
  - [ ] Budget by category
  - [ ] Funding source breakdown (secured vs. pending)
  - [ ] Funding scenario analysis (what-if)
- [ ] All dashboards support filtering and drill-down
- [ ] All dashboards can be exported to PDF

**Dependencies:**
- Strategic plan and initiative data

**Technical Notes:**
- Use Recharts or similar for visualizations
- Implement server-side aggregation queries for performance

---

### FR-007: User Roles & Permissions

**Priority:** P0 (Critical - MVP)

**Description:** System enforces role-based access control via Supabase RLS.

**User Stories:**
- As an Admin, I want to assign roles to users so that permissions are enforced.
- As a Department Director, I want my staff to edit our plan so that we can collaborate.
- As a City Manager, I want to view all plans but not edit them so that I can provide oversight.

**Acceptance Criteria:**
- [ ] System supports roles: admin, department_director, staff, city_manager, finance, council, public
- [ ] Admin can:
  - [ ] Create/edit/delete users
  - [ ] Assign roles and departments
  - [ ] View all data
  - [ ] Delete any record
- [ ] Department Director can:
  - [ ] Create/edit/delete plans for their department
  - [ ] Add staff collaborators from their department
  - [ ] View collaborating departments' initiatives
- [ ] Staff can:
  - [ ] Edit plans for their department (if granted access)
  - [ ] Comment on plans
- [ ] City Manager can:
  - [ ] View all departments' plans
  - [ ] Comment on plans
  - [ ] Approve plans (change status)
- [ ] Finance can:
  - [ ] View all departments' budgets
  - [ ] Comment on budgets
- [ ] Council can:
  - [ ] View approved and active plans
  - [ ] View dashboards (read-only)
- [ ] Public can:
  - [ ] View published (active) plans only
  - [ ] No access to draft or under review plans
- [ ] RLS policies enforce all permissions at database level

**Dependencies:**
- Supabase Auth configured
- User table with role field

**Technical Notes:**
- Implement RLS policies per table
- Use helper functions: auth.user_municipality_id(), auth.user_department_id(), auth.user_role()

---

### FR-008: Comments & Collaboration

**Priority:** P0 (Critical - MVP)

**Description:** Users can add threaded comments to plans, goals, and initiatives for review feedback.

**User Stories:**
- As a City Manager, I want to comment on initiatives so that I can provide feedback to departments.
- As a Department Director, I want to reply to comments so that I can address feedback.
- As a Finance Director, I want to mark comments resolved so that I know issues are addressed.

**Acceptance Criteria:**
- [ ] User can add comment to plan, goal, initiative, or milestone
- [ ] User can reply to comments (threading)
- [ ] User can edit their own comments
- [ ] User can delete their own comments (admin can delete any)
- [ ] User can mark comment as resolved
- [ ] System shows unresolved comment count on entities
- [ ] System notifies participants when new comments added (future: Phase 2)
- [ ] Comments display with author name, timestamp, and content
- [ ] Comments support markdown formatting

**Dependencies:**
- User authentication

**Technical Notes:**
- Use `parent_comment_id` for threading
- Implement rich text editor (e.g., Tiptap, Lexical)

---

### FR-009: Plan Approval Workflow

**Priority:** P0 (Critical - MVP)

**Description:** Strategic plans follow approval workflow with status transitions.

**User Stories:**
- As a Department Director, I want to submit my plan for review so that it can be approved.
- As a City Manager, I want to approve plans so that they become active.
- As a Department Director, I want to track approval status so that I know where my plan stands.

**Acceptance Criteria:**
- [ ] Plan has status field with workflow:
  - [ ] draft → under_review → approved → active → archived
- [ ] Department Director can change status: draft → under_review
- [ ] City Manager can change status: under_review → approved or under_review → draft (request revisions)
- [ ] City Manager can change status: approved → active (after Council approval)
- [ ] Admin can change status to archived (end of planning cycle)
- [ ] System validates required fields before status change from draft
- [ ] System tracks approved_by, approved_at, published_at
- [ ] System creates audit log entry on status change
- [ ] Status changes trigger notifications (future: Phase 2)

**Dependencies:**
- Strategic plan records
- User roles

**Technical Notes:**
- Implement state machine logic in application code
- RLS policies enforce who can change status

---

### FR-010: Audit Trail

**Priority:** P0 (Critical - MVP)

**Description:** System logs all changes to strategic plans, goals, initiatives, and budgets for accountability.

**User Stories:**
- As a City Manager, I want to see who changed a budget so that I can ensure accountability.
- As an Admin, I want to audit plan changes so that I can investigate issues.

**Acceptance Criteria:**
- [ ] System logs insert/update/delete on: strategic_plans, strategic_goals, initiatives, initiative_budgets
- [ ] Audit log captures: table_name, record_id, action, old_values, new_values, changed_by, changed_at, ip_address, user_agent
- [ ] Audit logs are immutable (no edit/delete)
- [ ] Admin can view audit logs via UI
- [ ] Admin can filter audit logs by: table, record, user, date range
- [ ] System exports audit log to CSV

**Dependencies:**
- User authentication

**Technical Notes:**
- Use PostgreSQL triggers to auto-populate audit_logs
- Store old_values and new_values as JSONB

---

### FR-011: PDF Export

**Priority:** P0 (Critical - MVP)

**Description:** Users can export strategic plans to PDF for City Council packets and offline review.

**User Stories:**
- As a Department Director, I want to export my plan to PDF so that I can include it in City Council packets.
- As a City Manager, I want to export consolidated reports to PDF so that I can present to Council.

**Acceptance Criteria:**
- [ ] User can click "Export to PDF" button on plan detail page
- [ ] System generates PDF matching official strategic plan template format
- [ ] PDF includes: all sections, tables, charts, budget data
- [ ] PDF includes cover page with: department, fiscal years, approval date, version
- [ ] PDF includes table of contents with page numbers
- [ ] PDF downloads to user's device
- [ ] PDF generation completes within 30 seconds

**Dependencies:**
- Strategic plan data complete

**Technical Notes:**
- Use react-pdf or Puppeteer for PDF generation
- Consider server-side rendering for complex layouts

---

## MVP Definition

### What is MVP?

The **Minimum Viable Product (MVP)** is the smallest feature set that delivers value to our primary users (Department Directors and City Manager) and validates our core hypothesis:

**Hypothesis:** A digital strategic planning system can reduce plan creation time by 50% while improving data quality and collaboration.

### MVP Success Criteria

MVP is successful when:

1. **Adoption:** 3+ departments create strategic plans in the system (not Word)
2. **Time Savings:** Average plan creation time ≤ 25 hours (vs. 40-50 hours manual)
3. **Data Quality:** 100% of initiatives have validated budget data (Finance approval)
4. **Collaboration:** City Manager provides feedback via comments (not email)
5. **Reporting:** City Manager generates consolidated budget report in <5 minutes

### MVP Feature Set

**MUST HAVE (P0) - Launch Blockers:**

✅ **Strategic Plan Management (FR-001)**
- Create/edit/view strategic plans
- SWOT, environmental scan, benchmarking

✅ **Strategic Goals (FR-002)**
- Define 3-5 goals per plan
- SMART objectives

✅ **Initiative Management (FR-003)**
- Create initiatives with priority (NEEDS/WANTS/NICE_TO_HAVES)
- Financial analysis (budget breakdown, ROI)
- Expected outcomes

✅ **Initiative Budgets (FR-004)**
- Normalized budget tracking
- Aggregation queries

✅ **KPI Tracking (FR-005)**
- Define KPIs with targets
- Update actual values

✅ **Department Dashboard (FR-006)**
- Plan summary, budget overview, initiative status

✅ **City Manager Dashboard (FR-006)**
- All departments, consolidated budget

✅ **User Roles & RLS (FR-007)**
- Department scoping, role-based access

✅ **Comments (FR-008)**
- Threaded comments on plans/initiatives

✅ **Approval Workflow (FR-009)**
- Draft → under_review → approved → active

✅ **Audit Trail (FR-010)**
- All changes logged

✅ **PDF Export (FR-011)**
- Export plan to PDF

---

**SHOULD HAVE (P1) - High Value, Not Blockers:**

⚠️ **Cross-Departmental Initiatives**
- Mark initiatives as collaborative
- Track partner departments

⚠️ **Initiative Dependencies**
- Track blocking dependencies
- Visualize dependency graph

⚠️ **Finance Dashboard**
- Funding source breakdown
- Budget vs. actual

---

**COULD HAVE (P2) - Nice to Have:**

🔵 **Quarterly Milestones**
- Track quarterly progress
- Milestone dashboard

🔵 **Search & Filters**
- Full-text search across plans
- Advanced filtering

---

**WON'T HAVE (Not MVP):**

❌ Real-time collaboration (Supabase Realtime)
❌ AI-powered features (semantic search, Q&A)
❌ Public portal
❌ Email notifications
❌ Mobile optimization (responsive only)
❌ Offline mode

### MVP User Stories (Prioritized)

**Epic 1: Department Creates Strategic Plan (Critical)**
1. As a Department Director, I can create a new strategic plan
2. As a Department Planner, I can add strategic goals
3. As a Department Planner, I can create initiatives with budgets
4. As a Department Planner, I can define KPIs
5. As a Department Director, I can submit plan for review
6. As a Department Director, I can view my department dashboard

**Epic 2: City Manager Reviews Plans (Critical)**
7. As a City Manager, I can view all department plans
8. As a City Manager, I can comment on initiatives
9. As a City Manager, I can approve plans
10. As a City Manager, I can view consolidated budget dashboard
11. As a City Manager, I can export consolidated report to PDF

**Epic 3: Finance Validates Budgets (High)**
12. As a Finance Director, I can view all initiative budgets
13. As a Finance Director, I can comment on budget accuracy
14. As a Finance Director, I can view funding source breakdown

**Epic 4: System Administration (High)**
15. As an Admin, I can create users and assign roles
16. As an Admin, I can configure departments and fiscal years
17. As an Admin, I can view audit logs

---

### MVP Out of Scope

The following are explicitly **NOT** part of MVP:

- Quarterly milestone tracking (Phase 2)
- Real-time collaboration / presence (Phase 2)
- Email notifications (Phase 2)
- AI/RAG features (Phase 2)
- Public portal (Phase 2)
- Mobile app (never)
- GIS integration (never)
- ERP integration (never)

---

## Non-Functional Requirements

### Performance

**Response Time:**
- Page load: <2 seconds (p95)
- Dashboard queries: <3 seconds (p95)
- PDF generation: <30 seconds

**Scalability:**
- Support 50 concurrent users
- Support 20 departments
- Support 500+ initiatives per department

**Database:**
- Query optimization for aggregation queries
- Proper indexing on foreign keys and commonly filtered fields

---

### Security

**Authentication:**
- Supabase Auth with email/password
- Optional: SSO with city's identity provider (future)

**Authorization:**
- Row-level security (RLS) enforced at database level
- Role-based access control (RBAC)

**Data Protection:**
- HTTPS only (TLS 1.2+)
- Passwords hashed with bcrypt
- Sensitive data encrypted at rest (Supabase default)

**Audit & Compliance:**
- Comprehensive audit log (all changes tracked)
- Data retention policy (7 years for government records)

---

### Usability

**Accessibility:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratios meet standards

**Browser Support:**
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- No IE11 support

**Responsive Design:**
- Desktop-first (primary use case)
- Tablet-friendly (iPad, etc.)
- Mobile-readable (not optimized for data entry)

---

### Reliability

**Uptime:**
- 99.5% uptime (target)
- Maintenance windows: Weekends, off-hours

**Backup & Recovery:**
- Daily automated backups (Supabase)
- Point-in-time recovery (7 days)
- Disaster recovery plan documented

**Error Handling:**
- Graceful degradation for failed queries
- User-friendly error messages
- Error logging and monitoring

---

### Maintainability

**Code Quality:**
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Unit tests for critical business logic (>60% coverage target)
- E2E tests for critical user journeys

**Documentation:**
- Inline code comments for complex logic
- README for setup and deployment
- Architecture documentation (ADRs)

**Monitoring:**
- Application logging (errors, warnings)
- Performance monitoring (query times)
- User analytics (page views, feature usage)

---

## Technical Architecture

*(Detailed architecture specifications documented separately in `docs/architecture.md`)*

### Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- TailwindCSS for styling
- Recharts for data visualization
- React Hook Form for form management
- Zod for validation

**Backend:**
- Supabase (PostgreSQL + PostgREST API)
- Supabase Auth
- Supabase Realtime (Phase 2)
- pgvector extension (Phase 2)

**Infrastructure:**
- Vercel (Next.js hosting)
- Supabase Cloud (database, auth, storage)

**Development Tools:**
- Git + GitHub
- Supabase CLI
- VS Code
- Postman / REST Client

---

### Database Schema

*(Full schema documented in `docs/database-schema-overview.md`)*

**Core Tables:**
- municipalities
- departments
- fiscal_years
- users

**Planning Tables:**
- strategic_plans
- strategic_goals
- initiatives
- initiative_budgets
- initiative_kpis
- quarterly_milestones

**Supporting Tables:**
- initiative_dependencies
- initiative_collaborators
- comments
- audit_logs
- document_embeddings (Phase 2)

**Data Model:**
- Hybrid approach: Relational + JSONB
- Row-level security (RLS) enforced
- Comprehensive audit trail

---

### Application Architecture

**Folder Structure:**
```
/app
  /(auth)
    /login
    /signup
  /(dashboard)
    /plans
      /[planId]
        /goals
        /initiatives
    /initiatives
    /budgets
    /kpis
  /api
/components
  /ui (shadcn/ui components)
  /plans
  /initiatives
  /dashboards
/lib
  /supabase (client, types)
  /utils
/types
  /supabase.ts (generated types)
```

**State Management:**
- Server Components for data fetching
- React Context for global state (user, preferences)
- React Query for client-side caching (if needed)

**Forms:**
- React Hook Form + Zod validation
- JSONB fields rendered as dynamic forms

---

## Success Metrics

### Product Metrics (KPIs)

**Adoption:**
- Number of departments using system (Target: 5+ by end of Q2 2025)
- Number of strategic plans created (Target: 5+ by end of Q2 2025)
- Number of active users (Target: 20+ by end of Q2 2025)

**Efficiency:**
- Average time to create strategic plan (Target: <25 hours, 50% reduction)
- Average time to generate consolidated report (Target: <5 minutes, 90% reduction)

**Data Quality:**
- % of initiatives with validated budgets (Target: 100%)
- % of initiatives with KPIs defined (Target: 90%+)

**Engagement:**
- Number of comments per plan (Target: 10+ for plans under review)
- Number of plan revisions before approval (Target: <3)

**User Satisfaction:**
- User satisfaction score (Target: 4.0+/5.0)
- NPS score (Target: 40+)

---

### Business Metrics

**Cost Savings:**
- Staff time saved per planning cycle (Target: 500+ hours)
- Value of staff time saved (Target: $25,000+)

**ROI:**
- Payback period (Target: <2 years)
- 3-year net benefit (Target: $100,000+)

**Transparency:**
- Citizen views of published plans (Target: 1,000+ per quarter)
- City Council paperless approvals (Target: 100%)

---

### Technical Metrics

**Performance:**
- Page load time p95 (Target: <2 seconds)
- Dashboard query time p95 (Target: <3 seconds)
- API response time p95 (Target: <500ms)

**Reliability:**
- Uptime (Target: 99.5%+)
- Error rate (Target: <1%)

**Security:**
- Zero data breaches
- Zero unauthorized access incidents
- 100% audit log coverage

---

## Release Plan

### MVP Release (Target: Q2 2025 - Week 12)

**Week 1-2: Setup & Foundation**
- Project setup (Next.js, Supabase, Vercel)
- Database migrations (run existing migrations)
- Authentication setup
- Basic UI layout (header, nav, dashboard shell)

**Week 3-4: Strategic Plan Management**
- Create/edit strategic plan form
- SWOT, environmental scan, benchmarking forms
- Plan detail view
- Plan list view

**Week 5-6: Goals & Initiatives**
- Strategic goals CRUD
- Initiative creation form (basic)
- Initiative detail view
- Initiative list view

**Week 7-8: Budgets & KPIs**
- Initiative financial analysis form
- Initiative budgets (normalized)
- KPI definition and tracking
- Dashboard: Department budget overview

**Week 9-10: Collaboration & Workflow**
- Comments system
- Plan approval workflow (status changes)
- City Manager dashboard
- Finance dashboard

**Week 11: Polish & Export**
- PDF export
- Audit log viewer (admin)
- Error handling and validation improvements
- Responsive design improvements

**Week 12: Testing & Launch**
- E2E testing
- User acceptance testing (UAT) with Department Directors
- Bug fixes
- Production deployment
- Training materials and documentation

---

### Post-MVP Releases

**Phase 2 (Q3 2025) - Enhanced Collaboration**
- Quarterly milestones
- Email notifications
- Real-time collaboration (Supabase Realtime)
- Initiative dependencies visualization

**Phase 3 (Q4 2025) - AI & Analytics**
- Document embeddings (pgvector)
- Semantic search
- Q&A over plans
- Comparative analysis

**Phase 4 (Q1 2026) - Public Portal**
- Public-facing dashboard
- Citizen comments (optional)
- Advanced analytics (year-over-year, success rates)

---

## Dependencies & Risks

### Dependencies

**External:**
- Supabase Cloud availability
- Vercel deployment platform
- OpenAI API (Phase 3, AI features)

**Internal:**
- City of Carrollton IT approval for cloud hosting
- User acceptance testing with Department Directors
- Training and change management

**Data:**
- Migration of existing strategic plan data (if applicable)
- Department, user, and fiscal year data setup

---

### Risks

**Risk 1: User Adoption**
- **Description:** Departments continue using Word docs instead of system
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Engage Department Directors early in design process
  - Provide training and support during rollout
  - Make system easier to use than Word (auto-save, templates, validation)
  - Executive mandate from City Manager

**Risk 2: Data Quality**
- **Description:** Departments enter incomplete or inaccurate data
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Required field validation
  - Finance review and approval workflow
  - Data quality reports (% complete)
  - In-app guidance and tooltips

**Risk 3: Performance Issues**
- **Description:** Dashboard queries too slow with many initiatives
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:**
  - Optimize database queries (indexes, aggregations)
  - Implement caching for dashboards
  - Load testing with realistic data volumes

**Risk 4: Scope Creep**
- **Description:** Stakeholders request additional features mid-development
- **Likelihood:** High
- **Impact:** Medium
- **Mitigation:**
  - Clear MVP definition and prioritization
  - Change request process with impact analysis
  - Regular stakeholder communication
  - Product Owner (Sarah) enforces scope

**Risk 5: Database Migration Complexity**
- **Description:** Existing strategic plan data difficult to migrate
- **Likelihood:** Low
- **Impact:** Low
- **Mitigation:**
  - Start fresh with new planning cycle (FY2026-2028)
  - Option: Manual data entry from previous plans
  - Option: Import tool for structured data (future enhancement)

---

## Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Strategic Plan** | 3-year planning document outlining department priorities, goals, and initiatives |
| **Initiative** | Specific project or investment within a strategic plan |
| **KPI** | Key Performance Indicator - measurable metric for tracking success |
| **SWOT** | Strengths, Weaknesses, Opportunities, Threats analysis framework |
| **Fiscal Year (FY)** | City's budget year (Oct 1 - Sept 30 for Carrollton) |
| **NEED** | Critical priority initiative (P0) |
| **WANT** | Important priority initiative (P1) |
| **NICE TO HAVE** | Desirable priority initiative (P2) |
| **ROI** | Return on Investment - financial and non-financial benefits |
| **RLS** | Row-Level Security - database access control |
| **MVP** | Minimum Viable Product - smallest feature set for launch |

---

### Appendix B: Referenced Documents

- Database Schema Overview: `docs/database-schema-overview.md`
- Brainstorming Session Results: `docs/brainstorming-session-results.md`
- Strategic Plan Template: `Artifact/Info.md`
- Supabase Migrations: `supabase/migrations/`

---

### Appendix C: Approval & Sign-Off

**PRD Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | Sarah | _____________ | ___/___/___ |
| Technical Lead | TBD | _____________ | ___/___/___ |
| Primary Stakeholder (City) | TBD | _____________ | ___/___/___ |

**Change History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-09 | Sarah (PO) | Initial PRD draft |

---

**END OF PRD (Master Document)**

*This PRD will be sharded into modular sections for easier maintenance and collaboration.*
