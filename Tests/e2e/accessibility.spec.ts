import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility Test Suite
 * 
 * Tests WCAG 2.1 AA compliance across all major pages
 * using axe-core automated accessibility testing.
 */

test.describe('Accessibility Tests', () => {
  test.describe('Public Pages', () => {
    test('login page should not have accessibility violations', async ({ page }) => {
      await page.goto('/login')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('signup page should not have accessibility violations', async ({ page }) => {
      await page.goto('/signup')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  })

  test.describe('Dashboard Pages (Authenticated)', () => {
    test.beforeEach(async ({ page }) => {
      // TODO: Add authentication flow
      // For now, we'll test the public structure
      await page.goto('/dashboard')
    })

    test('dashboard should not have accessibility violations', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('strategic plans page should not have accessibility violations', async ({ page }) => {
      await page.goto('/plans')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('finance page should not have accessibility violations', async ({ page }) => {
      await page.goto('/finance')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  })

  test.describe('Admin Pages', () => {
    test.beforeEach(async ({ page }) => {
      // TODO: Add admin authentication flow
      await page.goto('/admin')
    })

    test('admin dashboard should not have accessibility violations', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('users page should not have accessibility violations', async ({ page }) => {
      await page.goto('/admin/users')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('departments page should not have accessibility violations', async ({ page }) => {
      await page.goto('/admin/departments')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('audit logs page should not have accessibility violations', async ({ page }) => {
      await page.goto('/admin/audit-logs')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('settings page should not have accessibility violations', async ({ page }) => {
      await page.goto('/admin/settings')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  })

  test.describe('Component-Specific Tests', () => {
    test('forms should have proper labels and ARIA attributes', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      // Check that inputs have associated labels (either via label element or aria-label)
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toHaveAttribute('id')
      const emailId = await emailInput.getAttribute('id')
      const emailLabel = page.locator(`label[for="${emailId}"]`)
      await expect(emailLabel).toBeVisible()
      
      const passwordInput = page.locator('input[type="password"]')
      await expect(passwordInput).toHaveAttribute('id')
      const passwordId = await passwordInput.getAttribute('id')
      const passwordLabel = page.locator(`label[for="${passwordId}"]`)
      await expect(passwordLabel).toBeVisible()
      
      // Check for proper ARIA attributes
      await expect(emailInput).toHaveAttribute('required')
      await expect(passwordInput).toHaveAttribute('required')
    })

    test('buttons should be keyboard accessible', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      // Tab through form fields to submit button
      await page.keyboard.press('Tab') // Email input
      await page.keyboard.press('Tab') // Password input
      await page.keyboard.press('Tab') // Submit button
      
      // Check if button is focused
      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeFocused()
    })

    test('links should be keyboard accessible', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      // Tab through page to find links
      let focusedElement = null
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
        focusedElement = await page.evaluate(() => document.activeElement?.tagName)
        if (focusedElement === 'A') break
      }
      
      // Should have found a link
      expect(focusedElement).toBe('A')
    })
  })

  test.describe('Color Contrast', () => {
    test('text should meet WCAG AA contrast requirements', async ({ page }) => {
      await page.goto('/dashboard')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('.text-gray-600')
        .include('.text-gray-700')
        .include('.text-gray-900')
        .analyze()

      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      )
      
      expect(contrastViolations).toHaveLength(0)
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('all interactive elements should be reachable by keyboard on login page', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      // Start tabbing through login form
      const tabbableElements = []
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab')
        const focused = await page.evaluate(() => document.activeElement?.tagName)
        tabbableElements.push(focused)
      }
      
      // Should have tabbed through multiple elements (inputs, button, links)
      const uniqueElements = new Set(tabbableElements.filter(el => el !== 'BODY'))
      expect(uniqueElements.size).toBeGreaterThan(2)
    })

    test('focus should be visible on all interactive elements', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze()

      const focusViolations = (accessibilityScanResults.violations || []).filter(
        v => v.id === 'focus-visible' || v.id === 'focus-order-semantics'
      )
      
      expect(focusViolations.length).toBe(0)
    })
  })

  test.describe('Screen Reader Support', () => {
    test('images should have alt text', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze()

      const imageAltViolations = (accessibilityScanResults.violations || []).filter(
        v => v.id === 'image-alt'
      )
      
      expect(imageAltViolations.length).toBe(0)
    })

    test('page should have proper heading structure', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      // Check for h1 or h2
      const h1Count = await page.locator('h1').count()
      const h2Count = await page.locator('h2').count()
      expect(h1Count + h2Count).toBeGreaterThan(0)
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['best-practice'])
        .analyze()

      const headingViolations = (accessibilityScanResults.violations || []).filter(
        v => v.id.includes('heading')
      )
      
      expect(headingViolations.length).toBe(0)
    })

    test('public pages should have proper landmark regions', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      // Check that page has basic structure
      const main = await page.locator('main, [role="main"]').count()
      expect(main).toBeGreaterThan(0)
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['best-practice'])
        .analyze()

      // Check for landmark violations
      const landmarkViolations = (accessibilityScanResults.violations || []).filter(
        v => v.id === 'region' || v.id === 'landmark-one-main'
      )
      
      // If there are violations, log them for debugging
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

  test.describe('Form Accessibility', () => {
    test('form inputs should have labels', async ({ page }) => {
      await page.goto('/login')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze()

      const labelViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'label' || v.id === 'label-title-only'
      )
      
      expect(labelViolations).toHaveLength(0)
    })

    test('required fields should be properly marked', async ({ page }) => {
      await page.goto('/login')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze()

      const requiredViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'aria-required-attr'
      )
      
      expect(requiredViolations).toHaveLength(0)
    })

    test('error messages should be associated with inputs', async ({ page }) => {
      await page.goto('/login')
      
      // Submit form with empty fields to trigger errors
      await page.click('button[type="submit"]')
      await page.waitForTimeout(500)
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze()

      const errorViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'aria-errormessage' || v.id === 'aria-invalid'
      )
      
      expect(errorViolations).toHaveLength(0)
    })
  })
})

/**
 * Helper function to log accessibility violations for debugging
 */
async function logViolations(violations: any[]) {
  if (violations.length > 0) {
    console.log('\n❌ Accessibility Violations Found:\n')
    violations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.id}`)
      console.log(`   Impact: ${violation.impact}`)
      console.log(`   Description: ${violation.description}`)
      console.log(`   Help: ${violation.helpUrl}`)
      console.log(`   Elements affected: ${violation.nodes.length}`)
      violation.nodes.forEach((node: any) => {
        console.log(`   - ${node.html}`)
      })
    })
  }
}
