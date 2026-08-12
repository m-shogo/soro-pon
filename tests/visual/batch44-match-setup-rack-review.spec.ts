import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const PLAYER_COUNTS = [3, 4] as const;
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

async function inspectLobbySeats(page: Page) {
  return page.evaluate(() => {
    const center = document.querySelector<HTMLElement>('.sp-match-setup__lobby-center');
    const seats = [...document.querySelectorAll<HTMLElement>('.sp-match-setup__lobby-seat')];
    if (center === null || seats.length === 0) return null;
    const centerRect = center.getBoundingClientRect();
    const metrics = seats.flatMap((seat) => {
      const panel = seat.querySelector<HTMLElement>('.sp-player-panel');
      const seal = panel?.querySelector<HTMLElement>('.sp-player-panel__seal') ?? null;
      const name = panel?.querySelector<HTMLElement>('.sp-player-panel__name') ?? null;
      if (panel === null || seal === null || name === null) return [];
      const rect = panel.getBoundingClientRect();
      const sealRect = seal.getBoundingClientRect();
      const style = getComputedStyle(panel);
      const nameStyle = getComputedStyle(name);
      const overlapWidth = Math.min(rect.right, centerRect.right) - Math.max(rect.left, centerRect.left);
      const overlapHeight = Math.min(rect.bottom, centerRect.bottom) - Math.max(rect.top, centerRect.top);
      return [{
        position: seat.dataset.lobbySeat ?? 'unknown',
        height: rect.height,
        radius: Number.parseFloat(style.borderTopLeftRadius) || 0,
        shadow: style.boxShadow,
        sealSize: Math.max(sealRect.width, sealRect.height),
        nameVisible:
          name.getBoundingClientRect().width > 0 &&
          name.getBoundingClientRect().height > 0 &&
          nameStyle.display !== 'none' &&
          nameStyle.visibility !== 'hidden',
        ariaLabel: panel.getAttribute('aria-label'),
        active: panel.classList.contains('sp-player-panel--active'),
        ariaCurrent: panel.getAttribute('aria-current'),
        overlapsCenter: overlapWidth > 1 && overlapHeight > 1,
      }];
    });
    return {
      count: metrics.length,
      minHeight: Math.min(...metrics.map((metric) => metric.height)),
      maxHeight: Math.max(...metrics.map((metric) => metric.height)),
      maxRadius: Math.max(...metrics.map((metric) => metric.radius)),
      maxSealSize: Math.max(...metrics.map((metric) => metric.sealSize)),
      allShadowless: metrics.every((metric) => metric.shadow === 'none'),
      visibleNameCount: metrics.filter((metric) => metric.nameVisible).length,
      ariaLabelCount: metrics.filter((metric) => Boolean(metric.ariaLabel)).length,
      activeSemanticsValid: metrics.filter((metric) => metric.active).every((metric) => metric.ariaCurrent === 'true'),
      centerCollisions: metrics.filter((metric) => metric.overlapsCenter).map((metric) => metric.position),
    };
  });
}

async function persistGeometry(
  skin: SkinId,
  playerCount: (typeof PLAYER_COUNTS)[number],
  size: CaptureSize,
  rack: Awaited<ReturnType<typeof inspectDeckRack>>,
  seats: Awaited<ReturnType<typeof inspectLobbySeats>>,
) {
  await mkdir(CAPTURE_DIR, { recursive: true });
  await writeFile(
    join(CAPTURE_DIR, `match-setup-rack-geometry-${skin}-${playerCount}p-${size.label}.json`),
    `${JSON.stringify({ skin, playerCount, viewport: size, rack, seats }, null, 2)}\n`,
    'utf8',
  );
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
        const seats = await inspectLobbySeats(page);
        await persistGeometry(skin, playerCount, size, rack, seats);
        expect(rack).not.toBeNull();
        expect(rack?.tileCount).toBe(8);
        expect(rack?.visibleBands).toBe(0);
        expect(rack?.rowSpread).toBeLessThanOrEqual(1);
        expect(rack?.maxTileBottom).toBeLessThanOrEqual(rack?.rackBottom ?? 0);
        if (size.label === 'compact') {
          expect(rack?.minTileWidth).toBeGreaterThanOrEqual(34);
        }

        expect(seats).not.toBeNull();
        expect(seats?.count).toBe(playerCount);
        expect(seats?.visibleNameCount).toBe(playerCount);
        expect(seats?.ariaLabelCount).toBe(playerCount);
        expect(seats?.activeSemanticsValid).toBe(true);
        expect(seats?.centerCollisions).toEqual([]);
        expect(seats?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(4);
        expect(seats?.allShadowless).toBe(true);
        if (size.label === 'compact') {
          expect(seats?.maxHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(30);
          expect(seats?.maxSealSize ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(16);
        } else {
          expect(seats?.minHeight ?? 0).toBeGreaterThanOrEqual(32);
          expect(seats?.maxHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(40);
          expect(seats?.maxSealSize ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(24);
        }
      });
    }
  }
}
