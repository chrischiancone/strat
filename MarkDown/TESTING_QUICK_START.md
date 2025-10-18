# Testing Quick Start Guide

**Get your testing process up and running in 30 minutes**

---

## 🚀 Quick Start (5 Steps)

### Step 1: Run Code Quality Checks (5 minutes)

```bash
# Check current state
npm run validate

# This runs:
# - TypeScript type checking
# - ESLint linting
# - Prettier formatting check
```

**Expected Output:** You'll see 57 TypeScript errors (documented in COMPREHENSIVE_TESTING_PLAN.md)

---

### Step 2: Test Database Connection (2 minutes)

```bash
# Check database health
npm run db:health

# Check migration status
npm run db:status

# Check API health
npm run health
```

**Expected Output:** All checks should pass ✅

---

### Step 3: Start Manual Testing - Admin Settings (10 minutes)

**Priority Test: Admin Settings (All 8 Panels)**

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Login as admin at http://localhost:3000/login

3. Navigate to **Admin > Settings**

4. Test each panel:
   - ✅ General Settings - Update timezone, currency, feature flags
   - ✅ Security Settings - Update password policy, session timeout
   - ✅ Notifications - Configure email notifications
   - ✅ **Appearance** - Upload logo, set colors, theme
   - ✅ **Integrations** - Configure Microsoft Teams, Active Directory
   - ✅ **Performance** - Set caching, database optimization
   - ✅ **Backup** - Configure backup schedule, retention
   - ✅ **Maintenance** - Enable maintenance mode, health checks

5. For each panel:
   - Make changes
   - Click "Save Settings"
   - Refresh page
   - Verify settings persisted ✅

---

### Step 4: Test Critical User Flows (10 minutes)

**Epic 4: Admin Functions (P0 - Critical)**

```
□ User Management
  1. Navigate to Admin > Users
  2. Click "Create User"
  3. Fill form with test data
  4. Submit
  5. Verify user created ✅

□ Department Management
  1. Navigate to Admin > Departments
  2. View department list
  3. Verify all departments shown ✅

□ Fiscal Year Management
  1. Navigate to Admin > Fiscal Years
  2. View fiscal year list
  3. Verify current year marked ✅
```

**Epic 1: Plan Creation (P0 - Critical)**

```
□ Create Strategic Plan
  1. Login as Department Director
  2. Click "Create New Plan"
  3. Select fiscal years (2026-2028)
  4. Submit
  5. Verify plan created with status "draft" ✅
```

---

### Step 5: Review Test Results (3 minutes)

Create a test results file:

```bash
# Copy template
cat > TEST_RESULTS_$(date +%Y%m%d).md << 'EOF'
# Test Results - $(date +%Y-%m-%d)

## Code Quality
- [ ] TypeScript errors: 57 (documented)
- [ ] Linting: Pass/Fail
- [ ] Formatting: Pass/Fail

## Database
- [ ] DB Health: Pass/Fail
- [ ] Migrations: Pass/Fail
- [ ] API Health: Pass/Fail

## Manual Testing

### Admin Settings (8 Panels)
- [ ] General Settings: Pass/Fail
- [ ] Security Settings: Pass/Fail
- [ ] Notifications: Pass/Fail
- [ ] Appearance: Pass/Fail
- [ ] Integrations: Pass/Fail
- [ ] Performance: Pass/Fail
- [ ] Backup: Pass/Fail
- [ ] Maintenance: Pass/Fail

### Critical User Flows
- [ ] User creation: Pass/Fail
- [ ] Plan creation: Pass/Fail
- [ ] Login/Logout: Pass/Fail

## Issues Found
1. [Issue description]
2. [Issue description]

## Next Steps
- [ ] Fix critical issues
- [ ] Retest failed scenarios
- [ ] Document any workarounds
EOF
```

---

## 📋 Daily Testing Routine (15 minutes)

### Morning Checklist

```bash
# 1. Pull latest code
git pull

# 2. Run code quality checks
npm run validate

# 3. Check database
npm run db:health

# 4. Start dev server
npm run dev

# 5. Smoke test (open in browser)
# - Login ✅
# - Navigate to dashboard ✅
# - View one plan ✅
# - View admin settings ✅
```

---

## 🔧 Fixing Common Issues

### Issue: TypeScript Errors

**Solution:** Most are documented and non-blocking. To see errors:

```bash
npm run type-check 2>&1 | grep "error TS"
```

To fix gradually:
1. Start with import errors (easiest)
2. Then nullable field issues
3. Then type definition issues
4. Finally complex schema mismatches

### Issue: Database Connection Failed

**Solution:**

```bash
# Check if Supabase is running
curl -I https://your-project.supabase.co

# Or check local database
psql -h localhost -U postgres -d your_db -c "SELECT 1"
```

### Issue: Settings Don't Persist

**Solution:**

1. Check browser console for errors
2. Verify server action succeeded:
   ```javascript
   // Look for success message in Network tab
   // Should see: { success: true }
   ```
3. Check database directly:
   ```sql
   SELECT settings FROM municipalities WHERE slug = 'your-city';
   ```

---

