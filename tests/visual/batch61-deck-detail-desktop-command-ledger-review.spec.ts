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
type ReviewSize = (typeof SIZES)[number];

async function openDeckDetail(page: Page, skin: SkinId, size: ReviewSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript((skinId) => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, skin);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await page.getByRole('button', { name: /デッキ一覧/ }).click();
  await expect(page.getByRole('heading', { name: 'デッキ選択' })).toBeVisible();
  await page.locator('.sp-deck-select-card').first().click();
  await expect(page.getByRole('button', { name: 'デッキを編集' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function inspectCommandLedger(page: Page) {
  return page.evaluate(() => {
    const ledger = document.querySelector<HTMLElement>('.sp-deck-detail-stage__utility');
    if (!ledger) return null;
    const buttons = [...ledger.querySelectorAll<HTMLElement>('.sp-button')];
    const style = getComputedStyle(ledger);
    const radius = (element: HTMLElement) => {
      const s = getComputedStyle(element);
      return Math.max(
        Number.parseFloat(s.borderTopLeftRadius) || 0,
        Number.parseFloat(s.borderTopRightRadius) || 0,
        Number.parseFloat(s.borderBottomLeftRadius) || 0,
        Number.parseFloat(s.borderBottomRightRadius) || 0,
      );
    };

    return {
      buttonCount: buttons.length,
      labels: buttons.map((button) => button.textContent?.trim() ?? ''),
      columnCount: style.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      ledgerNeedsScroll: ledger.scrollWidth > ledger.clientWidth + 1 || ledger.scrollHeight > ledger.clientHeight + 1,
      buttonOverflow: buttons
        .filter((button) => button.scrollWidth > button.clientWidth + 1 || button.scrollHeight > button.clientHeight + 1)
        .map((button) => button.textContent?.trim() ?? 'button'),
      minHeight: buttons.length > 0 ? Math.min(...buttons.map((button) => button.getBoundingClientRect().height)) : 0,
      maxRadius: buttons.length > 0 ? Math.max(...buttons.map(radius)) : Number.POSITIVE_INFINITY,
      allShadowless: buttons.every((button) => getComputedStyle(button).boxShadow === 'none'),
      allTransparent: buttons.every((button) => getComputedStyle(button).backgroundColor === 'rgba(0, 0, 0, 0)'),
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`Batch 61 DeckDetail command ledger ${skin} ${size.label}`, async ({ page }) => {
      await openDeckDetail(page, skin, size);
      const geometry = await inspectCommandLedger(page);

      expect(geometry).not.toBeNull();
      expect(geometry?.buttonCount).toBe(3);
      expect(geometry?.labels).toEqual(['書き出す', '削除', 'もどる']);
      expect(geometry?.columnCount).toBe(3);
      expect(geometry?.ledgerNeedsScroll).toBe(false);
      expect(geometry?.buttonOverflow).toEqual([]);
      expect(geometry?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
      expect(geometry?.allShadowless).toBe(true);
      expect(geometry?.allTransparent).toBe(true);

      if (size.label === 'desktop') {
        expect(geometry?.minHeight ?? 0).toBeGreaterThanOrEqual(36);
      } else {
        expect(geometry?.minHeight ?? 0).toBeGreaterThanOrEqual(30);
      }

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `deck-detail-command-ledger-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
}
