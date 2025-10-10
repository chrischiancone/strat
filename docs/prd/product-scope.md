# Product Scope

## In Scope for MVP

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

## In Scope for Post-MVP (Phase 2)

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

## Out of Scope

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
