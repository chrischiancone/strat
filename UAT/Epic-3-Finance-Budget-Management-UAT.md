# Epic 3: Finance & Budget Management - UAT Test Script

**Epic Description:** Finance Dashboard for reviewing and validating initiative budgets

**Test Date:** _________________
**Tester Name:** _________________
**Tester Role:** _________________
**Environment:** Production / Staging / Development (circle one)

---

## Pre-Test Setup

**Required User Roles:**
- [ ] Finance Manager account
- [ ] Admin account
- [ ] Regular staff account (for permission testing)

**Test Data Requirements:**
- [ ] At least 3 strategic plans with initiatives
- [ ] Initiatives with varying priority levels (NEED, WANT, NICE_TO_HAVE)
- [ ] Initiatives with different statuses (NOT_STARTED, IN_PROGRESS, COMPLETED, etc.)
- [ ] Budget data across multiple fiscal years
- [ ] Various funding sources and statuses

---

## Story 3.1: Finance Dashboard - View All Initiative Budgets

### Test Case 3.1.1: Access Finance Dashboard
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Navigate to `/finance` | Finance Dashboard loads successfully | | ☐ |
| 2 | Verify page title | Shows "Initiative Budgets" header | | ☐ |
| 3 | Check summary cards | Displays 5 summary cards (Total Budget, Total Initiatives, Departments, Validated, Pending) | | ☐ |
| 4 | Verify budget table | Shows initiative budgets with all required columns | | ☐ |
| 5 | Check pagination | Pagination controls appear if > 50 initiatives | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.1.2: Verify Budget Table Columns
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Review table headers | Contains: Department, Initiative, Priority, Status, Year 1, Year 2, Year 3, Total, Funding, Validated, Actions | | ☐ |
| 2 | Verify Year 1 column | Shows Year 1 budget formatted as currency | | ☐ |
| 3 | Verify Year 2 column | Shows Year 2 budget formatted as currency | | ☐ |
| 4 | Verify Year 3 column | Shows Year 3 budget formatted as currency | | ☐ |
| 5 | Verify Total column | Shows sum of 3 years formatted as currency | | ☐ |
| 6 | Check funding sources | Displays as blue badges, shows first 2 sources + count | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.1.3: Access Control Testing
**Priority:** High
**User Role:** Various

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Login as Finance Manager | Can access `/finance` dashboard | | ☐ |
| 2 | Login as Admin | Can access `/finance` dashboard | | ☐ |
| 3 | Login as regular Staff | Gets 404 or access denied | | ☐ |
| 4 | Login as Department Head | Gets 404 or access denied | | ☐ |

**Notes:** _______________________________________________________________

---

## Story 3.2: Sort and Filter Budgets

### Test Case 3.2.1: Sorting Functionality
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Click "Department" header | Table sorts alphabetically by department (A-Z) | | ☐ |
| 2 | Click "Department" again | Reverses sort order (Z-A) | | ☐ |
| 3 | Click "Total" header | Sorts by budget amount (highest first) | | ☐ |
| 4 | Click "Total" again | Reverses to lowest first | | ☐ |
| 5 | Click "Priority" header | Sorts by priority level | | ☐ |
| 6 | Verify sort indicator | Shows up/down arrow next to active column | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.2.2: Filter by Department
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Click "Filters" section | Filters panel expands | | ☐ |
| 2 | Select one department | Table shows only that department's initiatives | | ☐ |
| 3 | Select multiple departments | Table shows initiatives from selected departments | | ☐ |
| 4 | Verify filter count | Shows "X filters applied" badge | | ☐ |
| 5 | Click "Clear All Filters" | All filters removed, full table restored | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.2.3: Filter by Fiscal Year
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Select single fiscal year | Shows only initiatives from that year | | ☐ |
| 2 | Select multiple fiscal years | Shows initiatives from selected years | | ☐ |
| 3 | Verify year format | Displays as "FY YYYY" | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.2.4: Filter by Priority
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Select "NEED" priority | Shows only critical priority initiatives | | ☐ |
| 2 | Select "WANT" priority | Shows only important priority initiatives | | ☐ |
| 3 | Select "NICE_TO_HAVE" | Shows only nice-to-have initiatives | | ☐ |
| 4 | Select multiple priorities | Shows initiatives matching any selected priority | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.2.5: Filter by Funding Source
**Priority:** Medium
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Open funding source filter | Shows list of all unique funding sources | | ☐ |
| 2 | Select one funding source | Shows initiatives using that source | | ☐ |
| 3 | Select multiple sources | Shows initiatives using any selected source | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.2.6: Search Functionality
**Priority:** Medium
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Type initiative name in search | Filters to matching initiatives | | ☐ |
| 2 | Type department name | Filters to matching department | | ☐ |
| 3 | Type goal title | Filters to matching goals | | ☐ |
| 4 | Test partial matches | Shows all partial matches | | ☐ |
| 5 | Clear search | Restores full results | | ☐ |

