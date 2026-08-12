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
    Date.now = () => 1_700_000_220_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, { skinId: skin });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);
}

async function expectViewportContract(page: Page) {
  const result = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
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
        document.documentElement.scrollWidth > width + 1 ||
        document.documentElement.scrollHeight > height + 1,
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

async function expectCompactCollectionGeometry(page: Page) {
  const geometry = await page.evaluate(() => {
    const body = document.querySelector<HTMLElement>('.sp-collection-screen__body');
    const main = document.querySelector<HTMLElement>('.sp-collection-screen__main');
    const recent = document.querySelector<HTMLElement>('.sp-collection-screen__recent');
    const emptyScoreboard = document.querySelector<HTMLElement>('.sp-collection-scoreboard--empty');
    const emptyMessage = emptyScoreboard?.querySelector<HTMLElement>('.sp-collection-empty') ?? null;
    const clearBoard = document.querySelector<HTMLElement>('.sp-clear-board');
    const clearCells = [...document.querySelectorAll<HTMLElement>('.sp-clear-board__cell')];
    if (!body || !main || !recent || !emptyScoreboard || !emptyMessage || !clearBoard) return null;

    const bodyRect = body.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    const recentRect = recent.getBoundingClientRect();
    const scoreboardRect = emptyScoreboard.getBoundingClientRect();
    const messageRect = emptyMessage.getBoundingClientRect();
    const clearStyle = getComputedStyle(clearBoard);
    return {
      bodyWidth: bodyRect.width,
      mainWidth: mainRect.width,
      recentWidth: recentRect.width,
      recentHeight: recentRect.height,
      recentBelowMain: recentRect.top >= mainRect.bottom - 1,
      emptyScoreboardHeight: scoreboardRect.height,
      emptyScoreboardNeedsScroll:
        emptyScoreboard.scrollWidth > emptyScoreboard.clientWidth + 1 ||
        emptyScoreboard.scrollHeight > emptyScoreboard.clientHeight + 1,
      emptyMessageVisible: messageRect.width > 0 && messageRect.height > 0,
      clearCellCount: clearCells.length,
      clearBoardColumnCount: clearStyle.gridTemplateColumns.split(' ').filter(Boolean).length,
    };
  });

  expect(geometry).not.toBeNull();
  expect((geometry?.mainWidth ?? 0) / (geometry?.bodyWidth ?? 1)).toBeGreaterThanOrEqual(0.95);
  expect((geometry?.recentWidth ?? 0) / (geometry?.bodyWidth ?? 1)).toBeGreaterThanOrEqual(0.95);
  expect(geometry?.recentHeight).toBeLessThanOrEqual(64);
  expect(geometry?.recentBelowMain).toBe(true);
  expect(geometry?.emptyScoreboardHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(38);
  expect(geometry?.emptyScoreboardNeedsScroll).toBe(false);
  expect(geometry?.emptyMessageVisible).toBe(true);
  expect(geometry?.clearCellCount).toBe(25);
  expect(geometry?.clearBoardColumnCount).toBe(5);
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`${skin} ${size.label} collection ledger review`, async ({ page }) => {
      await boot(page, skin, size);
      await page.getByRole('button', { name: /記憶帳/ }).click();
      await expect(page.getByRole('heading', { name: '記憶帳' })).toBeVisible();
      await expectViewportContract(page);
      if (size.label === 'compact') await expectCompactCollectionGeometry(page);

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `collection-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });

      await page.getByRole('button', { name: 'もどる' }).click();
      await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
    });
  }
}
