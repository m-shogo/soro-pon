import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;
const TABS = [
  { name: /^基本/, id: 'basic' },
  { name: /^カテゴリ/, id: 'categories' },
  { name: /^牌/, id: 'tiles' },
  { name: /^役/, id: 'roles' },
  { name: /^ボーナス/, id: 'bonuses' },
] as const;
const CAPTURE_DIR = 'test-results/batch14-review';

type SkinId = (typeof SKINS)[number];
type CaptureSize = (typeof SIZES)[number];

async function bootEditor(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript(({ skinId }) => {
    Date.now = () => 1_700_000_540_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, { skinId: skin });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);

  await page.getByRole('button', { name: /デッキ一覧/ }).click();
  await expect(page.getByRole('heading', { name: 'デッキ選択' })).toBeVisible();
  await page.locator('.sp-deck-select-card').first().click();
  await expect(page.getByRole('button', { name: 'デッキを編集' })).toBeVisible();
  await page.getByRole('button', { name: 'デッキを編集' }).click();
  await expect(page.getByRole('heading', { name: 'デッキ編集' })).toBeVisible();
}

async function inspectEditorGeometry(page: Page) {
  return page.evaluate(() => {
    const main = document.querySelector<HTMLElement>('[role="tabpanel"][id^="sp-tabpanel-"]');
    const screen = main?.closest<HTMLElement>('.sp-screen') ?? null;
    const body = screen?.querySelector<HTMLElement>(':scope > .sp-screen__body') ?? null;
    const side = body?.querySelector<HTMLElement>(':scope > .sp-screen__col--side') ?? null;
    const inspector = side?.querySelector<HTMLElement>('.sp-deck-editor-inspector') ?? null;
    const title = inspector?.querySelector<HTMLElement>('.sp-paper-panel__title') ?? null;
    const status = inspector?.querySelector<HTMLElement>('.sp-deck-editor-inspector__status') ?? null;
    const summaryItems = inspector === null
      ? []
      : [...inspector.querySelectorAll<HTMLElement>('.sp-deck-editor-inspector__summary > div')];
    const issueItems = inspector === null
      ? []
      : [...inspector.querySelectorAll<HTMLElement>('.sp-deck-editor-inspector__issue-counts > span')];
    const validation = inspector?.querySelector<HTMLElement>(
      '.sp-deck-editor-inspector__validation, .sp-deck-editor-inspector__validation-clear',
    ) ?? null;
    if (!body || !main || !side || !inspector || !title || !status || !validation) return null;

    const visible = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const bodyRect = body.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    const sideRect = side.getBoundingClientRect();
    const inspectorRect = inspector.getBoundingClientRect();

    return {
      bodyWidth: bodyRect.width,
      mainWidth: mainRect.width,
      sideWidth: sideRect.width,
      sideHeight: sideRect.height,
      sideBelowMain: sideRect.top >= mainRect.bottom - 1,
      sideRightOfMain: sideRect.left >= mainRect.right - 1,
      sideTopAlignedWithMain: Math.abs(sideRect.top - mainRect.top) <= 2,
      inspectorOverflow:
        inspector.scrollWidth > inspector.clientWidth + 1 ||
        inspector.scrollHeight > inspector.clientHeight + 1,
      sideOverflow:
        side.scrollWidth > side.clientWidth + 1 ||
        side.scrollHeight > side.clientHeight + 1,
      titleVisible: visible(title),
      statusVisible: visible(status),
      summaryVisibleCount: summaryItems.filter(visible).length,
      issueVisibleCount: issueItems.filter(visible).length,
      validationVisible: visible(validation),
      inspectorHeight: inspectorRect.height,
      viewportOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
        document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
    };
  });
}

async function expectEditorGeometry(page: Page, size: CaptureSize) {
  const geometry = await inspectEditorGeometry(page);
  expect(geometry).not.toBeNull();
  expect(geometry?.viewportOverflow).toBe(false);
  expect(geometry?.titleVisible).toBe(true);
  expect(geometry?.statusVisible).toBe(true);
  expect(geometry?.summaryVisibleCount).toBe(4);
  expect(geometry?.issueVisibleCount).toBe(3);
  expect(geometry?.validationVisible).toBe(true);
  expect(geometry?.inspectorOverflow).toBe(false);
  expect(geometry?.sideOverflow).toBe(false);

  if (size.label === 'compact') {
    expect((geometry?.mainWidth ?? 0) / (geometry?.bodyWidth ?? 1)).toBeGreaterThanOrEqual(0.98);
    expect((geometry?.sideWidth ?? 0) / (geometry?.bodyWidth ?? 1)).toBeGreaterThanOrEqual(0.98);
    expect(geometry?.sideBelowMain).toBe(true);
    expect(geometry?.sideHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(58);
    expect(geometry?.inspectorHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(55);
  } else {
    expect(geometry?.sideRightOfMain).toBe(true);
    expect(geometry?.sideTopAlignedWithMain).toBe(true);
    expect(geometry?.sideWidth ?? 0).toBeGreaterThanOrEqual(190);
    expect(geometry?.sideWidth ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(250);
  }
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`${skin} ${size.label} deck editor inspector uses the right composition`, async ({ page }) => {
      await bootEditor(page, skin, size);

      for (const tab of TABS) {
        await page.getByRole('tab', { name: tab.name }).click();
        await expect(page.getByRole('tabpanel')).toHaveAttribute('id', `sp-tabpanel-${tab.id}`);
        await expectEditorGeometry(page, size);

        await mkdir(CAPTURE_DIR, { recursive: true });
        await page.screenshot({
          path: join(CAPTURE_DIR, `deck-editor-inspector-${skin}-${tab.id}-${size.label}.png`),
          fullPage: false,
          animations: 'disabled',
          caret: 'hide',
        });
      }
    });
  }
}
