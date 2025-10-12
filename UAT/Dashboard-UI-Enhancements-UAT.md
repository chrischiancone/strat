# Dashboard & UI Enhancements - UAT Test Script

**Feature Description:** Enterprise-grade Dashboard, Theme System, and UI Component Library

**Test Date:** _________________
**Tester Name:** _________________
**Tester Role:** _________________
**Environment:** Production / Staging / Development (circle one)

---

## Pre-Test Setup

**Required User Roles:**
- [ ] Admin account
- [ ] Finance Manager account
- [ ] City Manager account
- [ ] Department Head account
- [ ] Regular Staff account

**Test Data Requirements:**
- [ ] User with recent activity (plans, initiatives)
- [ ] User with no activity (new user)
- [ ] Multiple departments with active plans

---

## Phase 1: Theme & Design System

### Test Case THEME-1: Color Palette Consistency
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Review header/navigation | Uses blue-gray primary color (#627d98) | | ☐ |
| 2 | Review buttons | Primary buttons use blue-gray, success uses civic green | | ☐ |
| 3 | Review badges | Consistent color coding (blue=info, green=success, etc.) | | ☐ |
| 4 | Check links | All links use primary blue color | | ☐ |
| 5 | Review gradients | Header uses professional gradient | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case THEME-2: Typography Consistency
**Priority:** Medium
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Check font family | All text uses Inter font | | ☐ |
| 2 | Review headings | H1-H3 use consistent sizing and weights | | ☐ |
| 3 | Check body text | Readable size (14px-16px) | | ☐ |
| 4 | Verify font weights | Proper hierarchy (bold for headers, normal for body) | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case THEME-3: Navigation Enhancements
**Priority:** High
**User Role:** Various

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View sidebar navigation | Shows icons next to all menu items | | ☐ |
| 2 | Check navigation grouping | Items grouped by section (Main, Finance, Admin) | | ☐ |
| 3 | Verify active state | Current page highlighted in sidebar | | ☐ |
| 4 | Test hover states | Menu items show hover effect | | ☐ |
| 5 | Check role-based visibility | Finance items hidden for non-finance users | | ☐ |
| 6 | Verify admin section | Only visible to admin/city manager | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case THEME-4: Header Enhancements
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View header | Shows "SP" logo on left | | ☐ |
| 2 | Check user profile | Shows user avatar/initials on right | | ☐ |
| 3 | Click user profile | Dropdown menu appears | | ☐ |
| 4 | Verify dropdown items | Shows Profile, Settings, Sign out | | ☐ |
| 5 | Test sign out | Successfully logs out user | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case THEME-5: Breadcrumbs
**Priority:** Medium
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Navigate to initiative details | Breadcrumbs show: Dashboard > Plans > [Plan] > [Initiative] | | ☐ |
| 2 | Click breadcrumb link | Navigates to that page | | ☐ |
| 3 | Check breadcrumb styling | Separated by ">" or "/" | | ☐ |

**Notes:** _______________________________________________________________

---

## Phase 2: Component Library

### Test Case COMP-1: Button Component
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Find default button | Blue-gray background, white text | | ☐ |
| 2 | Hover over button | Shows darker shade | | ☐ |
| 3 | Find success button | Civic green background | | ☐ |
| 4 | Find destructive button | Red background | | ☐ |
| 5 | Find outline button | White background, border | | ☐ |
| 6 | Find ghost button | Transparent, shows background on hover | | ☐ |
| 7 | Check disabled state | Grayed out, no hover effect | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case COMP-2: Badge Components
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Find StatusBadge | Shows initiative status with correct color | | ☐ |
| 2 | Verify IN_PROGRESS badge | Blue color with "In Progress" label | | ☐ |
| 3 | Verify COMPLETED badge | Green color with "Completed" label | | ☐ |
| 4 | Find PriorityBadge | Shows priority with correct color | | ☐ |
| 5 | Verify NEED badge | Red color with "Need (Critical)" label | | ☐ |
| 6 | Verify WANT badge | Amber color with "Want (Important)" label | | ☐ |
| 7 | Verify NICE_TO_HAVE badge | Green color with "Nice to Have" label | | ☐ |
| 8 | Find FundingStatusBadge | Shows funding status with color | | ☐ |
| 9 | Verify badge consistency | All badges have same size, shape, font | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case COMP-3: Loading Skeletons
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Navigate to finance page (slow connection) | Shows table skeleton before data loads | | ☐ |
| 2 | Verify skeleton animation | Pulse animation visible | | ☐ |
| 3 | Check skeleton structure | Mimics actual table structure | | ☐ |
| 4 | Navigate to dashboard (slow connection) | Shows card skeletons | | ☐ |
| 5 | Verify data replacement | Skeleton smoothly replaced by actual data | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case COMP-4: Empty States
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View page with no data | Shows professional empty state | | ☐ |
| 2 | Check empty state icon | Shows relevant icon (document, folder, etc.) | | ☐ |
| 3 | Verify empty state message | Clear, helpful message | | ☐ |
| 4 | Check action button | Shows "Create [Resource]" button if applicable | | ☐ |
| 5 | Test NoResultsEmptyState | Shows when filters return no results | | ☐ |
| 6 | Verify message | "Try adjusting your search or filter" message | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case COMP-5: Error States
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Trigger error (e.g., network offline) | Shows error empty state | | ☐ |
| 2 | Verify error icon | Red warning icon displayed | | ☐ |
| 3 | Check error message | Clear error description | | ☐ |
| 4 | Find retry button | "Try again" button present | | ☐ |
| 5 | Click retry button | Attempts to reload data | | ☐ |

**Notes:** _______________________________________________________________

---

## Phase 3: Dashboard Enhancements

### Test Case DASH-1: Personalized Welcome Header
**Priority:** High
**User Role:** Any authenticated user

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Navigate to `/dashboard` | Dashboard loads | | ☐ |
| 2 | Check greeting | Shows time-appropriate greeting (Good morning/afternoon/evening) | | ☐ |
| 3 | Verify user name | Displays user's full name (not email) | | ☐ |
| 4 | Check role badge | Shows user role (Administrator, Finance Manager, etc.) | | ☐ |
| 5 | Verify department | Shows department name if user has one | | ☐ |
| 6 | Check gradient background | Professional blue gradient behind welcome | | ☐ |
| 7 | Find quick action buttons | "View Plans" and "Budgets" buttons in header | | ☐ |
| 8 | Test quick action buttons | Navigate to correct pages | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case DASH-2: Quick Stats Cards
**Priority:** High
**User Role:** Any authenticated user

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View "Total Plans" card | Shows count with icon | | ☐ |
| 2 | Verify active count | Shows "X active" sub-text | | ☐ |
| 3 | View "Total Initiatives" card | Shows count with icon | | ☐ |
| 4 | Verify in-progress count | Shows "X in progress" sub-text | | ☐ |
| 5 | View "Total Budget" card | Shows 3-year budget total | | ☐ |
| 6 | Verify currency format | Formatted as $XXX,XXX | | ☐ |
| 7 | View "Completion Rate" card | Shows percentage | | ☐ |
| 8 | Verify calculation | Percentage is accurate | | ☐ |
| 9 | Check card icons | Each card has colored icon background | | ☐ |
| 10 | Verify responsive layout | Cards stack on mobile, grid on desktop | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case DASH-3: Recent Plans Section
**Priority:** High
**User Role:** Any authenticated user

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View "Recent Plans" section | Shows last 5 updated plans | | ☐ |
| 2 | Check plan card layout | Shows title, department, status badge | | ☐ |
| 3 | Verify timestamp | Shows "Updated X days ago" or similar | | ☐ |
| 4 | Check status badge | Uses StatusBadge component with colors | | ☐ |
| 5 | Click plan card | Navigates to plan details | | ☐ |
| 6 | Find "View All" button | Button in section header | | ☐ |
| 7 | Click "View All" | Navigates to plans list | | ☐ |
| 8 | Test with no plans | Shows empty state with helpful message | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case DASH-4: Recent Initiatives Section
**Priority:** High
**User Role:** Any authenticated user

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View "Recent Initiatives" section | Shows last 5 created initiatives | | ☐ |
| 2 | Check initiative card | Shows name, parent plan, status | | ☐ |
| 3 | Verify status badge | Colored badge showing initiative status | | ☐ |
| 4 | Click initiative card | Navigates to initiative details | | ☐ |
| 5 | Test with no initiatives | Shows empty state | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case DASH-5: Quick Actions Grid
**Priority:** Medium
**User Role:** Various

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View Quick Actions section | Shows grid of action cards | | ☐ |
| 2 | Find "Strategic Plans" card | Always visible to all users | | ☐ |
| 3 | Find "Budget Dashboard" card | Always visible to all users | | ☐ |
| 4 | Login as Admin | See "User Management" and "Departments" cards | | ☐ |
| 5 | Login as City Manager | See "User Management" and "Departments" cards | | ☐ |
| 6 | Login as Staff | Admin cards hidden | | ☐ |
| 7 | Click action card | Navigates to correct page | | ☐ |
| 8 | Check hover effect | Cards show hover state | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case DASH-6: Role-Based Data Filtering
**Priority:** Critical
**User Role:** Various

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Login as Admin | See organization-wide statistics | | ☐ |
| 2 | Login as Finance Manager | See organization-wide statistics | | ☐ |
| 3 | Login as City Manager | See organization-wide statistics | | ☐ |
| 4 | Login as Department Head | See only own department's data | | ☐ |
| 5 | Login as Staff | See only own department's data | | ☐ |
| 6 | Verify data filtering | Stats match department scope | | ☐ |
| 7 | Check recent items | Only show accessible plans/initiatives | | ☐ |

**Notes:** _______________________________________________________________

---

## Initiative Details Page Enhancements

### Test Case INIT-1: Budget Category Visualization
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Navigate to initiative details | Page loads successfully | | ☐ |
| 2 | Find "Budget by Category" section | Section visible above year breakdown | | ☐ |
| 3 | View horizontal bar chart | Colorful segmented bar showing percentages | | ☐ |
| 4 | Hover over bar segment | Tooltip shows category name and percentage | | ☐ |
| 5 | View category cards grid | Individual cards for each category | | ☐ |
| 6 | Verify category card content | Shows name, percentage, and dollar amount | | ☐ |
| 7 | Check color coding | Each category has unique color | | ☐ |
| 8 | Verify calculations | Percentages sum to 100% | | ☐ |
| 9 | Check total | Header shows total budget amount | | ☐ |
| 10 | Test with $0 categories | Categories with $0 are hidden | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case INIT-2: Enhanced Badge Integration
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View initiative header | PriorityBadge and StatusBadge visible | | ☐ |
| 2 | Check badge styling | Consistent with Phase 2 components | | ☐ |
| 3 | Scroll to budget breakdown | FundingStatusBadge for each year | | ☐ |
| 4 | Verify badge colors | Secured=green, Pending=amber, etc. | | ☐ |

**Notes:** _______________________________________________________________

---

## Responsive Design Testing

### Test Case RESP-1: Mobile Dashboard (320px - 767px)
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Open dashboard on mobile | Layout is mobile-optimized | | ☐ |
| 2 | Check welcome header | Stacks vertically, buttons below name | | ☐ |
| 3 | View stats cards | Stack in single column | | ☐ |
| 4 | Check recent sections | Stack vertically (not side-by-side) | | ☐ |
| 5 | View quick actions | 1-2 columns max | | ☐ |
| 6 | Test navigation | Sidebar toggles or collapses | | ☐ |
| 7 | Check touch targets | Buttons/links are tap-friendly (44px min) | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case RESP-2: Tablet Dashboard (768px - 1023px)
**Priority:** Medium
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Open dashboard on tablet | Optimized for tablet size | | ☐ |
| 2 | View stats cards | 2 columns | | ☐ |
| 3 | Check recent sections | Side-by-side layout | | ☐ |
| 4 | View quick actions | 2 columns | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case RESP-3: Desktop Dashboard (1024px+)
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Open dashboard on desktop | Full desktop layout | | ☐ |
| 2 | View stats cards | 4 columns | | ☐ |
| 3 | Check recent sections | Side-by-side with good spacing | | ☐ |
| 4 | View quick actions | 4 columns | | ☐ |
| 5 | Check max width | Content max width ~1280px, centered | | ☐ |

**Notes:** _______________________________________________________________

---

## Accessibility Testing

### Test Case ACCESS-1: Keyboard Navigation
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Tab through dashboard | Focus indicator visible on all interactive elements | | ☐ |
| 2 | Tab to stats cards | Cards are focusable if clickable | | ☐ |
| 3 | Tab to recent items | All links focusable | | ☐ |
| 4 | Press Enter on focused link | Navigates to page | | ☐ |
| 5 | Test skip links | Can skip to main content | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case ACCESS-2: Screen Reader Support
**Priority:** Medium
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Use screen reader on dashboard | All content is readable | | ☐ |
| 2 | Navigate to stats cards | Card purpose announced clearly | | ☐ |
| 3 | Navigate to badges | Badge status announced | | ☐ |
| 4 | Check image alt text | All icons have alt text or aria-labels | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case ACCESS-3: Color Contrast
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Check text on white background | Minimum 4.5:1 contrast ratio | | ☐ |
| 2 | Check badge text | Text readable on all badge colors | | ☐ |
| 3 | Check button text | White text on colored buttons readable | | ☐ |
| 4 | Test with color blindness simulator | UI still usable | | ☐ |

**Notes:** _______________________________________________________________

---

## Performance Testing

### Test Case PERF-1: Dashboard Load Time
**Priority:** High
**User Role:** Any

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Load dashboard (first visit) | Loads within 2 seconds | | ☐ |
| 2 | Load dashboard (cached) | Loads within 1 second | | ☐ |
| 3 | Check skeleton visibility | Skeletons visible during load | | ☐ |
| 4 | Monitor network requests | Minimal API calls | | ☐ |

**Notes:** _______________________________________________________________

---

## Browser Testing

### Test Case BROWSER-1: Cross-Browser Compatibility
**Priority:** High
**User Role:** Any

| Browser | Version | Dashboard | Components | Responsive | Pass/Fail |
|---------|---------|-----------|------------|------------|-----------|
| Chrome | Latest | ☐ | ☐ | ☐ | ☐ |
| Firefox | Latest | ☐ | ☐ | ☐ | ☐ |
| Safari | Latest | ☐ | ☐ | ☐ | ☐ |
| Edge | Latest | ☐ | ☐ | ☐ | ☐ |
| Chrome Mobile | Latest | ☐ | ☐ | ☐ | ☐ |
| Safari iOS | Latest | ☐ | ☐ | ☐ | ☐ |

**Notes:** _______________________________________________________________

---

## Visual Regression Testing

### Test Case VISUAL-1: Design Consistency Check
**Priority:** Medium
**User Role:** Any

| Page | Theme Applied | Components Styled | Layout Correct | Pass/Fail |
|------|---------------|-------------------|----------------|-----------|
| Dashboard | ☐ | ☐ | ☐ | ☐ |
| Finance | ☐ | ☐ | ☐ | ☐ |
| Plans List | ☐ | ☐ | ☐ | ☐ |
| Plan Details | ☐ | ☐ | ☐ | ☐ |
| Initiative Details | ☐ | ☐ | ☐ | ☐ |
| Admin Pages | ☐ | ☐ | ☐ | ☐ |

**Notes:** _______________________________________________________________

---

## Defect Log

| Defect ID | Test Case | Severity | Description | Status |
|-----------|-----------|----------|-------------|--------|
| | | | | |
| | | | | |
| | | | | |

---

## Overall Dashboard & UI Sign-Off

**Total Test Cases:** 25+
**Test Cases Passed:** _______
**Test Cases Failed:** _______
**Pass Rate:** _______%

**Critical Issues Found:** _______
**Blockers:** _______

**Recommendation:** ☐ Approve for Production ☐ Needs Fixes ☐ Major Rework Required

**Tester Signature:** _____________________ **Date:** _____________

**UX Designer Approval:** _____________________ **Date:** _____________

**Product Owner Approval:** _____________________ **Date:** _____________

---

## Notes and Observations

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

