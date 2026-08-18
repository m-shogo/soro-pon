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

async function openMatchSetup(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript((skinId) => {
    Date.now = () => 1_700_000_710_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, skin);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await expect(page.getByRole('heading', { name: '対局設定' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function inspectBackCommand(page: Page) {
  return page.evaluate(() => {
    const screen = document.querySelector<HTMLElement>('.sp-match-setup');
    const header = screen?.querySelector<HTMLElement>(':scope > .sp-screen__header') ?? null;
    const back = header?.querySelector<HTMLButtonElement>(':scope > .sp-button--ghost') ?? null;
    if (!screen || !header || !back) return null;

    const rect = back.getBoundingClientRect();
    const style = getComputedStyle(back);
    const radii = [
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomLeftRadius,
      style.borderBottomRightRadius,
    ].map((value) => Number.parseFloat(value) || 0);
    const visibleSkinLayers = [
      ...back.querySelectorAll<HTMLElement>(':scope > .sp-skin-layer'),
    ].filter((layer) => {
      const layerRect = layer.getBoundingClientRect();
      const layerStyle = getComputedStyle(layer);
      return layerRect.width > 0 && layerRect.height > 0 && layerStyle.display !== 'none' && layerStyle.visibility !== 'hidden';
    }).length;

    return {
      label: back.textContent?.trim() ?? '',
      enabled: !back.disabled,
      width: rect.width,
      height: rect.height,
      maxRadius: Math.max(...radii),
      shadow: style.boxShadow,
      background: style.backgroundColor,
      filter: style.filter,
      visibleSkinLayers,
      viewportOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
        document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`Batch 71 MatchSetup header back command ${skin} ${size.label}`, async ({ page }) => {
      await openMatchSetup(page, skin, size);
      const back = page.getByRole('button', { name: 'もどる', exact: true });
      await expect(back).toBeEnabled();

      // Measure decorative resting state before keyboard focus so the global
      // accessibility halo cannot be misclassified as a component shadow.
      const geometry = await inspectBackCommand(page);
      expect(geometry).not.toBeNull();
      expect(geometry?.label).toBe('もどる');
      expect(geometry?.enabled).toBe(true);
      expect(geometry?.width ?? 0).toBeGreaterThanOrEqual(size.label === 'compact' ? 76 : 104);
      expect(geometry?.height ?? 0).toBeGreaterThanOrEqual(size.label === 'compact' ? 32 : 40);
      expect(geometry?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
      expect(geometry?.shadow).toBe('none');
      expect(['rgba(0, 0, 0, 0)', 'transparent']).toContain(geometry?.background);
      expect(geometry?.filter).toBe('none');
      expect(geometry?.visibleSkinLayers).toBe(0);
      expect(geometry?.viewportOverflow).toBe(false);

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `match-setup-header-command-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });

      // The unlayered global focus halo is an accessibility contract. Enter
      // keyboard modality through the real focus order before measuring it.
      await back.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(back).toBeFocused();
      const focusShadow = await back.evaluate((element) => getComputedStyle(element).boxShadow);
      expect(focusShadow).not.toBe('none');
    });
  }
}
