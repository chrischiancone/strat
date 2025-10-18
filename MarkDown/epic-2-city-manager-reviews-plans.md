# Epic 2: City Manager Reviews Plans

**Epic ID:** EPIC-002
**Priority:** P0 (Critical - MVP Launch Blocker)
**Status:** Not Started
**Owner:** Product Owner (Sarah)
**Target Release:** MVP (Week 7-10)

---

## Epic Goal

Enable City Manager to review all department strategic plans, provide feedback via comments, approve plans, and generate consolidated reports for City Council presentations - reducing report preparation time from 14 hours to <1 hour.

---

## Business Value

**Problem Solved:**
- City Manager must manually read through 10+ lengthy Word documents
- Feedback provided via email or PDF annotations (slow, asynchronous)
- Creating consolidated budget reports requires manual Excel work
- Can't easily compare initiatives across departments
- No real-time visibility into plan status

**Expected Outcomes:**
- 90% time reduction in City Council report preparation
- Real-time feedback loops (hours vs. days)
- Consolidated city-wide budget view
- Ability to answer ad-hoc questions instantly

**Success Metrics:**
- City Manager uses system to review 100% of department plans
- Avg time to generate consolidated report < 5 minutes
- 100% of feedback provided via inline comments (not email)
- City Council reports generated from live data (not recreated in PowerPoint)

---

## Epic Description

This epic enables the City Manager to perform oversight and governance functions across all departments' strategic plans. The system provides consolidated dashboards, comparison tools, commenting capabilities, and approval workflows.

**Key Capabilities:**

1. **View All Department Plans**
   - Dashboard listing all departments' plans with status
   - Filter by: Status, Fiscal Year, Department
   - Quick summary cards (budget, initiative count, status)

2. **Plan Review**
   - Read-only access to any department's plan
   - Drill down into goals, initiatives, budgets, KPIs
   - Side-by-side comparison of departments (future enhancement)

3. **Inline Commenting**
   - Add comments on plans, goals, or initiatives
   - Thread conversations
   - Mark comments resolved
   - View unresolved comment count

4. **Approval Workflow**
   - Change plan status: under_review → approved or → draft (request revisions)
   - Track approval history (who, when)
   - Optional: Approval notes/conditions

5. **City-Wide Dashboards**
   - All departments' plan summary
   - Consolidated budget by department
   - Budget by funding source (city-wide)
   - Budget by fiscal year
   - Initiatives by priority (all departments)
   - At-risk initiatives alert

6. **Report Generation**
   - Generate consolidated City Council report (PDF)
   - Custom date range and filters
   - Export to Excel (budget data)

---

## User Personas

**Primary User:**
- **City Manager Chris** (Reviewer, approver, oversight)

**Secondary Users:**
- **Assistant City Manager** (Supports review process)
- **City Council Members** (Future: read-only dashboards)

---

## User Journey

### As-Is (Manual Process - 14 hours quarterly)
1. Email all departments requesting status updates (1 hour)
2. Receive mix of PDFs, Word docs, Excel sheets (wait 3-5 days)
3. Manually extract key data, build Excel summary (4 hours)
4. Create PowerPoint slides with charts (4 hours)
5. Review and revise slides (2 hours)
6. Print copies for Council, prepare talking points (1 hour)
7. Council meeting: Can't answer ad-hoc questions, promise follow-ups (2 hours post-meeting)

### To-Be (Digital System - 1 hour quarterly)
1. Log in, select "City Council Report - Q2 FY2025" (2 minutes)
2. System generates report with live data (1 minute)
3. Review report, add narrative if needed (20 minutes)
4. Share link with Assistant City Manager for review (5 minutes)
5. Export to PDF for Council packet (2 minutes)
6. Council meeting: Live dashboard, answer questions instantly (30 minutes, no follow-ups)

---

## Stories

### Story 2.1: View All Department Plans Dashboard
**As a** City Manager
**I want to** see a dashboard of all department strategic plans
**So that** I can quickly understand the status of city-wide strategic planning

**Acceptance Criteria:**
- Dashboard displays table/cards of all departments' plans
- Each entry shows: Department name, Plan title, Status, Fiscal years, Total budget, Initiative count
- User can filter by: Status, Fiscal Year, Department
- User can sort by: Department, Budget, Status, Last updated
- User can click a plan to drill into detail view
- Dashboard shows summary stats at top: Total plans, Plans by status, Total city-wide budget

