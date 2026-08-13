import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;
const CAPTURE_DIR = 'test-results/batch14-review';

async function openDeckList(
  page: Page,
  skin: (typeof SKINS)[number],
  size: (typeof SIZES)[number],
) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript((skinId) => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, skin);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await page.getByRole('button', { name: /デッキ一覧/ }).click();
  await expect(page.getByRole('heading', { name: 'デッキ選択' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function inspectHeader(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector<HTMLElement>('.sp-deck-select__header');
    const summary = document.querySelector<HTMLElement>('.sp-deck-select__summary');
    const actions = document.querySelector<HTMLElement>('.sp-deck-select__actions');
    const card = document.querySelector<HTMLElement>('.sp-deck-select-card');
    const tiles = [...document.querySelectorAll<HTMLElement>('.sp-deck-select-card__preview .sp-tile')];
    if (!header || !summary || !actions || !card || tiles.length === 0) return null;

    const summaryCells = [...summary.querySelectorAll<HTMLElement>('span')];
    const buttons = [...actions.querySelectorAll<HTMLElement>('.sp-button')];
    const headerRect = header.getBoundingClientRect();
    const viewport = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
    const radius = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      return Math.max(
        Number.parseFloat(style.borderTopLeftRadius) || 0,
        Number.parseFloat(style.borderTopRightRadius) || 0,
        Number.parseFloat(style.borderBottomLeftRadius) || 0,
        Number.parseFloat(style.borderBottomRightRadius) || 0,
      );
    };
    const withinHeader = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return rect.left >= headerRect.left - 0.5 && rect.right <= headerRect.right + 0.5 &&
        rect.top >= headerRect.top - 0.5 && rect.bottom <= headerRect.bottom + 0.5;
    };

    return {
      summaryCount: summaryCells.length,
      actionCount: buttons.length,
      actionLabels: buttons.map((button) => button.textContent?.trim() ?? ''),
      headerRadius: radius(header),
      summaryGap: Number.parseFloat(getComputedStyle(summary).columnGap) || 0,
      actionGap: Number.parseFloat(getComputedStyle(actions).columnGap) || 0,
      maxSummaryRadius: Math.max(...summaryCells.map(radius)),
      maxActionRadius: Math.max(...buttons.map(radius)),
      allActionShadowless: buttons.every((button) => getComputedStyle(button).boxShadow === 'none'),
      allActionTransparent: buttons.every((button) => getComputedStyle(button).backgroundColor === 'rgba(0, 0, 0, 0)'),
      createAccentWidth: Number.parseFloat(getComputedStyle(buttons[0]).borderBottomWidth) || 0,
      summaryNeedsScroll: summary.scrollWidth > summary.clientWidth + 1 || summary.scrollHeight > summary.clientHeight + 1,
      actionsNeedScroll: actions.scrollWidth > actions.clientWidth + 1 || actions.scrollHeight > actions.clientHeight + 1,
      summaryWithinHeader: withinHeader(summary),
      actionsWithinHeader: withinHeader(actions),
      headerWithinViewport:
        headerRect.left >= -0.5 && headerRect.top >= -0.5 &&
        headerRect.right <= viewport.width + 0.5 && headerRect.bottom <= viewport.height + 0.5,
      cardHeight: card.getBoundingClientRect().height,
      minTileWidth: Math.min(...tiles.map((tile) => tile.getBoundingClientRect().width)),
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`Batch 62 DeckList header ledger ${skin} ${size.label}`, async ({ page }) => {
      await openDeckList(page, skin, size);
      const geometry = await inspectHeader(page);

      expect(geometry).not.toBeNull();
      expect(geometry?.summaryCount).toBe(2);
      expect(geometry?.actionCount).toBe(3);
      expect(geometry?.actionLabels).toEqual(['新しいデッキ', 'デッキを読み込む', 'TOPへ']);
      expect(geometry?.headerRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);
      expect(geometry?.summaryGap).toBe(0);
      expect(geometry?.actionGap).toBe(0);
      expect(geometry?.maxSummaryRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
      expect(geometry?.maxActionRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
      expect(geometry?.allActionShadowless).toBe(true);
      expect(geometry?.allActionTransparent).toBe(true);
      expect(geometry?.createAccentWidth ?? 0).toBeGreaterThanOrEqual(2);
      expect(geometry?.summaryNeedsScroll).toBe(false);
      expect(geometry?.actionsNeedScroll).toBe(false);
      expect(geometry?.summaryWithinHeader).toBe(true);
      expect(geometry?.actionsWithinHeader).toBe(true);
      expect(geometry?.headerWithinViewport).toBe(true);

      if (size.label === 'compact') {
        expect(geometry?.cardHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(170);
        expect(geometry?.minTileWidth ?? 0).toBeGreaterThanOrEqual(47);
      }

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `deck-list-header-ledger-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
}
