import { test, expect, type Page } from '@playwright/test';

/**
 * Mobile regression net for the layout defects the mobile overhaul fixed.
 *
 * Runs under the `mobile-390` and `mobile-360` Playwright projects. Public
 * routes always run; the dashboard block needs PLAYWRIGHT_TEST_EMAIL and
 * PLAYWRIGHT_TEST_PASSWORD and skips without them.
 */

const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/about',
  '/contact',
  '/help',
  '/mobile-app',
  '/terms',
  '/privacy',
  '/login',
  '/signup',
];

/**
 * `networkidle` never fires on pages with analytics beacons, so wait for load
 * plus a beat for entrance animations to land on their final geometry.
 */
async function open(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  return response;
}

for (const route of PUBLIC_ROUTES) {
  test(`${route} has no horizontal overflow`, async ({ page }) => {
    const response = await open(page, route);
    expect(response?.status() ?? 200).toBeLessThan(400);

    const { scrollWidth, innerWidth, offenders } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      // Name the widest offenders so a failure points at a selector rather
      // than just a pixel count.
      offenders: Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          const style = getComputedStyle(el);
          if (style.position === 'fixed' || style.visibility === 'hidden') return false;
          return rect.right > window.innerWidth + 1;
        })
        .slice(0, 5)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          const cls = String(el.className || '').slice(0, 60);
          return `${el.tagName.toLowerCase()}.${cls} → ${Math.round(rect.right)}px`;
        }),
    }));

    expect(
      scrollWidth,
      `scrolls horizontally by ${scrollWidth - innerWidth}px. Widest: ${offenders.join(' | ')}`
    ).toBeLessThanOrEqual(innerWidth + 1);
  });

  test(`${route} form controls do not trigger iOS zoom`, async ({ page }) => {
    await open(page, route);

    // Safari zooms the whole page whenever a focused field renders below 16px.
    const undersized = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('input, textarea, select'))
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          if ((el as HTMLInputElement).type === 'hidden') return false;
          return parseFloat(getComputedStyle(el).fontSize) < 16;
        })
        .map((el) => {
          const label = (el as HTMLInputElement).name || String(el.className || '').slice(0, 40);
          return `${el.tagName.toLowerCase()}[${label}] @ ${getComputedStyle(el).fontSize}`;
        })
    );

    expect(undersized, `fields below 16px: ${undersized.join(' | ')}`).toEqual([]);
  });
}

test('landing page controls meet the 44px touch target minimum', async ({ page }) => {
  await open(page, '/');

  const undersized = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('main a[href], main button'))
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        // Inline links inside prose are text, not tap targets.
        if (getComputedStyle(el).display.startsWith('inline')) return false;
        return rect.height < 44;
      })
      .slice(0, 10)
      .map(
        (el) =>
          `${el.tagName.toLowerCase()}"${el.textContent?.trim().slice(0, 25)}" h=${Math.round(el.getBoundingClientRect().height)}`
      )
  );

  expect(undersized, `controls under 44px: ${undersized.join(' | ')}`).toEqual([]);
});

/**
 * Reports fixed/sticky overlays sitting on top of the bottom tab bar, or null
 * when the route has no tab bar (marketing, auth).
 */
async function bottomNavCollisions(page: Page) {
  return page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>('[data-bottom-nav]');
    if (!nav) return null;
    const navRect = nav.getBoundingClientRect();

    return Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter((el) => {
        if (el === nav || nav.contains(el) || el.contains(nav)) return false;
        const style = getComputedStyle(el);
        if (style.position !== 'fixed' && style.position !== 'sticky') return false;
        if (style.visibility === 'hidden' || style.opacity === '0') return false;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        // A full-screen backdrop is meant to cover the nav; not a collision.
        if (rect.height >= window.innerHeight - 1) return false;
        return rect.bottom > navRect.top && rect.top < navRect.bottom;
      })
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className || '').slice(0, 50)}`);
  });
}

const DASHBOARD_ROUTES = [
  '/dashboard/overview',
  '/dashboard/copilot',
  '/dashboard/roadmap',
  '/dashboard/canvas',
  '/dashboard/content-calendar',
  '/dashboard/scripts',
  '/dashboard/account',
  '/dashboard/help',
];

/**
 * The bottom-nav collision check and the dashboard layouts only exist behind a
 * session, so this block needs a throwaway test account. Set
 * PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD to run it; without them
 * the suite skips instead of reporting false green.
 */
test.describe('authenticated dashboard', () => {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

  test.skip(!email || !password, 'set PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD to run');
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await open(page, '/login');

    // A live session redirects /login straight to the dashboard, in which case
    // there is no form to fill.
    const emailField = page.locator('input[type="email"]').first();
    if (!(await emailField.isVisible().catch(() => false))) return;

    await emailField.fill(email!);
    await page.locator('input[type="password"]').first().fill(password!);
    await page.locator('form button[type="submit"]').first().click();
    await page.waitForURL(/\/dashboard|\/new-project/, { timeout: 30000 });
  });

  for (const route of DASHBOARD_ROUTES) {
    test(`${route} is clean at this width`, async ({ page }) => {
      await open(page, route);

      const scroll = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(
        scroll.scrollWidth,
        `scrolls horizontally by ${scroll.scrollWidth - scroll.innerWidth}px`
      ).toBeLessThanOrEqual(scroll.innerWidth + 1);

      const collisions = await bottomNavCollisions(page);
      expect(collisions, 'bottom tab bar missing — the shell did not render').not.toBeNull();
      expect(collisions, `overlays intersecting the tab bar: ${collisions?.join(' | ')}`).toEqual(
        []
      );
    });
  }

  test('the tour does not auto-start', async ({ page }) => {
    await open(page, '/dashboard/overview');
    await page.waitForTimeout(4000);
    await expect(page.locator('[data-tour-tooltip]')).toHaveCount(0);
  });
});
