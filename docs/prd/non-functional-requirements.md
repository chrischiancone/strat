# Non-Functional Requirements

## Performance

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

## Security

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

## Usability

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

## Reliability

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

## Maintainability

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
