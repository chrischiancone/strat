# Story 3.6: Budget Category Analysis

**Story ID:** STORY-3.6
**Epic:** Epic 3 - Finance Validates Budgets
**Status:** ✅ Completed
**Priority:** P1 (Medium)
**Story Points:** 8
**Completed:** January 2025

---

## User Story

**As a** Finance Director
**I want to** view budget distribution across spending categories
**So that** I can analyze spending patterns and ensure balanced resource allocation

---

## Acceptance Criteria

- [x] Dashboard shows budget totals by category (Personnel, Equipment, Services, Training, Materials, Other)
- [x] Pie chart visualization of category distribution
- [x] Bar chart option for comparison
- [x] Table showing category breakdown with drill-down to initiatives
- [x] User can filter by: Department, Fiscal Year
- [x] Percentage calculations for each category
- [x] Total budget summary
- [x] Initiative count per category

---

## Implementation Details

### Files Created:

1. **`/app/actions/budget-categories.ts`** - Server action for category analysis
   - `getBudgetCategories()` - Aggregates budgets by spending category
   - Queries `initiative_budgets` table grouped by `category` field
   - Maps database categories to display names
   - Returns total per category with initiative drill-down
   - Also provides by-department breakdown
   - Role-based access control (Finance and Admin only)

2. **`/components/finance/CategoryCharts.tsx`** - Budget category visualization
   - Displays pie chart or bar chart (toggle control)
   - Pie chart with percentage labels (hides if < 5%)
   - Bar chart with angled X-axis labels
   - Color-coded categories (6 distinct colors)
   - Compact currency formatting ($1.2M, $500K)
   - Interactive tooltips
   - Responsive design

3. **`/components/finance/CategoryBreakdownTable.tsx`** - Expandable category table
   - Table showing: Category, Total Amount, % of Total, # Initiatives
   - Click to expand row showing all initiatives in that category
   - Initiative cards with links to detail pages
   - Department and fiscal year displayed per initiative
   - Color-coded expand/collapse chevron icons
   - Footer row with totals

4. **`/components/finance/CategoryDashboardContent.tsx`** - Main dashboard orchestrator
   - Client component managing filters and state
   - Filter controls for Fiscal Year and Department (multiple selection)
   - Summary cards: Total Budget, Categories count
   - Loading and error states
   - Integrates charts and table components
   - Real-time data updates on filter change

5. **`/app/(dashboard)/finance/categories/page.tsx`** - Category analysis dashboard page
   - Route: `/finance/categories`
   - Server component for SSR
   - Role-based access control (Finance and Admin only)
   - Back button to Finance dashboard
   - Fetches fiscal years and departments for filters

6. **`/app/(dashboard)/finance/page.tsx`** - Updated Finance dashboard (modified)
   - Added "Categories" navigation button in header
   - Links to category analysis page
   - BarChart3 icon

### Key Features:

✅ **Category Aggregation:**
- Groups all initiative budgets by spending category
- Categories: personnel, equipment, services, training, materials, other
- Display names: "Personnel", "Equipment & Technology", "Professional Services", "Training & Development", "Materials & Supplies", "Other"
- Calculates total amount and initiative count per category

✅ **Flexible Visualization:**
- Pie chart shows proportional distribution (ideal for percentages)
- Bar chart shows absolute amounts (ideal for comparison)
- Toggle control to switch between visualizations
- Color-coded for easy recognition
- Interactive tooltips with full currency amounts

✅ **Drill-Down Analysis:**
- Click category row to expand
- Shows all initiatives in that category
- Initiative details: Name (linked), Department, FY, Amount
- Enables Finance to see specific initiatives driving category totals

✅ **Filter Controls:**
- Filter by fiscal year (multiple selection)
- Filter by department (multiple selection)
- Active filter count with "Clear All" button
- Filters apply to both charts and table

✅ **Summary Statistics:**
- Total budget across all categories
- Count of unique categories with budgets
- Total count of initiatives
- Percentage calculations per category

### Data Model:

**Query Strategy:**
```typescript
// Query initiative_budgets grouped by category
SELECT
  category,
  SUM(amount) as total_amount,
  COUNT(DISTINCT initiative_id) as initiative_count,
  JSON_AGG(initiative details) as initiatives
FROM initiative_budgets
WHERE municipality matches user
  [AND fiscal_year_id IN (...)]
  [AND department_id IN (...)]
GROUP BY category
ORDER BY total_amount DESC
```

**Category Mapping:**
- Database stores: "personnel", "equipment", "services", "training", "materials", "other"
- Display shows: "Personnel", "Equipment & Technology", "Professional Services", etc.
- Consistent with budget entry dropdowns

### Chart Configuration:

**Pie Chart:**
- Outer radius: 120px
- Custom labels showing percentages (only if >= 5%)
- Legend at bottom with category names and amounts
- Tooltip shows full currency amount

**Bar Chart:**
- X-axis: Category names (angled -45°)
- Y-axis: Currency amounts (compact format)
- Margin adjusted for angled labels (bottom: 70px)
- Bars color-coded matching pie chart

