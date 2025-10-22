import { Page } from '@playwright/test'

/**
 * Authentication credentials for testing
 */
export const TEST_USER = {
  email: 'admin@carrollton.gov',
  password: 'admin123',
}

/**
 * Authenticate a user for testing protected pages
 * 
 * @param page - Playwright page object
 * @param email - User email (defaults to TEST_USER.email)
 * @param password - User password (defaults to TEST_USER.password)
 */
export async function authenticateUser(
  page: Page,
  email: string = TEST_USER.email,
  password: string = TEST_USER.password
) {
  console.log(`🔐 Authenticating as: ${email}`)
  
  // Navigate to login page
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  console.log('✓ Login page loaded')

  // Fill in credentials
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  console.log('✓ Credentials entered')

  // Submit form
  await page.click('button[type="submit"]')
  console.log('✓ Login form submitted')

  // Wait for navigation to complete
  try {
    // Wait for either dashboard, 2FA page, or any other page (longer timeout)
    await page.waitForURL(/\/(dashboard|auth\/2fa|plans|admin|finance)/, { timeout: 10000 })
    console.log(`✓ Navigated to: ${page.url()}`)
  } catch (error) {
    // If timeout, check current state
    const currentUrl = page.url()
    console.log(`⚠️  Current URL after timeout: ${currentUrl}`)
    
    // Check for error messages on the page
    const errorMessage = await page.locator('[role="alert"], .text-red-800, .text-red-600').first().textContent().catch(() => null)
    if (errorMessage) {
      console.log(`❌ Login error message: ${errorMessage}`)
      throw new Error(`Authentication failed: ${errorMessage}`)
    }
    
    if (currentUrl.includes('/login')) {
      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/auth-failure.png' })
      throw new Error('Authentication failed - still on login page after 10 seconds')
    }
    
    // If we're on a different page, consider it successful
    console.log('⚠️  Not on expected URL but not on login either, continuing...')
  }

  // Additional wait for page to be ready
  await page.waitForLoadState('networkidle')
  console.log('✓ Authentication complete\n')
}

/**
 * Check if user is authenticated
 * 
 * @param page - Playwright page object
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const url = page.url()
  return !url.includes('/login') && !url.includes('/signup')
}

/**
 * Sign out the current user
 * 
 * @param page - Playwright page object
 */
export async function signOut(page: Page) {
  // Click user menu
  await page.click('button:has-text("User"), [aria-label*="User"]')
  
  // Click sign out
  await page.click('button:has-text("Sign out")')
  
  // Wait for redirect to login
  await page.waitForURL('/login')
}
