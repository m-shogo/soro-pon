import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;

type SkinId = (typeof SKINS)[number];
type CaptureSize = (typeof SIZES)[number];

async function boot(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript(({ skinId }) => {
    Date.now = () => 1_700_000_420_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, { skinId: skin });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);
}

async function inspectTopRack(page: Page) {
  return page.evaluate(() => {
    const rack = document.querySelector<HTMLElement>('.sp-top-stage__rack');
    const tiles = [...document.querySelectorAll<HTMLElement>('.sp-top-stage__rack .sp-tile')];
    const bands = [...document.querySelectorAll<HTMLElement>('.sp-top-stage__rack .sp-tile__band')];
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

async function inspectPrimarySurface(page: Page) {
  return page.evaluate(() => {
    const primary = document.querySelector<HTMLElement>('.sp-top-stage__hero > .sp-button--primary');
    if (!primary) return null;
    const skinLayers = [...primary.querySelectorAll<HTMLElement>(':scope > .sp-skin-layer')];
    const style = getComputedStyle(primary);
    return {
      skinLayerCount: skinLayers.length,
      backgroundImage: style.backgroundImage,
      minHeight: primary.getBoundingClientRect().height,
    };
  });
}

function inspectButtonGroup(selector: string) {
  const group = document.querySelector<HTMLElement>(selector);
  const buttons = [...document.querySelectorAll<HTMLElement>(`${selector} .sp-button`)];
  if (group === null || buttons.length === 0) return null;
  const groupRect = group.getBoundingClientRect();
  const buttonMetrics = buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    const radius = Number.parseFloat(style.borderTopLeftRadius) || 0;
    return {
      height: rect.height,
      radius,
      boxShadow: style.boxShadow,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
    };
  });
  return {
    count: buttons.length,
    minHeight: Math.min(...buttonMetrics.map((metric) => metric.height)),
    maxRadius: Math.max(...buttonMetrics.map((metric) => metric.radius)),
    allShadowless: buttonMetrics.every((metric) => metric.boxShadow === 'none'),
    allWithinGroup: buttonMetrics.every(
      (metric) =>
        metric.left >= groupRect.left - 0.5 &&
        metric.right <= groupRect.right + 0.5 &&
        metric.top >= groupRect.top - 0.5 &&
        metric.bottom <= groupRect.bottom + 0.5,
    ),
    groupNeedsScroll:
      group.scrollWidth > group.clientWidth + 1 ||
      group.scrollHeight > group.clientHeight + 1,
  };
}

async function inspectTopNavigation(page: Page) {
  return page.evaluate(() => ({
    secondary: inspectButtonGroup('.sp-top-stage__nav-main'),
    utility: inspectButtonGroup('.sp-top-stage__utility'),
  }));
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`${skin} ${size.label} TOP starter rack is tile-led`, async ({ page }) => {
      await boot(page, skin, size);
      const rack = await inspectTopRack(page);
      expect(rack).not.toBeNull();
      expect(rack?.tileCount).toBe(8);
      expect(rack?.visibleBands).toBe(0);
      expect(rack?.rowSpread).toBeLessThanOrEqual(1);
      expect(rack?.maxTileBottom).toBeLessThanOrEqual(rack?.rackBottom ?? 0);
      if (size.label === 'compact') {
        expect(rack?.minTileWidth).toBeGreaterThanOrEqual(44);
      }

      const primary = await inspectPrimarySurface(page);
      expect(primary).not.toBeNull();
      expect(primary?.backgroundImage).not.toBe('none');
      expect(primary?.minHeight).toBeGreaterThanOrEqual(44);
      if (skin === 'yorunoshirube') {
        expect(primary?.skinLayerCount).toBe(0);
      } else {
        expect(primary?.skinLayerCount).toBe(1);
      }

      const navigation = await inspectTopNavigation(page);
      const secondaryNav = navigation.secondary;
      const utilityNav = navigation.utility;
      expect(secondaryNav).not.toBeNull();
      expect(secondaryNav?.count).toBe(2);
      expect(secondaryNav?.groupNeedsScroll).toBe(false);
      expect(secondaryNav?.allWithinGroup).toBe(true);
      expect(utilityNav).not.toBeNull();
      expect(utilityNav?.count).toBe(3);
      expect(utilityNav?.groupNeedsScroll).toBe(false);
      expect(utilityNav?.allWithinGroup).toBe(true);
      if (size.label === 'compact') {
        expect(secondaryNav?.minHeight ?? 0).toBeGreaterThanOrEqual(44);
        expect(secondaryNav?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);
        expect(secondaryNav?.allShadowless).toBe(true);
      } else {
        expect(secondaryNav?.minHeight ?? 0).toBeGreaterThanOrEqual(64);
        expect(secondaryNav?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);
        expect(secondaryNav?.allShadowless).toBe(true);
        expect(utilityNav?.minHeight ?? 0).toBeGreaterThanOrEqual(40);
        expect(utilityNav?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);
        expect(utilityNav?.allShadowless).toBe(true);
      }
    });
  }
}
