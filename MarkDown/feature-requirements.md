# Feature Requirements

*Detailed feature specifications will be sharded into separate documents in `docs/prd/` directory for maintainability.*

## FR-001: Strategic Plan Management

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

## FR-002: Strategic Goals

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

## FR-003: Initiative Management

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

## FR-004: Initiative Budgets

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

## FR-005: KPI Tracking

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

## FR-006: Dashboard & Reporting

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

## FR-007: User Roles & Permissions

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

## FR-008: Comments & Collaboration

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

## FR-009: Plan Approval Workflow

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

## FR-010: Audit Trail

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

## FR-011: PDF Export

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
