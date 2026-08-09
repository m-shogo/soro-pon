import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;
const CAPTURE_DIR = 'test-results/batch14-review';

type SkinId = (typeof SKINS)[number];
type CaptureSize = (typeof SIZES)[number];

async function boot(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript(({ skinId }) => {
    // Keep the seed/session deterministic while preserving the production state path.
    Date.now = () => 1_700_000_230_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);

    // Match progression uses timeouts only to pace CPU/flow presentation. Cap those
    // waits in this evidence run so we can reach the real engine Result state quickly;
    // no match state/action/result is injected or mutated by the test.
    const nativeSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
      nativeSetTimeout(handler, Math.min(Number(timeout ?? 0), 8), ...args)) as typeof window.setTimeout;
  }, { skinId: skin });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);
}

async function expectViewportContract(page: Page) {
  const result = await page.evaluate(() => {
    const viewport = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
    const controls = [
      ...document.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary',
      ),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
    });

    return {
      overflow:
        document.documentElement.scrollWidth > viewport.width + 1 ||
        document.documentElement.scrollHeight > viewport.height + 1,
      tooSmall: controls
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width < 24 || rect.height < 24;
        })
        .map((element) => element.getAttribute('aria-label') ?? element.textContent?.trim() ?? element.tagName),
    };
  });

  expect(result.overflow).toBe(false);
  expect(result.tooSmall).toEqual([]);
}

async function playRealMatchToResult(page: Page) {
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await expect(page.getByRole('heading', { name: '対局設定' })).toBeVisible();
  await page.getByRole('button', { name: '3人戦', exact: true }).click();
  await page.getByRole('button', { name: '3人戦をはじめる' }).click();
  await expect(page.getByRole('main', { name: '3人戦の対局卓' })).toBeVisible();

  for (let step = 0; step < 240; step += 1) {
    if (await page.getByRole('heading', { name: '対戦結果' }).isVisible().catch(() => false)) {
      return;
    }

    const tsumo = page.getByRole('button', { name: 'ツモ', exact: true });
    if (await tsumo.isVisible().catch(() => false)) {
      await tsumo.click();
      continue;
    }

    const ron = page.getByRole('button', { name: 'ロン', exact: true });
    if (await ron.isVisible().catch(() => false)) {
      await ron.click();
      continue;
    }

    const firstPlayableTile = page.locator('.sp-self-hand-zone .sp-tile:not([disabled])').first();
    if (await firstPlayableTile.isVisible().catch(() => false)) {
      await firstPlayableTile.click();
      const discard = page.getByRole('button', { name: '捨てる', exact: true });
      if (await discard.isVisible().catch(() => false)) {
        await discard.click();
      }
    }

    await page.waitForTimeout(10);
  }

  throw new Error('実対局を240操作以内にResultまで進行できませんでした');
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`${skin} ${size.label} real-match result review`, async ({ page }) => {
      test.setTimeout(45_000);
      await boot(page, skin, size);
      await playRealMatchToResult(page);

      await expect(page.getByRole('heading', { name: '対戦結果' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'もう一局' })).toBeVisible();
      await expect(page.getByRole('button', { name: '記憶帳を見る' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'TOPへ' })).toBeVisible();
      await expectViewportContract(page);

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `result-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
}
