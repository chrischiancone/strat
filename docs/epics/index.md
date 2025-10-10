# Strategic Planning System - Epics

## MVP Epics (Target Release: Q2 2025)

This document provides an index of all epics for the Strategic Planning System MVP. Epics are organized by priority and sequencing.

---

## Epic Overview

| Epic ID | Epic Name | Priority | Stories | Story Points | Status | Dependencies |
|---------|-----------|----------|---------|--------------|--------|--------------|
| [EPIC-001](./epic-1-department-creates-strategic-plan.md) | Department Creates Strategic Plan | P0 (Critical) | 11 | 89 | Not Started | Database, Auth |
| [EPIC-002](./epic-2-city-manager-reviews-plans.md) | City Manager Reviews Plans | P0 (Critical) | 10 | 96 | Not Started | EPIC-001 |
| [EPIC-003](./epic-3-finance-validates-budgets.md) | Finance Validates Budgets | P0 (High) | 8 | 64 | Not Started | EPIC-001, EPIC-002 (comments) |
| [EPIC-004](./epic-4-system-administration.md) | System Administration | P0 (High) | 12 | 88 | Not Started | None |
| **TOTAL** | | | **41** | **337** | | |

---

## Epic Sequencing & Timeline

### Phase 1: Foundation (Weeks 1-2)
**Focus:** Set up infrastructure and admin capabilities

**Epics:**
- **EPIC-004: System Administration** (Stories 4.1-4.9)
  - User management
  - Department configuration
  - Fiscal year setup

**Goal:** System configured and ready for departments to create plans

---

### Phase 2: Core Plan Creation (Weeks 3-6)
**Focus:** Enable departments to create strategic plans

**Epics:**
- **EPIC-001: Department Creates Strategic Plan** (All stories)
  - Plan metadata and overview
  - SWOT, goals, initiatives
  - Financial analysis and KPIs
  - Department dashboard

**Goal:** Department Directors can create complete strategic plans

---

### Phase 3: Review & Oversight (Weeks 7-10)
**Focus:** Enable City Manager and Finance to review and approve plans

**Epics:**
- **EPIC-002: City Manager Reviews Plans** (All stories)
  - View all plans
  - Comment and approve
  - City-wide dashboards
  - PDF report generation

- **EPIC-003: Finance Validates Budgets** (All stories)
  - Budget validation
  - Funding source tracking
  - Finance dashboards

- **EPIC-004: System Administration** (Stories 4.11-4.12)
  - Audit log viewer
  - Admin dashboard

**Goal:** City Manager and Finance can review, validate, and approve plans

---

### Phase 4: Polish & Launch (Weeks 11-12)
**Focus:** Testing, bug fixes, documentation, deployment

**Activities:**
- E2E testing of complete workflows
- User acceptance testing (UAT) with Department Directors
- Bug fixes and performance optimization
- User documentation and training materials
- Production deployment
- Launch announcement

**Goal:** System ready for production use

---

## Epic Summaries

### EPIC-001: Department Creates Strategic Plan
**Value Proposition:** Reduce plan creation time from 40-50 hours to <25 hours

**Key Features:**
- Create 3-year strategic plans with structured templates
- SWOT analysis, environmental scan, benchmarking
- Define strategic goals (3-5) with SMART objectives
- Create initiatives with priority (NEEDS/WANTS/NICE TO HAVES)
- Detailed financial analysis (budget breakdown, ROI, cost-benefit)
- Define and track KPIs
- Department dashboard

**Success Metrics:**
- 3+ departments create plans in system
- Average creation time ≤ 25 hours
- User satisfaction ≥ 4.0/5.0

**Story Highlights:**
- Story 1.7-1.9: Initiative creation with financial analysis (34 points) - Most complex
- Story 1.11: Department dashboard (13 points) - High value, visible impact

---

### EPIC-002: City Manager Reviews Plans
**Value Proposition:** Reduce City Council report preparation from 14 hours to <1 hour

**Key Features:**
- View all department plans in one dashboard
- Inline commenting for feedback
- Approval workflow (draft → under_review → approved)
- City-wide budget and initiative dashboards
- Generate City Council reports (PDF)
- Export budget data to Excel

**Success Metrics:**
- 100% of reviews done in system (not email)
- Report generation < 5 minutes
- City Council presents from live dashboard

