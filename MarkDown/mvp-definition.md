# MVP Definition

## What is MVP?

The **Minimum Viable Product (MVP)** is the smallest feature set that delivers value to our primary users (Department Directors and City Manager) and validates our core hypothesis:

**Hypothesis:** A digital strategic planning system can reduce plan creation time by 50% while improving data quality and collaboration.

## MVP Success Criteria

MVP is successful when:

1. **Adoption:** 3+ departments create strategic plans in the system (not Word)
2. **Time Savings:** Average plan creation time ≤ 25 hours (vs. 40-50 hours manual)
3. **Data Quality:** 100% of initiatives have validated budget data (Finance approval)
4. **Collaboration:** City Manager provides feedback via comments (not email)
5. **Reporting:** City Manager generates consolidated budget report in <5 minutes

## MVP Feature Set

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

## MVP User Stories (Prioritized)

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

## MVP Out of Scope

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
