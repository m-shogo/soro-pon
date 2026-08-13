import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;
const CAPTURE_DIR = 'test-results/batch14-review';

async function openDeckDetail(
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
  await page.locator('.sp-deck-select-card').first().click();
  await expect(page.getByRole('button', { name: 'デッキを編集' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function inspectCommandRail(page: Page) {
  return page.evaluate(() => {
    const rail = document.querySelector<HTMLElement>('.sp-deck-detail-stage__utility');
    const roleSection = document.querySelector<HTMLElement>('.sp-deck-loadout__roles');
    if (!rail || !roleSection) return null;

    const buttons = [...rail.querySelectorAll<HTMLElement>('.sp-button')];
    const railRect = rail.getBoundingClientRect();
    const roleRect = roleSection.getBoundingClientRect();
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

    return {
      buttonCount: buttons.length,
      labels: buttons.map((button) => button.textContent?.trim() ?? ''),
      gap: Number.parseFloat(getComputedStyle(rail).columnGap) || 0,
      railNeedsScroll: rail.scrollWidth > rail.clientWidth + 1 || rail.scrollHeight > rail.clientHeight + 1,
      allButtonsWithinRail: buttons.every((button) => {
        const rect = button.getBoundingClientRect();
        return (
          rect.left >= railRect.left - 0.5 &&
          rect.right <= railRect.right + 0.5 &&
          rect.top >= railRect.top - 0.5 &&
          rect.bottom <= railRect.bottom + 0.5
        );
      }),
      minTargetHeight: buttons.length > 0 ? Math.min(...buttons.map((button) => button.getBoundingClientRect().height)) : 0,
      maxRadius: buttons.length > 0 ? Math.max(...buttons.map(radius)) : Number.POSITIVE_INFINITY,
      allShadowless: buttons.every((button) => getComputedStyle(button).boxShadow === 'none'),
      railWithinViewport:
        railRect.left >= -0.5 &&
        railRect.top >= -0.5 &&
        railRect.right <= viewport.width + 0.5 &&
        railRect.bottom <= viewport.height + 0.5,
      roleWithinViewport:
        roleRect.left >= -0.5 &&
        roleRect.top >= -0.5 &&
        roleRect.right <= viewport.width + 0.5 &&
        roleRect.bottom <= viewport.height + 0.5,
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`Batch 58 DeckDetail command rail ${skin} ${size.label}`, async ({ page }) => {
      await openDeckDetail(page, skin, size);
      const geometry = await inspectCommandRail(page);

      expect(geometry).not.toBeNull();
      expect(geometry?.buttonCount).toBe(3);
      expect(geometry?.labels).toEqual(['書き出す', '削除', 'もどる']);
      expect(geometry?.railNeedsScroll).toBe(false);
      expect(geometry?.allButtonsWithinRail).toBe(true);
      expect(geometry?.railWithinViewport).toBe(true);
      expect(geometry?.roleWithinViewport).toBe(true);

      if (size.label === 'compact') {
        expect(geometry?.gap).toBe(0);
        expect(geometry?.minTargetHeight ?? 0).toBeGreaterThanOrEqual(32);
        expect(geometry?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
        expect(geometry?.allShadowless).toBe(true);
      } else {
        expect(geometry?.gap ?? 0).toBeGreaterThan(0);
        expect(geometry?.maxRadius ?? 0).toBeGreaterThan(1);
      }

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `deck-detail-command-rail-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
}
