# Accessibility Testing Guide

This document provides comprehensive guidance on automated accessibility testing using axe-core and Playwright.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [Understanding Results](#understanding-results)
6. [Fixing Violations](#fixing-violations)
7. [Best Practices](#best-practices)
8. [CI/CD Integration](#cicd-integration)

## Overview

We use **axe-core** for automated accessibility testing to ensure WCAG 2.1 AA compliance across the application. The test suite covers:

- ✅ WCAG 2.0 Level A
- ✅ WCAG 2.0 Level AA
- ✅ WCAG 2.1 Level A
- ✅ WCAG 2.1 Level AA
- ✅ Best practices

### What axe-core Tests

- **Color Contrast**: Text and background contrast ratios
- **Keyboard Navigation**: Focus management and tab order
- **ARIA Attributes**: Proper use of ARIA labels and roles
- **Form Labels**: All inputs have associated labels
- **Alt Text**: Images have descriptive alt attributes
- **Heading Structure**: Proper semantic heading hierarchy
- **Landmark Regions**: Main, navigation, footer regions
- **Focus Indicators**: Visible focus states
- **Screen Reader Support**: Content readable by assistive technology

## Getting Started

### Dependencies

The following packages are already installed:

```json
{
  "devDependencies": {
    "@axe-core/playwright": "^4.10.2",
    "axe-core": "^4.11.0",
    "@playwright/test": "^1.40.1"
  }
}
```

### Test File Location

All accessibility tests are located in:
```
tests/e2e/accessibility.spec.ts
```

## Running Tests

### Run All Accessibility Tests

```bash
npm run test:a11y
```

### Run Tests with UI (Interactive)

```bash
npm run test:a11y:ui
```

This opens the Playwright UI where you can:
- Select specific tests to run
- View test execution in real-time
- Debug failing tests
- See detailed accessibility violations

### Run Tests in Headed Mode (Watch Browser)

```bash
npm run test:a11y:headed
```

Useful for debugging visual issues and seeing how axe-core scans the page.

### Run Specific Test Suites

```bash
# Run only public page tests
npx playwright test -g "Public Pages"

# Run only form accessibility tests
npx playwright test -g "Form Accessibility"

# Run only keyboard navigation tests
npx playwright test -g "Keyboard Navigation"
```

### Run Tests for Specific Pages

```bash
# Test only login page
npx playwright test -g "login page"

# Test only dashboard
npx playwright test -g "dashboard"
```

## Test Coverage

### Current Test Suites

#### 1. Public Pages
- `/login` - Login page accessibility
- `/signup` - Signup page accessibility

#### 2. Dashboard Pages
- `/dashboard` - Main dashboard
- `/plans` - Strategic plans listing
- `/finance` - Finance dashboard

#### 3. Admin Pages
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/departments` - Department management
- `/admin/audit-logs` - Audit logs
- `/admin/settings` - Settings page

#### 4. Component-Specific Tests
- Form labels and ARIA attributes
- Button keyboard accessibility
- Navigation keyboard accessibility

#### 5. Color Contrast Tests
- Text contrast ratios (WCAG AA)
- Gray color palette compliance

#### 6. Keyboard Navigation Tests
- Tab order and reachability
- Focus visibility

#### 7. Screen Reader Support
- Image alt text
- Heading structure
- Landmark regions

#### 8. Form Accessibility
- Input labels
- Required field marking
- Error message association

## Understanding Results

### Test Output Format

When tests run, you'll see output like:

```bash
✓ Public Pages › login page should not have accessibility violations (1.2s)
✗ Dashboard Pages › dashboard should not have accessibility violations (0.8s)
  
  Expected: []
  Received: [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Elements must have sufficient color contrast",
      "nodes": [...]
    }
  ]
```

### Violation Severity Levels

1. **Critical** 🔴
   - Must fix immediately
   - Blocks basic functionality
   - Example: Missing form labels

2. **Serious** 🟠
   - Should fix soon
   - Significantly impacts users
   - Example: Insufficient color contrast

3. **Moderate** 🟡
   - Fix when possible
   - Causes inconvenience
   - Example: Missing ARIA landmarks

4. **Minor** 🟢
   - Enhancement
   - Minimal impact
   - Example: Redundant alt text

### Reading Violation Reports

Each violation includes:

```typescript
{
  id: "color-contrast",              // Unique violation ID
  impact: "serious",                  // Severity: critical, serious, moderate, minor
  description: "Elements must...",    // What's wrong
  help: "Ensure sufficient contrast", // How to fix
  helpUrl: "https://...",            // Detailed guidance
  nodes: [                           // Affected elements
    {
      html: "<div>...</div>",        // Element HTML
      target: [".text-gray-400"],    // CSS selector
      failureSummary: "..."          // Why it failed
    }
  ]
}
```

## Fixing Violations

### Common Violations and Fixes

#### 1. Color Contrast Issues

**Problem:**
```typescript
{
  id: "color-contrast",
  description: "Text has insufficient contrast ratio"
}
```

**Fix:**
```tsx
// Before (4.2:1 contrast)
<p className="text-gray-400">Low contrast text</p>

// After (7.1:1 contrast)
<p className="text-gray-700">Good contrast text</p>
```

**Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools > Elements > Accessibility

#### 2. Missing Form Labels

**Problem:**
```typescript
{
  id: "label",
  description: "Form elements must have labels"
}
```

**Fix:**
```tsx
// Before
<input type="email" placeholder="Email" />

// After - Option 1: Visible label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// After - Option 2: ARIA label
<input type="email" aria-label="Email address" />
```

#### 3. Missing Alt Text

**Problem:**
```typescript
{
  id: "image-alt",
  description: "Images must have alternate text"
}
```

**Fix:**
```tsx
// Before
<img src="/logo.png" />

// After - Descriptive alt
<img src="/logo.png" alt="Company logo" />

// Decorative images
<img src="/decorative.png" alt="" role="presentation" />
```

#### 4. Improper Heading Structure

**Problem:**
```typescript
{
  id: "heading-order",
  description: "Heading levels should increase by one"
}
```

**Fix:**
```tsx
// Before
<h1>Page Title</h1>
<h3>Section</h3>  // Skipped h2

// After
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

#### 5. Missing Landmarks

**Problem:**
```typescript
{
  id: "region",
  description: "Page must have landmark regions"
}
```

**Fix:**
```tsx
// Add semantic HTML5 landmarks
<main id="main-content">
  <header>
    <nav aria-label="Main navigation">
      {/* navigation */}
    </nav>
  </header>
  
  <article>
    {/* main content */}
  </article>
  
  <aside aria-label="Sidebar">
    {/* sidebar */}
  </aside>
  
  <footer>
    {/* footer */}
  </footer>
</main>
```

#### 6. Focus Not Visible

**Problem:**
```typescript
{
  id: "focus-visible",
  description: "Focus indicator must be visible"
}
```

**Fix:**
```css
/* Already implemented in globals.css */
:focus-visible {
  outline: none;
  ring: 2px solid var(--focus-ring-color);
  ring-offset: 2px;
}
```

## Best Practices

### 1. Test During Development

Run accessibility tests frequently:
```bash
# Quick check
npm run test:a11y:headed

# Full suite
npm run test:a11y
```

### 2. Fix Violations by Priority

1. **Critical** violations first (block basic functionality)
2. **Serious** violations next (significant impact)
3. **Moderate** and **Minor** as time permits

### 3. Test with Real Users

Automated tests catch ~50-60% of accessibility issues. Also test with:
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- High contrast mode
- Zoom (200-400%)
- Users with disabilities

### 4. Use Semantic HTML

```tsx
// Good
<nav>, <main>, <article>, <aside>, <footer>, <button>, <a>

// Avoid
<div onClick>, <span onClick>
```

### 5. Always Provide Text Alternatives

```tsx
// Icons with actions
<button aria-label="Delete user">
  <TrashIcon />
</button>

// Images
<img src="chart.png" alt="Sales increased 25% in Q3" />

// Charts and graphs
<div role="img" aria-label="Bar chart showing...">
  <svg>...</svg>
</div>
```

### 6. Maintain Focus Order

```tsx
// Tab order should follow visual order
<form>
  <input name="firstName" />  {/* Tab 1 */}
  <input name="lastName" />   {/* Tab 2 */}
  <input name="email" />      {/* Tab 3 */}
  <button type="submit">      {/* Tab 4 */}
    Submit
  </button>
</form>
```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/ci.yml`:

```yaml
- name: Run Accessibility Tests
  run: npm run test:a11y
  
- name: Upload Accessibility Report
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: accessibility-report
    path: playwright-report/
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run accessibility tests on changed pages
npm run test:a11y
```

### Continuous Monitoring

Consider integrating:
- [Pa11y CI](https://github.com/pa11y/pa11y-ci) - Scheduled scans
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Performance + A11y
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension

## Troubleshooting

### Tests Fail Due to Authentication

If tests fail because pages require authentication:

1. Create test user credentials
2. Add authentication helper:

```typescript
// tests/helpers/auth.ts
export async function authenticateUser(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}
```

3. Use in tests:

```typescript
test.beforeEach(async ({ page }) => {
  await authenticateUser(page)
  await page.goto('/admin/users')
})
```

### False Positives

If you get false positives, you can exclude specific elements:

```typescript
const accessibilityScanResults = await new AxeBuilder({ page })
  .exclude('#third-party-widget') // Exclude specific elements
  .exclude('.recaptcha')
  .analyze()
```

### Custom Rules

To test custom rules:

```typescript
const accessibilityScanResults = await new AxeBuilder({ page })
  .withRules(['color-contrast', 'label', 'button-name'])
  .analyze()
```

## Resources

### Official Documentation
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/master/doc/rule-descriptions.md)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Learning Resources
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Support

For questions or issues:
1. Check the [axe-core documentation](https://github.com/dequelabs/axe-core)
2. Review violation help URLs in test output
3. Create a ticket with [A11Y] prefix
4. Consult with UX/accessibility team

---

**Last Updated**: October 17, 2025  
**Maintained By**: Development Team  
**Review Schedule**: Quarterly
