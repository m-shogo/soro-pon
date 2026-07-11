import { defineConfig, devices } from '@playwright/test';

// visual regression(H9/P1-2)。ADR-014参照。
// ビルド済みアプリ(vite preview)に対して撮影する。baselineはdarwinローカル。
export default defineConfig({
  testDir: 'tests/visual',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:4173',
    // motionを止めて決定的にする(reduced-motion対応の検証も兼ねる)
    contextOptions: { reducedMotion: 'reduce' },
    deviceScaleFactor: 1,
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
