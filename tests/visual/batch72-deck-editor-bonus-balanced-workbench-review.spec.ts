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

async function bootBonusEditor(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript((skinId) => {
    Date.now = () => 1_700_000_720_000;
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

  const bonuses = page.getByRole('tab', { name: /^ボーナス/ });
  await bonuses.click();
  await expect(bonuses).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveAttribute('id', 'sp-tabpanel-bonuses');

  // Guarantee that an editor column exists even if the seed deck changes later.
  await page.getByRole('button', { name: '同じ牌3枚 +15点', exact: true }).click();
  await expect(page.locator('.sp-bonus-workbench__editor')).toBeVisible();
}

async function inspectBonusWorkspace(page: Page) {
  return page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>('#sp-tabpanel-bonuses');
    const workbench = panel?.querySelector<HTMLElement>(':scope > .sp-bonus-workbench') ?? null;
    const body = workbench?.querySelector<HTMLElement>('.sp-bonus-workbench__body') ?? null;
    const list = body?.querySelector<HTMLElement>('.sp-bonus-workbench__list') ?? null;
    const editor = body?.querySelector<HTMLElement>('.sp-bonus-workbench__editor') ?? null;
    if (!panel || !workbench || !body || !list || !editor) return null;

    const panelRect = panel.getBoundingClientRect();
    const workbenchRect = workbench.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    const workbenchStyle = getComputedStyle(workbench);
    const bodyStyle = getComputedStyle(body);

    return {
      panelHeight: panelRect.height,
      workbenchHeight: workbenchRect.height,
      workbenchCoverage: panelRect.height > 0 ? workbenchRect.height / panelRect.height : 0,
      workbenchGridRows: workbenchStyle.gridTemplateRows.split(/\s+/).filter(Boolean).length,
      bodyAlignItems: bodyStyle.alignItems,
      bodyHeight: bodyRect.height,
      bodyBottomGap: Math.abs(workbenchRect.bottom - bodyRect.bottom),
      columnBottomSpread: Math.abs(listRect.bottom - editorRect.bottom),
      listHeight: listRect.height,
      editorHeight: editorRect.height,
      bodyOverflow: body.scrollWidth > body.clientWidth + 1 || body.scrollHeight > body.clientHeight + 1,
      panelOverflowX: panel.scrollWidth > panel.clientWidth + 1,
      viewportOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
        document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`${skin} ${size.label} Bonus workspace uses the pane without compact drift`, async ({ page }) => {
      await bootBonusEditor(page, skin, size);
      const geometry = await inspectBonusWorkspace(page);

      // Capture every state before assertions so a failed geometry proof still
      // leaves a current-head visual artifact for diagnosis and direct review.
      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `deck-editor-bonus-balanced-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });

      expect(geometry).not.toBeNull();
      expect(geometry?.panelOverflowX).toBe(false);
      expect(geometry?.viewportOverflow).toBe(false);

      if (size.label === 'desktop') {
        expect(geometry?.workbenchGridRows).toBe(3);
        expect(geometry?.bodyAlignItems).toBe('stretch');
        expect(geometry?.workbenchCoverage ?? 0).toBeGreaterThanOrEqual(0.9);
        expect(geometry?.bodyHeight ?? 0).toBeGreaterThanOrEqual(300);
        expect(geometry?.bodyBottomGap ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);
        expect(geometry?.columnBottomSpread ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);
        expect(geometry?.listHeight ?? 0).toBeGreaterThanOrEqual(
          (geometry?.bodyHeight ?? Number.POSITIVE_INFINITY) - 2,
        );
        expect(geometry?.editorHeight ?? 0).toBeGreaterThanOrEqual(
          (geometry?.bodyHeight ?? Number.POSITIVE_INFINITY) - 2,
        );
        expect(geometry?.bodyOverflow).toBe(false);
      } else {
        // Batch 35 compact workbench owns this viewport; Batch 72 must not
        // switch its two-column body from the existing start-aligned geometry.
        expect(geometry?.bodyAlignItems).toBe('start');
      }
    });
  }
}
