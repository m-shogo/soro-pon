import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const STATES = ['clean', 'dirty'] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;
const CAPTURE_DIR = 'test-results/batch14-review';

type SkinId = (typeof SKINS)[number];
type EditorState = (typeof STATES)[number];
type CaptureSize = (typeof SIZES)[number];

async function bootEditor(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript((skinId) => {
    Date.now = () => 1_700_000_670_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, skin);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);
  await page.getByRole('button', { name: /デッキ一覧/ }).click();
  await expect(page.getByRole('heading', { name: 'デッキ選択' })).toBeVisible();
  await page.locator('.sp-deck-select-card').first().click();
  await page.getByRole('button', { name: 'デッキを編集' }).click();
  await expect(page.getByRole('heading', { name: 'デッキ編集' })).toBeVisible();
}

async function inspectActions(page: Page) {
  return page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>('[role="tabpanel"][id^="sp-tabpanel-"]');
    const screen = panel?.closest<HTMLElement>('.sp-screen') ?? null;
    const header = screen?.querySelector<HTMLElement>(':scope > .sp-screen__header') ?? null;
    const save = header?.querySelector<HTMLButtonElement>('.sp-button--primary') ?? null;
    const back = header?.querySelector<HTMLButtonElement>('.sp-button--ghost') ?? null;
    if (!header || !save || !back) return null;
    const saveRect = save.getBoundingClientRect();
    const backRect = back.getBoundingClientRect();
    const saveStyle = getComputedStyle(save);
    const backStyle = getComputedStyle(back);
    const radius = (value: string) => Number.parseFloat(value) || 0;
    const visibleSkinLayers = [save, back].flatMap((button) =>
      [...button.querySelectorAll<HTMLElement>(':scope > .sp-skin-layer')],
    ).filter((layer) => {
      const rect = layer.getBoundingClientRect();
      const style = getComputedStyle(layer);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    }).length;
    return {
      labels: [save.textContent?.trim(), back.textContent?.trim()],
      saveDisabled: save.disabled,
      gap: backRect.left - saveRect.right,
      minTargetHeight: Math.min(saveRect.height, backRect.height),
      maxRadius: Math.max(radius(saveStyle.borderTopLeftRadius), radius(backStyle.borderTopRightRadius)),
      allShadowless: [saveStyle.boxShadow, backStyle.boxShadow].every((value) => value === 'none'),
      allTransparent: [saveStyle.backgroundColor, backStyle.backgroundColor].every(
        (value) => value === 'rgba(0, 0, 0, 0)' || value === 'transparent',
      ),
      saveAccentWidth: Number.parseFloat(saveStyle.borderBottomWidth) || 0,
      visibleSkinLayers,
      viewportOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
        document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
    };
  });
}

for (const skin of SKINS) {
  for (const state of STATES) {
    for (const size of SIZES) {
      test(`${skin} ${state} ${size.label} DeckEditor header is a state-aware command ledger`, async ({ page }) => {
        await bootEditor(page, skin, size);
        const save = page.getByRole('button', { name: '保存する' });
        const back = page.getByRole('button', { name: 'もどる' });
        await expect(save).toBeDisabled();
        await expect(back).toBeEnabled();

        if (state === 'dirty') {
          const name = page.getByRole('textbox', { name: 'デッキ名' });
          await name.fill(`${await name.inputValue()} 改`);
          await expect(save).toBeEnabled();
        }

        const geometry = await inspectActions(page);
        expect(geometry).not.toBeNull();
        expect(geometry?.labels).toEqual(['保存する', 'もどる']);
        expect(geometry?.saveDisabled).toBe(state === 'clean');
        expect(Math.abs(geometry?.gap ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(1);
        expect(geometry?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
        expect(geometry?.minTargetHeight ?? 0).toBeGreaterThanOrEqual(size.label === 'compact' ? 32 : 40);
        expect(geometry?.allShadowless).toBe(true);
        expect(geometry?.allTransparent).toBe(true);
        expect(geometry?.visibleSkinLayers).toBe(0);
        expect(geometry?.viewportOverflow).toBe(false);
        if (state === 'dirty') expect(geometry?.saveAccentWidth ?? 0).toBeGreaterThanOrEqual(2);
        else expect(geometry?.saveAccentWidth ?? Number.POSITIVE_INFINITY).toBeLessThan(2);

        await mkdir(CAPTURE_DIR, { recursive: true });
        await page.screenshot({
          path: join(CAPTURE_DIR, `deck-editor-header-command-ledger-${skin}-${state}-${size.label}.png`),
          fullPage: false,
          animations: 'disabled',
          caret: 'hide',
        });
      });
    }
  }
}