**Color Scheme:**
- Personnel: Blue (#3b82f6)
- Equipment: Green (#10b981)
- Services: Amber (#f59e0b)
- Training: Red (#ef4444)
- Materials: Violet (#8b5cf6)
- Other: Pink (#ec4899)

---

## Testing Notes

**Test Scenarios:**
1. ✅ Finance Director can access categories dashboard
2. ✅ Admin can access categories dashboard
3. ✅ Non-Finance users cannot access (404)
4. ✅ Charts display all budget categories
5. ✅ Pie chart shows correct percentages
6. ✅ Bar chart shows correct amounts
7. ✅ Toggle between pie and bar charts works
8. ✅ Table shows all categories with totals
9. ✅ Expanding category shows initiatives
10. ✅ Initiative links navigate to detail pages
11. ✅ Filter by fiscal year works
12. ✅ Filter by department works
13. ✅ Multiple filters work together (AND logic)
14. ✅ Clear filters resets to all data
15. ✅ Summary cards show accurate totals
16. ✅ Percentages sum to 100%
17. ✅ Back button returns to Finance dashboard

**Performance:**
- Dashboard loads in < 3 seconds with 100+ initiatives
- Chart rendering < 500ms
- Table expansion < 100ms
- Filtering updates in < 1 second

**Edge Cases:**
- No budget data (displays empty state)
- Single category has 100% of budget
- Category with zero initiatives
- Very long category names (should not occur with fixed set)
- Filtering results in no data (shows empty state)

---

## Related Stories

- Story 3.1: View All Initiative Budgets Dashboard (data source)
- Story 3.2: View Initiative Budget Detail (drill-down destination)
- Story 3.5: Grant-Funded Initiatives List (similar filter pattern)
- Story 3.8: Export Budget Data to Excel (could add export here in Phase 2)

---

## Technical Decisions

**Category Grouping: Fixed set**
- Decision: Use predefined category list from initiative_budgets table
- Reason: Categories are constrained by database schema and UI dropdowns
- Benefit: Consistent categorization, no dynamic category creation
- Categories: personnel, equipment, services, training, materials, other

**Display Names: Mapped**
- Decision: Map database category names to user-friendly display names
- Reason: Database uses lowercase short names, UI needs readable titles
- Example: "equipment" → "Equipment & Technology"
- Benefit: Better UX without changing database

**Chart Library: Recharts**
- Decision: Use recharts for all data visualizations
- Reason: Already used in project, well-maintained, composable
- Benefit: Consistent chart styling across application
- Alternative: Chart.js (rejected: requires separate library)

**Chart Type Toggle: Client-side**
- Decision: Toggle between pie and bar chart in same component
- Reason: Users have different preferences for visualization
- Benefit: Flexibility without separate pages

**Drill-Down Pattern: Expandable rows**
- Decision: Click category row to expand/collapse initiatives
- Reason: Keeps all data on one page, progressive disclosure
- Benefit: Quick navigation, no separate pages needed
- Alternative: Separate page per category (rejected: more complex)

**Color Coding: Semantic**
- Decision: Assign specific color to each category
- Reason: Visual consistency across charts and tables
- Colors: Blue (personnel), Green (equipment), Amber (services), etc.
- Benefit: Users can quickly recognize categories

**Percentage Calculation: Client-side**
- Decision: Calculate percentages in components from total
- Reason: Total budget calculated by summing categories
- Benefit: Always accurate, no rounding errors from database

**Filter Persistence: Session-based**
- Decision: Filters reset on page reload
- Reason: Simpler implementation, users expect fresh view
- Alternative: URL params (rejected: complex for multiple filters)

---

## Security Considerations

**Access Control:**
- Page-level: Role check in server component (Finance, Admin only)
- API-level: Role check in server action
- Database-level: RLS policies on initiative_budgets table

**Data Privacy:**
- Budget category data is sensitive financial information
- Only Finance and Admin roles have access
- Municipality-scoped queries (users only see their own municipality)

**Client-Side Rendering:**
- Charts rendered client-side for interactivity
- Data fetched server-side with proper authorization
- No sensitive data in client bundle

---

## Notes

- This dashboard helps Finance understand spending patterns
- Critical for budget planning and resource allocation
- Visual charts make it easy to identify over/under-invested categories
- Drill-down enables Finance to see which initiatives drive category totals

**Typical Use Cases:**
1. **Budget Review**: Finance checks if personnel costs are too high (should be < 70%)
2. **Category Planning**: Identify underfunded categories (e.g., training < 2%)
3. **Department Analysis**: Filter by department to see their spending patterns
4. **Fiscal Year Trends**: Compare categories across fiscal years
5. **Initiative Investigation**: Expand category to see which initiatives contribute most

**Finance Director Insights:**
- Personnel typically largest category (50-70% of municipal budgets)
- Equipment should be strategic investments (10-20%)
- Services for specialized work (5-15%)
- Training important for workforce development (2-5%)
- Materials for supplies and maintenance (5-10%)
- Other for miscellaneous (< 5%)

**Red Flags Finance Looks For:**
- Personnel > 75% (too top-heavy, not enough operational budget)
- Training < 1% (not investing in workforce development)
- Equipment = 0% (deferring infrastructure, creating future problems)
- Other > 10% (miscategorization, need to recategorize)

**Future Enhancements (Phase 2):**
- Historical trend analysis (compare categories year-over-year)
- Export category analysis to Excel
- Budget category targets and alerts (warn if > threshold)
- Category benchmarking against similar municipalities
- Category variance analysis (planned vs actual)
- Integration with accounting system category codes
- Custom category groupings (e.g., combine materials + equipment)
- Category forecasting based on historical patterns
- Department-level category comparisons
- Initiative priority overlay (see if high-priority initiatives are underfunded)

---

**Story Created:** January 2025
**Story Completed:** January 2025
