import { test, expect } from '@playwright/test';

test.describe('Karnex Auth Flow & Security Protection QA', () => {

  test('/login page renders correctly with email/password form & Google OAuth option', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);

    // Check heading or title
    await expect(page).toHaveTitle(/ورود|کارنکس/);

    // Check inputs exist
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Check submit button "ورود به حساب"
    const submitBtn = page.getByRole('button', { name: /ورود به حساب/i });
    await expect(submitBtn).toBeVisible();

    // Check Google login option
    const googleBtn = page.getByText(/ورود با حساب گوگل/i);
    await expect(googleBtn).toBeVisible();
  });

  test('/signup page renders correctly with registration form', async ({ page }) => {
    const response = await page.goto('/signup');
    expect(response?.status()).toBe(200);

    // Check inputs
    const nameInput = page.locator('input[placeholder*="علی"]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.getByRole('button', { name: /ساخت حساب کاربری/i });

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('Invalid login attempt triggers form submission', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.getByRole('button', { name: /ورود به حساب/i });

    await emailInput.fill('nonexistent-test-user-999@karnex.ir');
    await passwordInput.fill('WrongPassword123!');
    await submitBtn.click();

    // Wait up to 15s for response or spinner state
    await page.waitForTimeout(3000);
    // Page URL remains on /login because auth failed
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated access to protected dashboard routes redirects to /login', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/canvas',
      '/dashboard/pitch-deck',
      '/dashboard/settings',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      // Middleware should redirect to /login
      await expect(page).toHaveURL(/\/login/);
    }
  });

});
