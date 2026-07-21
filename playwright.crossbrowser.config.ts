import { defineConfig, devices } from '@playwright/test';

// Batch 7: Cross-Browser & Screen Reader Acceptance (RC scope extension).
// Deliberately a SEPARATE config file from playwright.config.ts, so the
// existing 70 Chromium baselines (managed by playwright.config.ts) are
// never touched by adding Firefox/WebKit projects here — no shared
// `projects` array, no shared snapshot naming scheme, zero risk of
// accidentally tripling or renaming the existing Chromium suite.
//
// "webkit" below is Playwright's WebKit engine, not real Safari. Do not
// describe results from this config as "Safari" or "iOS Safari" — see
// docs/qa/BATCH-7-CROSS-BROWSER-A11Y-REPORT.md for the exact scope.
export default defineConfig({
  testDir: 'tests/visual-crossbrowser',
  fullyParallel: true,
  reporter: [['list']],
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], contextOptions: { reducedMotion: 'reduce' }, deviceScaleFactor: 1 },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], contextOptions: { reducedMotion: 'reduce' }, deviceScaleFactor: 1 },
    },
  ],
  use: {
    baseURL: 'http://localhost:4173',
  },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    },
  },
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