**Story Points:** 8
**Priority:** P0
**Dependencies:** Epic 1 (plans exist)

---

### Story 2.2: View Department Plan Detail (Read-Only)
**As a** City Manager
**I want to** view a department's strategic plan in detail
**So that** I can review their goals, initiatives, and budgets

**Acceptance Criteria:**
- City Manager can navigate to any department's plan
- Plan displays all sections: Overview, SWOT, Goals, Initiatives, Budgets, KPIs
- View is read-only (City Manager cannot edit plan content)
- Navigation allows jumping to specific sections (goals, initiatives)
- Breadcrumb navigation shows: Dashboard > Department > Plan

**Story Points:** 5
**Priority:** P0
**Dependencies:** Epic 1, Story 2.1

---

### Story 2.3: Add Comments on Plan/Initiative
**As a** City Manager
**I want to** add comments on strategic plans and initiatives
**So that** I can provide feedback to departments

**Acceptance Criteria:**
- User can click "Add Comment" button on: Plans, Goals, Initiatives
- User can enter comment text (rich text editor with markdown support)
- User can submit comment
- Comment displays with: Author name, Avatar, Timestamp, Content
- Comment author can edit/delete their own comments
- System notifies plan owner of new comment (future: Phase 2)

**Story Points:** 8
**Priority:** P0
**Dependencies:** Story 2.2

---

### Story 2.4: Reply to Comments (Threading)
**As a** City Manager or Department Director
**I want to** reply to comments
**So that** I can have a conversation about feedback

**Acceptance Criteria:**
- User can click "Reply" on any comment
- Reply appears indented under parent comment
- Threading supports up to 3 levels
- Reply notifications sent to parent comment author (future: Phase 2)

**Story Points:** 5
**Priority:** P0
**Dependencies:** Story 2.3

---

### Story 2.5: Mark Comments Resolved
**As a** Department Director
**I want to** mark comments as resolved
**So that** I can indicate I've addressed the feedback

**Acceptance Criteria:**
- User can click "Resolve" button on comments they created or own the entity
- Resolved comments show checkmark icon and "Resolved" badge
- Resolved comments collapse by default (can expand to view)
- Unresolved comment count displays on plans/initiatives
- City Manager can see which comments are resolved vs. open

**Story Points:** 5
**Priority:** P1
**Dependencies:** Story 2.3

---

### Story 2.6: Approve/Reject Plans
**As a** City Manager
**I want to** approve or request revisions to strategic plans
**So that** I can control which plans move forward to City Council

**Acceptance Criteria:**
- City Manager can change plan status from "under_review" to "approved"
- City Manager can change plan status from "under_review" to "draft" (request revisions)
- System captures: approved_by (user ID), approved_at (timestamp)
- System shows approval history (audit log)
- Department is notified of status change (future: Phase 2)
- Only City Manager role can approve plans (RLS enforced)

**Story Points:** 5
**Priority:** P0
**Dependencies:** Epic 1, Story 2.2

---

### Story 2.7: City-Wide Budget Dashboard
**As a** City Manager
**I want to** see consolidated budget data across all departments
**So that** I can understand total city-wide investment and funding sources

**Acceptance Criteria:**
- Dashboard displays:
  - Total budget by fiscal year (bar chart)
  - Total budget by department (horizontal bar chart or table)
  - Budget by funding source (pie chart): General Fund, Grants, Bonds, Fees
  - Budget by category (pie chart): Personnel, Equipment, Services, etc.
- User can filter by: Fiscal Year, Department, Priority (NEEDS/WANTS/NICE_TO_HAVES)
- Dashboard updates dynamically based on filters
- User can drill down into individual initiatives from charts

**Story Points:** 13
**Priority:** P0
**Dependencies:** Epic 1 (initiative budgets exist), Story 2.1

---

### Story 2.8: City-Wide Initiative Summary
**As a** City Manager
**I want to** see all initiatives across departments
**So that** I can identify patterns, duplications, or at-risk initiatives

**Acceptance Criteria:**
- Dashboard displays:
  - Total initiative count by priority (NEEDS, WANTS, NICE_TO_HAVES)
  - Initiative count by status (not_started, in_progress, at_risk, completed, deferred)
  - Top 10 highest budget initiatives (table)
  - At-risk initiatives alert (red banner if any exist)
