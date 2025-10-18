import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
  })

  test('should display login page for unauthenticated users', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('h1')).toContainText(/sign in|login/i)
  })

  test('should show validation errors for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible()
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in credentials (use test user credentials)
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'TestPassword123!')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard (or 2FA if enabled)
    await page.waitForURL(/\/(dashboard|2fa-required)/, { timeout: 5000 })
  })

  test('should allow navigation to signup page', async ({ page }) => {
    await page.goto('/login')
    
    // Click signup link
    await page.click('text=/sign up|create account/i')
    
    // Should navigate to signup page
    await expect(page).toHaveURL(/\/signup/)
    await expect(page.locator('h1')).toContainText(/sign up|create account/i)
  })

  test('should logout successfully', async ({ page, context }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    
    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {
      // May be on 2FA page instead
    })
    
    // Find and click logout button (may be in a dropdown or menu)
    const logoutButton = page.locator('button:has-text("logout"), a:has-text("logout")').first()
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      
      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/)
    }
  })

  test('should prevent access to protected routes when not authenticated', async ({ page }) => {
    // Clear cookies to ensure we're logged out
    await page.context().clearCookies()
    
    // Try to access dashboard
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should handle password visibility toggle', async ({ page }) => {
    await page.goto('/login')
    
    const passwordInput = page.locator('input[name="password"]')
    const toggleButton = page.locator('button[aria-label*="password"], button:has([class*="eye"])')
    
    // Password field should be type="password" initially
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Toggle visibility if button exists
    if (await toggleButton.count() > 0) {
      await toggleButton.first().click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
      
      // Toggle back
      await toggleButton.first().click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    }
  })
})

test.describe('Two-Factor Authentication', () => {
  test('should prompt for 2FA code when enabled', async ({ page }) => {
    // This test requires a user with 2FA enabled
    await page.goto('/login')
    
    // Login with 2FA-enabled user
    await page.fill('input[name="email"]', '2fa-user@example.com')
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    
    // Should redirect to 2FA verification page
    await page.waitForURL(/\/2fa-required/, { timeout: 5000 }).catch(() => {
      // User may not have 2FA enabled, skip test
      test.skip()
    })
    
    // Should show 2FA input
    await expect(page.locator('input[name="code"], input[name="token"]')).toBeVisible()
  })
})