**Notes:** _______________________________________________________________

---

## Story 3.3: Filter by Funding Status

### Test Case 3.3.1: Funding Status Filter
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Open funding status filter | Shows: Secured, Requested, Pending, Projected | | ☐ |
| 2 | Select "Secured" | Shows only initiatives with secured funding | | ☐ |
| 3 | Select "Pending" | Shows only initiatives with pending funding | | ☐ |
| 4 | Select multiple statuses | Shows initiatives matching any selected status | | ☐ |
| 5 | Combine with other filters | Filters work together correctly | | ☐ |

**Notes:** _______________________________________________________________

---

## Story 3.4: Validate Budgets

### Test Case 3.4.1: Budget Validation Toggle
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Find unvalidated initiative | Validated column shows empty/gray checkmark | | ☐ |
| 2 | Click checkmark icon | Icon turns green, tooltip shows "Budget validated" | | ☐ |
| 3 | Verify summary card update | "Validated" count increases by 1 | | ☐ |
| 4 | Click green checkmark | Reverts to unvalidated state | | ☐ |
| 5 | Verify summary card update | "Pending" count increases by 1 | | ☐ |
| 6 | Check database persistence | Refresh page, validation state persists | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.4.2: Validation Metadata
**Priority:** Medium
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Validate an initiative | Records who validated (user ID) | | ☐ |
| 2 | Check timestamp | Records when validated (timestamp) | | ☐ |
| 3 | Hover over validated icon | Tooltip shows validator and date | | ☐ |

**Notes:** _______________________________________________________________

---

## Story 3.5: Export Budget Data

### Test Case 3.5.1: Excel Export - Full Data
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Click "Export to Excel" button | Download starts immediately | | ☐ |
| 2 | Open downloaded file | Excel file opens without errors | | ☐ |
| 3 | Check filename format | Format: `budget-data-YYYY-MM-DD.xlsx` | | ☐ |
| 4 | Verify "All Initiatives" sheet | Contains all table columns with data | | ☐ |
| 5 | Verify "By Department" sheet | Shows budget totals by department | | ☐ |
| 6 | Verify "By Funding Source" sheet | Shows budget totals by source | | ☐ |
| 7 | Verify "By Category" sheet | Shows budget totals by category | | ☐ |
| 8 | Verify "By Fiscal Year" sheet | Shows budget totals by year | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.5.2: Excel Export - Filtered Data
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Apply department filter | Select specific department | | ☐ |
| 2 | Click "Export to Excel" | Export reflects filtered data only | | ☐ |
| 3 | Verify sheet data | Contains only filtered initiatives | | ☐ |
| 4 | Apply multiple filters | Select dept + priority + year | | ☐ |
| 5 | Export filtered data | All filters reflected in export | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.5.3: Excel Export - Formatting
**Priority:** Medium
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Check currency columns | Formatted as currency ($X,XXX) | | ☐ |
| 2 | Check column widths | Auto-sized for readability | | ☐ |
| 3 | Verify headers | Bold, properly labeled | | ☐ |
| 4 | Check data types | Numbers as numbers, text as text | | ☐ |