- User can click "View All Initiatives" to see paginated table
- Table supports: Search, Filter (department, priority, status), Sort

**Story Points:** 13
**Priority:** P0
**Dependencies:** Epic 1, Story 2.1

---

### Story 2.9: Generate City Council Report (PDF)
**As a** City Manager
**I want to** generate a consolidated City Council report
**So that** I can present strategic plans to City Council

**Acceptance Criteria:**
- User clicks "Generate Council Report" button from dashboard
- System prompts for: Report title, Fiscal year(s), Optional filters (departments, priorities)
- System generates PDF with:
  - Cover page (title, date, City Manager name)
  - Executive summary (auto-generated from data)
  - Budget summary (charts and tables)
  - Department highlights (top initiatives per department)
  - At-risk initiatives section
  - Appendix (detailed initiative list)
- PDF downloads to user's device
- PDF generation completes within 30 seconds
- Optional: Save report configuration for future use

**Story Points:** 21
**Priority:** P0
**Dependencies:** Story 2.7, Story 2.8

---

### Story 2.10: Export Budget Data to Excel
**As a** City Manager or Finance Director
**I want to** export budget data to Excel
**So that** I can perform additional analysis or share with stakeholders

**Acceptance Criteria:**
- User clicks "Export to Excel" button from budget dashboard
- System generates Excel file with tabs:
  - Budget by Department
  - Budget by Funding Source
  - Budget by Category
  - Budget by Fiscal Year
  - Initiative Detail (all initiatives with budgets)
- Excel file downloads to user's device
- Format is clean and ready for analysis (no raw data dumps)

**Story Points:** 8
**Priority:** P1
**Dependencies:** Story 2.7

---

## Feature Requirements References

- FR-006: Dashboard & Reporting (City Manager Dashboard)
- FR-007: User Roles & Permissions (City Manager role)
- FR-008: Comments & Collaboration
- FR-009: Plan Approval Workflow
- FR-011: PDF Export

---

## Technical Considerations

**Authorization:**
- City Manager role must have read access to all departments (RLS policies)
- City Manager can comment but not edit plan content
- Only City Manager can change plan status to "approved"

**Performance:**
- City-wide dashboard aggregations may be expensive
- Consider caching or materialized views
- Budget queries need proper indexes

**PDF Generation:**
- Use react-pdf or Puppeteer
- Consider server-side rendering for complex layouts
- 30-second timeout for generation

**Data Aggregation:**
- Complex SQL queries for city-wide summaries
- Test with realistic data volumes (10 departments, 500 initiatives)

---

## Definition of Done

**Epic is complete when:**

- [ ] All 10 stories completed with acceptance criteria met
- [ ] City Manager can view all department plans
- [ ] City Manager can comment on plans/initiatives
- [ ] City Manager can approve plans
- [ ] City Manager can view city-wide budget and initiative dashboards
- [ ] City Manager can generate City Council report (PDF)
- [ ] City Manager can export budget data to Excel
- [ ] RLS policies enforce City Manager permissions correctly
- [ ] Dashboard queries perform well (<3 seconds)
- [ ] PDF generation works reliably
- [ ] Unit and integration tests complete
- [ ] Accepted by Product Owner in UAT

---

## Dependencies & Risks

**Dependencies:**
- Epic 1 complete (strategic plans and initiatives exist)
- RLS policies configured for City Manager role
- PDF generation library setup

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Dashboard queries too slow | Medium | High | Optimize queries, add indexes, implement caching |
| PDF generation unreliable | Medium | Medium | Extensive testing, fallback to export Excel first |
| City Manager overwhelmed by too much data | Low | Medium | Focus on summary views first, drill-down on demand |

---

## Notes

- This epic is critical for City Manager buy-in - without good dashboards, they won't use the system
- Prioritize Stories 2.1, 2.2, 2.6, 2.7, 2.8 first (viewing, approving, dashboards)
- Comments (2.3, 2.4, 2.5) are important for collaboration but can be  simplified for MVP
- PDF generation (2.9) is critical for City Council - don't cut this
- Excel export (2.10) is lower priority - can be Phase 2 if needed

---

**Epic Created:** January 9, 2025
**Last Updated:** January 9, 2025
