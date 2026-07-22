import { test, expect } from '@playwright/test';

test.describe('Karnex Public Pages & Static Content QA', () => {

  test('/mobile-app page renders PWA/Mobile details', async ({ page }) => {
    const response = await page.goto('/mobile-app');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/موبایل|کارنکس/);
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('/about page renders company & mission info', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/درباره|کارنکس/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/contact page renders support form', async ({ page }) => {
    const response = await page.goto('/contact');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/تماس|پشتیبانی|کارنکس/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/help page renders knowledge base search & guides', async ({ page }) => {
    const response = await page.goto('/help');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/راهنما|کارنکس/);
  });

  test('404 Not Found handling for invalid URLs', async ({ page }) => {
    const response = await page.goto('/non-existent-page-test-12345');
    // Should render custom 404 page with 404 status
    expect(response?.status()).toBe(404);
  });

});
