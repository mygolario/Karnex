import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'e2e-report', open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://www.karnex.ir',
    trace: 'on',
    screenshot: 'on',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
    locale: 'fa-IR',
    timezoneId: 'Asia/Tehran',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /mobile-smoke\.spec\.ts/,
    },
    // Two widths because breakage tends to show up between them: 390 is the
    // common iPhone width, 360 the common Android one, and several grids only
    // overflow at the narrower of the two. Both pinned to chromium so a run
    // needs nothing beyond `playwright install chromium`; the assertions are
    // pure geometry, and the genuinely Safari-specific cases (safe-area,
    // standalone PWA) are covered by the manual device pass.
    {
      name: 'mobile-390',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
      testMatch: /mobile-smoke\.spec\.ts/,
    },
    {
      name: 'mobile-360',
      use: {
        ...devices['Pixel 5'],
        browserName: 'chromium',
        viewport: { width: 360, height: 800 },
      },
      testMatch: /mobile-smoke\.spec\.ts/,
    },
  ],
});
