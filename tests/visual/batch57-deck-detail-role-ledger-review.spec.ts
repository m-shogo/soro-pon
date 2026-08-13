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

async function inspectRoleLedger(page: Page) {
  return page.evaluate(() => {
    const grid = document.querySelector<HTMLElement>('.sp-deck-detail-stage .sp-deck-loadout__role-grid');
    const section = document.querySelector<HTMLElement>('.sp-deck-detail-stage .sp-deck-loadout__roles');
    if (!grid || !section) return null;

    const roles = [...grid.querySelectorAll<HTMLElement>('.sp-role-card')];
    const gridRect = grid.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
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
    const isVisible = (element: Element | null) => {
      if (!(element instanceof HTMLElement)) return false;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };

    return {
      roleCount: roles.length,
      columnCount: getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      gridNeedsScroll: grid.scrollWidth > grid.clientWidth + 1 || grid.scrollHeight > grid.clientHeight + 1,
      allRolesWithinGrid: roles.every((role) => {
        const rect = role.getBoundingClientRect();
        return (
          rect.left >= gridRect.left - 0.5 &&
          rect.right <= gridRect.right + 0.5 &&
          rect.top >= gridRect.top - 0.5 &&
          rect.bottom <= gridRect.bottom + 0.5
        );
      }),
      roleOverflow: roles
        .filter((role) => role.scrollWidth > role.clientWidth + 1 || role.scrollHeight > role.clientHeight + 1)
        .map((role) => role.textContent?.trim() ?? 'role'),
      maxRadius: roles.length > 0 ? Math.max(...roles.map(radius)) : Number.POSITIVE_INFINITY,
      allShadowless: roles.every((role) => getComputedStyle(role).boxShadow === 'none'),
      allContentVisible: roles.every(
        (role) =>
          isVisible(role.querySelector('.sp-role-card__name')) &&
          isVisible(role.querySelector('.sp-role-card__points')) &&
          isVisible(role.querySelector('.sp-role-card__explanation')),
      ),
      sectionWithinViewport:
        sectionRect.left >= -0.5 &&
        sectionRect.top >= -0.5 &&
        sectionRect.right <= viewport.width + 0.5 &&
        sectionRect.bottom <= viewport.height + 0.5,
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`Batch 57 DeckDetail role ledger ${skin} ${size.label}`, async ({ page }) => {
      await openDeckDetail(page, skin, size);
      const geometry = await inspectRoleLedger(page);

      expect(geometry).not.toBeNull();
      expect(geometry?.roleCount).toBe(4);
      expect(geometry?.allContentVisible).toBe(true);
      expect(geometry?.gridNeedsScroll).toBe(false);
      expect(geometry?.allRolesWithinGrid).toBe(true);
      expect(geometry?.roleOverflow).toEqual([]);
      expect(geometry?.sectionWithinViewport).toBe(true);

      if (size.label === 'compact') {
        expect(geometry?.columnCount).toBe(4);
        expect(geometry?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
        expect(geometry?.allShadowless).toBe(true);
      } else {
        expect(geometry?.columnCount).toBe(2);
      }

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `deck-detail-role-ledger-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
}
