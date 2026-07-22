import { test, expect } from '@playwright/test';

test.describe('Karnex Production Landing Page & Visual QA', () => {

  test('Homepage loads correctly with Persian titles and SEO metadata', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Verify Title
    await expect(page).toHaveTitle(/کارنکس/);

    // Verify Meta Description
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /هم‌بنیان‌گذار هوشمند/);

    // Verify Main Heading (h1)
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('از ایده تا');

    // Verify RTL direction
    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');

    // Verify logo and brand title
    const logoText = page.locator('header').getByText('کارنکس', { exact: true });
    await expect(logoText.first()).toBeVisible();

    // Verify CTA Buttons exist
    const ctaSignup = page.locator('header').getByRole('button', { name: /شروع رایگان/i });
    await expect(ctaSignup.first()).toBeVisible();
  });

  test('Landing page navigation links exist and have valid targets', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('header nav');
    await expect(nav).toBeVisible();

    // Check pricing link
    const pricingLink = nav.getByRole('link', { name: /تعرفه‌ها/i });
    await expect(pricingLink).toHaveAttribute('href', '/#pricing');

    // Check mobile app link
    const mobileLink = nav.getByRole('link', { name: /نسخه موبایل/i });
    await expect(mobileLink).toHaveAttribute('href', '/mobile-app');

    // Check contact support link
    const contactLink = nav.getByRole('link', { name: /پشتیبانی/i });
    await expect(contactLink).toHaveAttribute('href', '/contact');
  });

  test('Pricing section renders all plans correctly', async ({ page }) => {
    await page.goto('/#pricing');

    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();

    // Verify Free, Pro (299k), Team (699k) plans exist
    await expect(pricingSection).toContainText('رایگان');
    await expect(pricingSection).toContainText('پرو');
    await expect(pricingSection).toContainText('تیم');
  });

  test('FAQ accordion opens and displays answers', async ({ page }) => {
    await page.goto('/#faq');

    const faqSection = page.locator('#faq');
    await expect(faqSection).toBeVisible();

    // Verify FAQ question text exists
    await expect(faqSection).toContainText('کارنکس چیست');
  });
});