**Story Highlights:**
- Story 2.7: City-wide budget dashboard (13 points) - Critical for oversight
- Story 2.9: PDF report generation (21 points) - Most complex, critical for Council

---

### EPIC-003: Finance Validates Budgets
**Value Proposition:** Reduce budget validation from 4 weeks to 1 week

**Key Features:**
- View all initiative budgets across departments
- Inline budget comments and validation
- Funding source tracking (General Fund, Grants, Bonds, Fees)
- Grant-funded initiatives dashboard
- Budget category analysis
- Export to Excel

**Success Metrics:**
- 100% of budgets validated in system
- Validation time ≤ 1 week
- Zero budget math errors

**Story Highlights:**
- Story 3.1: All budgets dashboard (13 points) - Foundation for everything else
- Story 3.4: Funding source tracking (13 points) - High value for Finance

---

### EPIC-004: System Administration
**Value Proposition:** Enable self-service administration and ensure accountability

**Key Features:**
- User management (create, edit, deactivate)
- Role assignment (admin, director, staff, city_manager, finance, council, public)
- Department configuration
- Fiscal year setup
- Audit log viewer
- Admin dashboard

**Success Metrics:**
- 100% of users onboarded via UI (not database)
- Zero unauthorized access
- 100% of changes captured in audit log

**Story Highlights:**
- Story 4.2: Create user with invitation flow (13 points) - Most complex, critical
- Story 4.11: Audit log viewer (13 points) - Government accountability requirement

---

## Dependencies & Critical Path

### Critical Path (Blocking Dependencies):
1. **Database Setup** → EPIC-004 → EPIC-001
2. **EPIC-001** → EPIC-002, EPIC-003 (need plans/budgets to review)
3. **Comment System** (EPIC-002 Story 2.3) → EPIC-003 Story 3.3 (reuse comments)

### Parallel Work Opportunities:
- **EPIC-001** and **EPIC-004** can be developed in parallel (different teams/devs)
- **EPIC-002** and **EPIC-003** can be developed in parallel after EPIC-001 Stories 1.7-1.8 complete

---

## Story Point Summary

### By Epic:
- EPIC-001: 89 points (11 stories, avg 8 points/story)
- EPIC-002: 96 points (10 stories, avg 9.6 points/story)
- EPIC-003: 64 points (8 stories, avg 8 points/story)
- EPIC-004: 88 points (12 stories, avg 7.3 points/story)

### Total: 337 story points

### Velocity Assumptions:
- Team of 2 developers
- Velocity: ~20 points/week
- Timeline: 337 points / 20 points/week = **17 weeks** (raw dev time)
- With buffer, testing, UAT: **20 weeks = 5 months**

### MVP Target:
- 12 weeks (aggressive)
- Requires velocity of ~28 points/week
- Or: Cut scope (defer P1/P2 stories)

---

## Recommendations

### Must-Have Stories (MVP Launch Blockers):
- EPIC-001: Stories 1.1-1.9, 1.11 (skip 1.10 KPIs temporarily if needed)
- EPIC-002: Stories 2.1-2.6, 2.7, 2.9 (defer 2.8 dashboard, 2.10 Excel if needed)
- EPIC-003: Stories 3.1-3.4 (defer 3.5-3.8 if needed)
- EPIC-004: Stories 4.1-4.9, 4.11 (defer 4.10, 4.12 if needed)

**Reduced Scope:** ~240 story points = 12 weeks @ 20 points/week

### Should-Have Stories (Post-MVP):
- EPIC-001: Story 1.10 (Initiative KPIs)
- EPIC-002: Stories 2.8 (Initiative summary), 2.10 (Excel export)
- EPIC-003: Stories 3.5-3.8 (Grant tracking, category analysis, validation workflow, Excel export)
- EPIC-004: Stories 4.10 (Municipality config), 4.12 (Admin dashboard)

### Nice-to-Have Stories (Phase 2):
- Any stories marked P2 in individual epics
- Real-time collaboration features
- AI/RAG capabilities
- Public portal

---

## Next Steps

1. **Review epics with stakeholders** - Validate scope and priorities
2. **Refine story point estimates** - Conduct planning poker with dev team
3. **Create sprint plan** - Organize stories into 2-week sprints
4. **Begin development** - Start with EPIC-004 Stories 4.1-4.4 (user management)

---

**Document Created:** January 9, 2025
**Last Updated:** January 9, 2025
**Status:** Ready for Development