**Notes:** _______________________________________________________________

---

## Story 3.6: Budget Summary Statistics

### Test Case 3.6.1: Summary Cards Accuracy
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View "Total Budget" card | Shows sum of all initiatives' 3-year budgets | | ☐ |
| 2 | Manually verify total | Matches manual calculation | | ☐ |
| 3 | View "Total Initiatives" card | Shows count of all initiatives | | ☐ |
| 4 | View "Departments" card | Shows count of unique departments | | ☐ |
| 5 | View "Validated" card | Shows count of validated budgets | | ☐ |
| 6 | View percentage | Shows "X% complete" calculation | | ☐ |
| 7 | View "Pending" card | Shows count of unvalidated budgets | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.6.2: Summary Cards with Filters
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Apply department filter | Summary cards update to show filtered totals | | ☐ |
| 2 | Apply priority filter | Summary cards reflect filtered data | | ☐ |
| 3 | Clear filters | Summary cards return to full totals | | ☐ |

**Notes:** _______________________________________________________________

---

## Story 3.7: Grant-Funded Initiatives

### Test Case 3.7.1: Grant Dashboard Access
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Navigate to `/finance/grants` | Grant dashboard loads | | ☐ |
| 2 | Verify header | Shows "Grant-Funded Initiatives" title | | ☐ |
| 3 | Check back button | Returns to main finance dashboard | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.7.2: Grant Summary Statistics
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View "Total Grant Funding" card | Shows sum of all grant amounts | | ☐ |
| 2 | View "Total Initiatives" card | Shows count of grant-funded initiatives | | ☐ |
| 3 | View "Secured" card | Shows total secured grant funding (green) | | ☐ |
| 4 | View "Pending" card | Shows total pending grant funding (amber) | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.7.3: Grant Initiatives Table
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Review table columns | Shows: Department, Initiative, Priority, Grant Source, Grant Amount, Total Cost, Status, FY, Actions | | ☐ |
| 2 | Verify grant amount | Formatted as currency | | ☐ |
| 3 | Verify grant status | Shows as colored badge (Secured=green, Pending=amber, etc.) | | ☐ |
| 4 | Click "View" action | Opens initiative detail page | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.7.4: Grant Filters
**Priority:** Medium
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Filter by fiscal year | Shows only grants for selected year | | ☐ |
| 2 | Filter by department | Shows only selected department's grants | | ☐ |
| 3 | Filter by grant status | Shows only selected status grants | | ☐ |
| 4 | Combine multiple filters | Filters work together correctly | | ☐ |
| 5 | Clear all filters | Restores full grant list | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.7.5: Grant Export
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Click "Export to Excel" | Excel download starts | | ☐ |
| 2 | Open file | Contains "Grant Initiatives" sheet | | ☐ |
| 3 | Verify data columns | All grant data present and formatted | | ☐ |
| 4 | Check "Summary" sheet | Contains grant statistics by status and department | | ☐ |

**Notes:** _______________________________________________________________

---

## Story 3.8: Budget Categories

### Test Case 3.8.1: Category Management Access
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Navigate to `/finance/categories` | Categories page loads | | ☐ |
| 2 | Verify header | Shows "Budget Categories" title | | ☐ |
| 3 | Check back button | Returns to finance dashboard | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.8.2: View Budget Categories
**Priority:** High
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View categories list | Shows all active budget categories | | ☐ |
| 2 | Verify default categories | Includes: Personnel, Equipment, Services, Training, Materials, Other | | ☐ |
| 3 | Check category display | Shows name, description (if any), and usage count | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case 3.8.3: Category Statistics
**Priority:** Medium
**User Role:** Finance Manager

| Step | Action | expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | View "Total Budget by Category" | Shows breakdown of total budget by category | | ☐ |
| 2 | Verify calculations | Category totals sum to overall total budget | | ☐ |
| 3 | Check visual representation | Shows bar chart or percentage breakdown | | ☐ |

