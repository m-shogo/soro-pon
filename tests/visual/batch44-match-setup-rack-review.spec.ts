import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const PLAYER_COUNTS = [3, 4] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;

type SkinId = (typeof SKINS)[number];
type CaptureSize = (typeof SIZES)[number];

async function boot(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript(({ skinId }) => {
    Date.now = () => 1_700_000_440_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, { skinId: skin });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);
}

async function inspectDeckRack(page: Page) {
  return page.evaluate(() => {
    const rack = document.querySelector<HTMLElement>('.sp-match-setup__deck-rack');
    const tiles = [...document.querySelectorAll<HTMLElement>('.sp-match-setup__deck-rack .sp-tile')];
    const bands = [...document.querySelectorAll<HTMLElement>('.sp-match-setup__deck-rack .sp-tile__band')];
    if (!rack || tiles.length === 0) return null;

    const rackRect = rack.getBoundingClientRect();
    const rects = tiles.map((tile) => tile.getBoundingClientRect());
    return {
      tileCount: tiles.length,
      minTileWidth: Math.min(...rects.map((rect) => rect.width)),
      maxTileBottom: Math.max(...rects.map((rect) => rect.bottom)),
      rackBottom: rackRect.bottom,
      rowSpread: Math.max(...rects.map((rect) => rect.top)) - Math.min(...rects.map((rect) => rect.top)),
      visibleBands: bands.filter((band) => {
        const style = getComputedStyle(band);
        const rect = band.getBoundingClientRect();
        return style.display !== 'none' && rect.width > 0 && rect.height > 0;
      }).length,
    };
  });
}

for (const skin of SKINS) {
  for (const playerCount of PLAYER_COUNTS) {
    for (const size of SIZES) {
      test(`${skin} ${playerCount}p ${size.label} match setup rack is tile-led`, async ({ page }) => {
        await boot(page, skin, size);
        await page.getByRole('button', { name: /まず遊ぶ/ }).click();
        await expect(page.getByRole('heading', { name: '対局設定' })).toBeVisible();
        await page.getByRole('button', { name: `${playerCount}人戦`, exact: true }).click();

        const rack = await inspectDeckRack(page);
        expect(rack).not.toBeNull();
        expect(rack?.tileCount).toBe(8);
        expect(rack?.visibleBands).toBe(0);
        expect(rack?.rowSpread).toBeLessThanOrEqual(1);
        expect(rack?.maxTileBottom).toBeLessThanOrEqual(rack?.rackBottom ?? 0);
        if (size.label === 'compact') {
          expect(rack?.minTileWidth).toBeGreaterThanOrEqual(34);
        }
      });
    }
  }
}