## 📊 Testing Metrics to Track

### Code Quality Metrics

```bash
# TypeScript errors count
npm run type-check 2>&1 | grep "Found" | tail -1

# Linting errors count
npm run lint 2>&1 | grep "problems"

# Lines of code
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
```

### Performance Metrics

- Page load time: < 2 seconds ✅
- API response time: < 500ms ✅
- Database query time: < 100ms ✅

### Testing Coverage Targets

- Unit tests: 70% coverage (future)
- Integration tests: 50% coverage (future)
- E2E tests: All critical paths (future)
- Manual tests: All P0 stories ✅

---

## 🎯 Priority Testing Order

### Week 1: Foundation

1. ✅ Admin Settings (all 8 panels) - **Just completed**
2. ✅ User Management
3. ✅ Department Management
4. ✅ Fiscal Year Management

### Week 2: Core Features

5. ✅ Plan Creation (Epic 1.1-1.3)
6. ✅ Strategic Goals (Epic 1.6)
7. ✅ Initiative Creation (Epic 1.7)
8. ✅ Budget Entry (Epic 1.8)

### Week 3: Reviews & Validation

9. ✅ City Manager Reviews (Epic 2)
10. ✅ Finance Validation (Epic 3)
11. ✅ Comment System
12. ✅ Approval Workflow

### Week 4: Reports & Advanced Features

13. ✅ City Council Reports
14. ✅ Budget Dashboards
15. ✅ KPI Tracking
16. ✅ Audit Logs

---

## 🐛 Bug Report Template (Quick Copy)

```markdown
## Bug Report

**Severity:** P0 / P1 / P2 / P3

**What I Did:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**What I Expected:**
[Expected behavior]

**What Happened:**
[Actual behavior]

**Browser/Environment:**
- Browser: Chrome 120
- OS: macOS
- User role: Admin

**Error Message (if any):**
```
[Paste error]
```

**Screenshot:**
[Attach screenshot]
```

---

## ✅ Pre-Deployment Checklist

```
Before deploying to production:

□ Code Quality
  □ npm run validate passes
  □ Critical TypeScript errors fixed
  □ No console errors in browser

□ Database
  □ All migrations applied
  □ Database backed up
  □ Connection stable

□ Manual Testing
  □ All P0 stories tested
  □ Admin settings (8 panels) work
  □ User/Department/Fiscal Year management works
  □ Plan creation works
  □ No data loss on refresh

□ Security
  □ RLS policies tested
  □ Authentication works
  □ Role-based access enforced
  □ No sensitive data exposed

□ Performance
  □ Page loads < 2 seconds
  □ API responses < 500ms
  □ No memory leaks

□ Rollback Plan
  □ Database backup completed
  □ Deployment script tested
  □ Rollback procedure documented
```

---

## 📚 Additional Resources

### Testing Documentation

- **Full Testing Plan:** `COMPREHENSIVE_TESTING_PLAN.md` (1,668 lines)
- **Epic Docs:** `docs/epics/` directory
- **Story Docs:** `stories/` directory

### Key Commands

```bash
# Code Quality
npm run validate          # Run all checks
npm run type-check       # TypeScript only
npm run lint             # ESLint only
npm run lint:fix         # Auto-fix linting

# Database
npm run db:backup        # Backup database
npm run db:restore       # Restore from backup
npm run db:migrate       # Run migrations
npm run db:health        # Check connection

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production

# Health Check
npm run health           # Check API health
```

### Test Data

**Admin User:**
```
Email: admin@test.com
Password: [Your admin password]
```

**Department Director:**
```
Email: director@test.com
Password: [Your director password]
Department: Water & Field Services
```

---

## 🤝 Getting Help

### Troubleshooting Steps

1. Check `COMPREHENSIVE_TESTING_PLAN.md` for detailed test procedures
2. Review epic/story documentation in `docs/epics/` and `stories/`
3. Check browser console for JavaScript errors
4. Check server logs for API errors
5. Verify database connection with `npm run db:health`

### Common Questions

**Q: How do I fix all TypeScript errors?**
A: You don't need to fix all immediately. Focus on P0 (critical) paths first. See COMPREHENSIVE_TESTING_PLAN.md Section 4.

**Q: Can I skip automated tests?**
A: For now, yes. Focus on manual testing. Add automated tests gradually. See COMPREHENSIVE_TESTING_PLAN.md Section 5.

**Q: How often should I test?**
A: Daily smoke tests (15 min), weekly feature tests (1 hour), full regression before releases (4 hours).

**Q: What if I find a bug?**
A: Use the bug report template above, add to issues list, prioritize by severity (P0-P3).

---

## 🎉 Success Criteria

You've successfully implemented the testing process when:

✅ You can run `npm run validate` without critical errors
✅ All 8 admin settings panels save and load correctly
✅ You can create users, departments, and fiscal years
✅ You can create a strategic plan end-to-end
✅ You have a documented testing routine
✅ You track and resolve bugs systematically

---

**Last Updated:** 2025-10-16  
**Maintained By:** Development Team

For the complete testing plan, see `COMPREHENSIVE_TESTING_PLAN.md`
