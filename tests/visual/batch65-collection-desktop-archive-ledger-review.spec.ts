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

async function openCollection(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript((skinId) => {
    Date.now = () => 1_700_000_220_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, skin);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await page.getByRole('button', { name: /記憶帳/ }).click();
  await expect(page.getByRole('heading', { name: '記憶帳' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function inspectCollectionShells(page: Page) {
  return page.evaluate(() => {
    const body = document.querySelector<HTMLElement>('.sp-collection-screen__body');
    const main = document.querySelector<HTMLElement>('.sp-collection-screen__main');
    const recent = document.querySelector<HTMLElement>('.sp-collection-screen__recent');
    const emptyScoreboard = document.querySelector<HTMLElement>('.sp-collection-scoreboard--empty');
    if (!body || !main || !recent || !emptyScoreboard) return null;

    const mainPanels = [...main.querySelectorAll<HTMLElement>(':scope > .sp-paper-panel')];
    const recentPanel = recent.querySelector<HTMLElement>(':scope > .sp-paper-panel');
    if (mainPanels.length === 0 || !recentPanel) return null;

    const radius = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      return Math.max(
        Number.parseFloat(style.borderTopLeftRadius) || 0,
        Number.parseFloat(style.borderTopRightRadius) || 0,
        Number.parseFloat(style.borderBottomLeftRadius) || 0,
        Number.parseFloat(style.borderBottomRightRadius) || 0,
      );
    };
    const visible = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const panelSkinLayers = [
      ...main.querySelectorAll<HTMLElement>(':scope > .sp-paper-panel > .sp-skin-layer'),
      ...recent.querySelectorAll<HTMLElement>(':scope > .sp-paper-panel > .sp-skin-layer'),
    ];
    const bodyRect = body.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    const recentRect = recent.getBoundingClientRect();

    return {
      mainPanelCount: mainPanels.length,
      mainGap: Number.parseFloat(getComputedStyle(main).rowGap) || 0,
      maxMainPanelRadius: Math.max(...mainPanels.map(radius)),
      minMainPanelRadius: Math.min(...mainPanels.map(radius)),
      allMainPanelsShadowless: mainPanels.every((panel) => getComputedStyle(panel).boxShadow === 'none'),
      firstAccentWidth: Number.parseFloat(getComputedStyle(mainPanels[0]).borderTopWidth) || 0,
      recentRadius: radius(recentPanel),
      recentShadowless: getComputedStyle(recentPanel).boxShadow === 'none',
      visibleDirectSkinLayers: panelSkinLayers.filter(visible).length,
      mainHorizontalOverflow: main.scrollWidth > main.clientWidth + 1,
      recentHorizontalOverflow: recent.scrollWidth > recent.clientWidth + 1,
      panelsNeedOwnScroll: [...mainPanels, recentPanel].some(
        (panel) => panel.scrollWidth > panel.clientWidth + 1 || panel.scrollHeight > panel.clientHeight + 1,
      ),
      recentWidth: recentRect.width,
      recentHeight: recentRect.height,
      recentBelowMain: recentRect.top >= mainRect.bottom - 1,
      mainWidthRatio: mainRect.width / Math.max(bodyRect.width, 1),
      recentWidthRatio: recentRect.width / Math.max(bodyRect.width, 1),
      emptyScoreboardHeight: emptyScoreboard.getBoundingClientRect().height,
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`Batch 65 Collection archive ledger ${skin} ${size.label}`, async ({ page }) => {
      await openCollection(page, skin, size);
      const geometry = await inspectCollectionShells(page);

      expect(geometry).not.toBeNull();
      expect(geometry?.mainPanelCount).toBe(3);
      expect(geometry?.mainHorizontalOverflow).toBe(false);
      expect(geometry?.recentHorizontalOverflow).toBe(false);
      expect(geometry?.panelsNeedOwnScroll).toBe(false);

      if (size.label === 'desktop') {
        expect(geometry?.mainGap).toBe(0);
        expect(geometry?.maxMainPanelRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
        expect(geometry?.allMainPanelsShadowless).toBe(true);
        expect(geometry?.firstAccentWidth ?? 0).toBeGreaterThanOrEqual(2);
        expect(geometry?.recentRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
        expect(geometry?.recentShadowless).toBe(true);
        expect(geometry?.visibleDirectSkinLayers).toBe(0);
        expect(geometry?.recentWidth ?? 0).toBeGreaterThanOrEqual(250);
        expect(geometry?.recentWidth ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(270);
      } else {
        expect(geometry?.mainGap ?? 0).toBeGreaterThan(0);
        expect(geometry?.minMainPanelRadius ?? 0).toBeGreaterThanOrEqual(3.5);
        expect(geometry?.recentRadius ?? 0).toBeGreaterThanOrEqual(3.5);
        expect(geometry?.mainWidthRatio ?? 0).toBeGreaterThanOrEqual(0.95);
        expect(geometry?.recentWidthRatio ?? 0).toBeGreaterThanOrEqual(0.95);
        expect(geometry?.recentHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(64);
        expect(geometry?.recentBelowMain).toBe(true);
        expect(geometry?.emptyScoreboardHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(38);
      }

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `collection-archive-ledger-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
}
