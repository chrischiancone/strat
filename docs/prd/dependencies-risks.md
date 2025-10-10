# Dependencies & Risks

## Dependencies

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

## Risks

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
