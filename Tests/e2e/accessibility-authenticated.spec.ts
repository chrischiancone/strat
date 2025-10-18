import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { authenticateUser } from '../helpers/auth'

/**
 * Authenticated Accessibility Test Suite
 * 
 * Tests WCAG 2.1 AA compliance on pages that require authentication.
 * These tests will log in as admin@carrollton.gov before running.
 */

test.describe('Authenticated Accessibility Tests', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page)
  })

  test.describe('Dashboard Pages', () => {
    test('main dashboard should not have accessibility violations', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('strategic plans page should not have accessibility violations', async ({ page }) => {
      await page.goto('/plans')
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('finance page should not have accessibility violations', async ({ page }) => {
      await page.goto('/finance')
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  })

  test.describe('Admin Pages', () => {
    test('admin dashboard should not have accessibility violations', async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('users page should not have accessibility violations', async ({ page }) => {
      await page.goto('/admin/users')
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('departments page should not have accessibility violations', async ({ page }) => {
      await page.goto('/admin/departments')
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('audit logs page should not have accessibility violations', async ({ page }) => {
      await page.goto('/admin/audit-logs')
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('settings page should not have accessibility violations', async ({ page }) => {
      await page.goto('/admin/settings')
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  })

  test.describe('Dashboard Navigation', () => {
    test('sidebar navigation should be keyboard accessible', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Tab through navigation items
      const tabbableElements = []
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab')
        const focused = await page.evaluate(() => document.activeElement?.tagName)
        tabbableElements.push(focused)
      }
      
      // Should have tabbed through multiple navigation links
      const uniqueElements = new Set(tabbableElements.filter(el => el !== 'BODY'))
      expect(uniqueElements.size).toBeGreaterThan(3)
    })

    test('dashboard should have proper landmark regions', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Check for required landmarks
      const main = await page.locator('main').count()
      const header = await page.locator('header').count()
      const nav = await page.locator('nav').count()
      
      expect(main).toBeGreaterThan(0)
      expect(header).toBeGreaterThan(0)
      expect(nav).toBeGreaterThan(0)
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['best-practice'])
        .analyze()

      const landmarkViolations = (accessibilityScanResults.violations || []).filter(
        v => v.id === 'region' || v.id === 'landmark-one-main'
      )
      
      if (landmarkViolations.length > 0) {
        console.log('\n⚠️ Landmark violations found:')
        landmarkViolations.forEach(v => {
          console.log(`  - ${v.id}: ${v.description}`)
          console.log(`    Impact: ${v.impact}`)
          console.log(`    Help: ${v.helpUrl}`)
        })
      }
      
      expect(landmarkViolations.length).toBe(0)
    })
  })

  test.describe('Data Tables', () => {
    test('users table should be accessible', async ({ page }) => {
      await page.goto('/admin/users')
      await page.waitForLoadState('networkidle')
      
      // Check for table accessibility
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      const tableViolations = (accessibilityScanResults.violations || []).filter(
        v => v.id.includes('table') || v.id === 'th-has-data-cells'
      )
      
      expect(tableViolations.length).toBe(0)
    })
  })
})
