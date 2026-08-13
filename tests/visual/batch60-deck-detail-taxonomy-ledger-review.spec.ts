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

async function inspectTaxonomyLedger(page: Page) {
  return page.evaluate(() => {
    const ledger = document.querySelector<HTMLElement>('.sp-deck-detail-stage__categories');
    if (!ledger) return null;
    const chips = [...ledger.querySelectorAll<HTMLElement>('.sp-category-chip')];
    const style = getComputedStyle(ledger);
    const visible = style.display !== 'none' && ledger.getBoundingClientRect().width > 0;
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
      visible,
      display: style.display,
      categoryCount: chips.length,
      columnCount: style.display === 'grid' ? style.gridTemplateColumns.split(/\s+/).filter(Boolean).length : 0,
      ledgerNeedsScroll: ledger.scrollWidth > ledger.clientWidth + 1 || ledger.scrollHeight > ledger.clientHeight + 1,
      chipOverflow: chips
        .filter((chip) => chip.scrollWidth > chip.clientWidth + 1 || chip.scrollHeight > chip.clientHeight + 1)
        .map((chip) => chip.textContent?.trim() ?? 'category'),
      maxRadius: chips.length > 0 ? Math.max(...chips.map(radius)) : Number.POSITIVE_INFINITY,
      allShadowless: chips.every((chip) => getComputedStyle(chip).boxShadow === 'none'),
      allTransparent: chips.every((chip) => getComputedStyle(chip).backgroundColor === 'rgba(0, 0, 0, 0)'),
      allNamesVisible: chips.every((chip) => (chip.textContent?.trim().length ?? 0) > 0),
      allMarkersVisible: chips.every((chip) => {
        const marker = chip.querySelector<HTMLElement>('.sp-category-chip__dot');
        if (!marker) return false;
        const rect = marker.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }),
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`Batch 60 DeckDetail taxonomy ledger ${skin} ${size.label}`, async ({ page }) => {
      await openDeckDetail(page, skin, size);
      const geometry = await inspectTaxonomyLedger(page);

      expect(geometry).not.toBeNull();
      expect(geometry?.categoryCount ?? 0).toBeGreaterThan(0);

      if (size.label === 'compact') {
        expect(geometry?.visible).toBe(false);
        expect(geometry?.display).toBe('none');
      } else {
        expect(geometry?.visible).toBe(true);
        expect(geometry?.columnCount).toBe(2);
        expect(geometry?.ledgerNeedsScroll).toBe(false);
        expect(geometry?.chipOverflow).toEqual([]);
        expect(geometry?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
        expect(geometry?.allShadowless).toBe(true);
        expect(geometry?.allTransparent).toBe(true);
        expect(geometry?.allNamesVisible).toBe(true);
        expect(geometry?.allMarkersVisible).toBe(true);
      }

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `deck-detail-taxonomy-ledger-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
}