**Notes:** _______________________________________________________________

---

## Cross-Story Integration Tests

### Test Case INT-1: End-to-End Budget Review Workflow
**Priority:** Critical
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Login as Finance Manager | Access granted to finance dashboard | | ☐ |
| 2 | Review summary statistics | All cards show accurate totals | | ☐ |
| 3 | Apply filters (dept + priority) | Results filtered correctly | | ☐ |
| 4 | Sort by total budget | Highest budget initiatives first | | ☐ |
| 5 | Validate top 3 initiatives | Checkmarks turn green, summary updates | | ☐ |
| 6 | Export filtered data | Excel file downloads with correct data | | ☐ |
| 7 | Navigate to grants page | Grant data loads correctly | | ☐ |
| 8 | Export grant data | Grant export completes successfully | | ☐ |
| 9 | Return to main dashboard | All validated budgets persist | | ☐ |

**Notes:** _______________________________________________________________

---

### Test Case INT-2: Multi-User Validation Testing
**Priority:** High
**User Role:** Multiple Finance Managers

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | User A validates initiative #1 | Initiative marked validated | | ☐ |
| 2 | User B refreshes page | Sees initiative #1 as validated | | ☐ |
| 3 | User B validates initiative #2 | Initiative marked validated | | ☐ |
| 4 | User A refreshes page | Sees both #1 and #2 as validated | | ☐ |
| 5 | Check validation metadata | Each validation shows correct user | | ☐ |

**Notes:** _______________________________________________________________

---

## Performance Testing

### Test Case PERF-1: Large Dataset Performance
**Priority:** Medium
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Load page with 100+ initiatives | Page loads within 3 seconds | | ☐ |
| 2 | Apply multiple filters | Filtering completes within 1 second | | ☐ |
| 3 | Sort large dataset | Sorting completes within 1 second | | ☐ |
| 4 | Export 100+ initiatives | Export completes within 5 seconds | | ☐ |

**Notes:** _______________________________________________________________

---

## Browser Compatibility Testing

### Test Case BROWSER-1: Cross-Browser Testing
**Priority:** Medium
**User Role:** Finance Manager

| Browser | Version | Dashboard Loads | Filters Work | Export Works | Pass/Fail |
|---------|---------|-----------------|--------------|--------------|-----------|
| Chrome | Latest | ☐ | ☐ | ☐ | ☐ |
| Firefox | Latest | ☐ | ☐ | ☐ | ☐ |
| Safari | Latest | ☐ | ☐ | ☐ | ☐ |
| Edge | Latest | ☐ | ☐ | ☐ | ☐ |

**Notes:** _______________________________________________________________

---

## Mobile Responsiveness Testing

### Test Case MOBILE-1: Mobile Experience
**Priority:** Medium
**User Role:** Finance Manager

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Open on mobile device | Page is responsive and readable | | ☐ |
| 2 | View summary cards | Cards stack vertically | | ☐ |
| 3 | Scroll table horizontally | Table scrolls smoothly | | ☐ |
| 4 | Use filters | Filter UI is touch-friendly | | ☐ |
| 5 | Validate budgets | Checkmarks are tap-friendly | | ☐ |

**Notes:** _______________________________________________________________

---

## Defect Log

| Defect ID | Test Case | Severity | Description | Status |
|-----------|-----------|----------|-------------|--------|
| | | | | |
| | | | | |
| | | | | |

---

## Overall Epic 3 Sign-Off

**Total Test Cases:** 30+
**Test Cases Passed:** _______
**Test Cases Failed:** _______
**Pass Rate:** _______%

**Critical Issues Found:** _______
**Blockers:** _______

**Recommendation:** ☐ Approve for Production ☐ Needs Fixes ☐ Major Rework Required

**Tester Signature:** _____________________ **Date:** _____________

**Finance Manager Approval:** _____________________ **Date:** _____________

**Product Owner Approval:** _____________________ **Date:** _____________

---

## Notes and Observations

Use this space for additional comments, observations, or recommendations:

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

