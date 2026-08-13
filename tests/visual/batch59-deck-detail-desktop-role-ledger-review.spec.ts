import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;
const CAPTURE_DIR = 'test-results/batch14-review';

async function openDeckDetail(page: Page, skin: (typeof SKINS)[number], size: (typeof SIZES)[number]) {
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

async function inspectRoleLedger(page: Page) {
  return page.evaluate(() => {
    const grid = document.querySelector<HTMLElement>('.sp-deck-detail-stage .sp-deck-loadout__role-grid');
    const section = document.querySelector<HTMLElement>('.sp-deck-detail-stage .sp-deck-loadout__roles');
    if (!grid || !section) return null;
    const roles = [...grid.querySelectorAll<HTMLElement>('.sp-role-card')];
    const sectionRect = section.getBoundingClientRect();
    const radius = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      return Math.max(
        Number.parseFloat(style.borderTopLeftRadius) || 0,
        Number.parseFloat(style.borderTopRightRadius) || 0,
        Number.parseFloat(style.borderBottomLeftRadius) || 0,
        Number.parseFloat(style.borderBottomRightRadius) || 0,
      );
    };
    const visible = (selector: string, role: HTMLElement) => {
      const element = role.querySelector<HTMLElement>(selector);
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    return {
      roleCount: roles.length,
      columnCount: getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      gap: Number.parseFloat(getComputedStyle(grid).columnGap) || 0,
      gridNeedsScroll: grid.scrollWidth > grid.clientWidth + 1 || grid.scrollHeight > grid.clientHeight + 1,
      roleOverflow: roles.filter((role) => role.scrollWidth > role.clientWidth + 1 || role.scrollHeight > role.clientHeight + 1).length,
      maxRadius: roles.length > 0 ? Math.max(...roles.map(radius)) : Number.POSITIVE_INFINITY,
      allShadowless: roles.every((role) => getComputedStyle(role).boxShadow === 'none'),
      allTransparent: roles.every((role) => getComputedStyle(role).backgroundColor === 'rgba(0, 0, 0, 0)'),
      allContentVisible: roles.every(
        (role) => visible('.sp-role-card__name', role) && visible('.sp-role-card__points', role) && visible('.sp-role-card__explanation', role),
      ),
      sectionWithinViewport:
        sectionRect.left >= -0.5 &&
        sectionRect.top >= -0.5 &&
        sectionRect.right <= document.documentElement.clientWidth + 0.5 &&
        sectionRect.bottom <= document.documentElement.clientHeight + 0.5,
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`Batch 59 DeckDetail role ledger ${skin} ${size.label}`, async ({ page }) => {
      await openDeckDetail(page, skin, size);
      const geometry = await inspectRoleLedger(page);
      expect(geometry).not.toBeNull();
      expect(geometry?.roleCount).toBe(4);
      expect(geometry?.gridNeedsScroll).toBe(false);
      expect(geometry?.roleOverflow).toBe(0);
      expect(geometry?.allContentVisible).toBe(true);
      expect(geometry?.sectionWithinViewport).toBe(true);
      expect(geometry?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
      expect(geometry?.allShadowless).toBe(true);
      expect(geometry?.allTransparent).toBe(true);

      if (size.label === 'compact') {
        expect(geometry?.columnCount).toBe(4);
        expect(geometry?.gap).toBe(0);
      } else {
        expect(geometry?.columnCount).toBe(2);
        expect(geometry?.gap).toBe(0);
      }

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `deck-detail-desktop-role-ledger-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
}
