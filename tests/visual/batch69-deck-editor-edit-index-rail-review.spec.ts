import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;
const TABS = [
  { id: 'basic', name: /^基本/ },
  { id: 'categories', name: /^カテゴリ/ },
  { id: 'tiles', name: /^牌/ },
  { id: 'roles', name: /^役/ },
  { id: 'bonuses', name: /^ボーナス/ },
] as const;
const CAPTURE_DIR = 'test-results/batch14-review';

type SkinId = (typeof SKINS)[number];
type CaptureSize = (typeof SIZES)[number];

async function bootEditor(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript(({ skinId }) => {
    Date.now = () => 1_700_000_690_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, { skinId: skin });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);

  await page.getByRole('button', { name: /デッキ一覧/ }).click();
  await expect(page.getByRole('heading', { name: 'デッキ選択' })).toBeVisible();
  await page.locator('.sp-deck-select-card').first().click();
  await page.getByRole('button', { name: 'デッキを編集' }).click();
  await expect(page.getByRole('heading', { name: 'デッキ編集' })).toBeVisible();
}

async function expectKeyboardNavigation(page: Page) {
  const basic = page.getByRole('tab', { name: /^基本/ });
  const categories = page.getByRole('tab', { name: /^カテゴリ/ });
  const bonuses = page.getByRole('tab', { name: /^ボーナス/ });

  await basic.focus();
  await basic.press('ArrowRight');
  await expect(categories).toBeFocused();
  await expect(categories).toHaveAttribute('aria-selected', 'true');

  await categories.press('End');
  await expect(bonuses).toBeFocused();
  await expect(bonuses).toHaveAttribute('aria-selected', 'true');

  await bonuses.press('Home');
  await expect(basic).toBeFocused();
  await expect(basic).toHaveAttribute('aria-selected', 'true');

  // The global unlayered focus halo is an accessibility contract and must not
  // be mistaken for a decorative tab shadow.
  const focusShadow = await basic.evaluate((element) => getComputedStyle(element).boxShadow);
  expect(focusShadow).not.toBe('none');
  await basic.evaluate((element) => element.blur());
}

async function inspectIndex(page: Page) {
  return page.evaluate(() => {
    const list = document.querySelector<HTMLElement>('.sp-screen:has([id^="sp-tabpanel-"]) > .sp-tabs');
    if (!list) return null;
    const tabs = [...list.querySelectorAll<HTMLButtonElement>(':scope > .sp-tab')];
    if (tabs.length !== 5) return null;

    const listRect = list.getBoundingClientRect();
    const listStyle = getComputedStyle(list);
    const tabGeometry = tabs.map((tab) => {
      const rect = tab.getBoundingClientRect();
      const style = getComputedStyle(tab);
      return {
        id: tab.dataset.tabId ?? '',
        width: rect.width,
        height: rect.height,
        radius: Number.parseFloat(style.borderRadius) || 0,
        shadow: style.boxShadow,
        background: style.backgroundColor,
        borderBottomWidth: Number.parseFloat(style.borderBottomWidth) || 0,
        borderBottomColor: style.borderBottomColor,
        whiteSpace: style.whiteSpace,
        textFits: tab.scrollWidth <= tab.clientWidth + 1 && tab.scrollHeight <= tab.clientHeight + 1,
        selected: tab.getAttribute('aria-selected') === 'true',
        tabIndex: tab.tabIndex,
        ariaControls: tab.getAttribute('aria-controls'),
      };
    });
    const widths = tabGeometry.map((item) => item.width);
    const active = tabGeometry.filter((item) => item.selected);

    return {
      display: listStyle.display,
      gridColumnCount: listStyle.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      gap: Number.parseFloat(listStyle.columnGap) || 0,
      width: listRect.width,
      widthSpread: Math.max(...widths) - Math.min(...widths),
      allTextFits: tabGeometry.every((item) => item.textFits),
      allSquare: tabGeometry.every((item) => item.radius <= 0.5),
      allShadowless: tabGeometry.every((item) => item.shadow === 'none'),
      allTransparent: tabGeometry.every((item) => item.background === 'rgba(0, 0, 0, 0)'),
      allSingleLine: tabGeometry.every((item) => item.whiteSpace === 'nowrap'),
      activeCount: active.length,
      activeAccent: active.length === 1 && active[0]!.borderBottomWidth >= 2,
      activeTabIndex: active.length === 1 ? active[0]!.tabIndex : null,
      minimumHeight: Math.min(...tabGeometry.map((item) => item.height)),
      semantics: tabGeometry.map(({ id, selected, tabIndex, ariaControls }) => ({
        id,
        selected,
        tabIndex,
        ariaControls,
      })),
      tablistOverflow: list.scrollWidth > list.clientWidth + 1 || list.scrollHeight > list.clientHeight + 1,
      viewportOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
        document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`${skin} ${size.label} DeckEditor tabs form one edit index`, async ({ page }) => {
      await bootEditor(page, skin, size);
      await expectKeyboardNavigation(page);

      for (const tab of TABS) {
        const target = page.getByRole('tab', { name: tab.name });
        await target.click();
        await expect(target).toHaveAttribute('aria-selected', 'true');
        await expect(target).toHaveAttribute('aria-controls', `sp-tabpanel-${tab.id}`);
        await expect(target).toHaveAttribute('tabindex', '0');
        await expect(page.getByRole('tabpanel')).toHaveAttribute('id', `sp-tabpanel-${tab.id}`);
        await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', `sp-tab-${tab.id}`);

        // Measure the resting surface separately from the intentional focus halo.
        await target.evaluate((element) => element.blur());
        const geometry = await inspectIndex(page);
        expect(geometry).not.toBeNull();
        expect(geometry?.display).toBe('grid');
        expect(geometry?.gridColumnCount).toBe(5);
        expect(geometry?.gap).toBe(0);
        expect(geometry?.widthSpread ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);
        expect(geometry?.allTextFits).toBe(true);
        expect(geometry?.allSquare).toBe(true);
        expect(geometry?.allShadowless).toBe(true);
        expect(geometry?.allTransparent).toBe(true);
        expect(geometry?.allSingleLine).toBe(true);
        expect(geometry?.activeCount).toBe(1);
        expect(geometry?.activeAccent).toBe(true);
        expect(geometry?.activeTabIndex).toBe(0);
        expect(geometry?.tablistOverflow).toBe(false);
        expect(geometry?.viewportOverflow).toBe(false);

        for (const item of geometry?.semantics ?? []) {
          expect(item.ariaControls).toBe(`sp-tabpanel-${item.id}`);
          if (!item.selected) expect(item.tabIndex).toBe(-1);
        }

        if (size.label === 'compact') {
          expect(geometry?.minimumHeight ?? 0).toBeGreaterThanOrEqual(32);
          expect((geometry?.width ?? 0) / size.width).toBeGreaterThanOrEqual(0.94);
        } else {
          expect(geometry?.minimumHeight ?? 0).toBeGreaterThanOrEqual(36);
          expect(geometry?.width ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(762);
        }

        await mkdir(CAPTURE_DIR, { recursive: true });
        await page.screenshot({
          path: join(CAPTURE_DIR, `deck-editor-edit-index-${skin}-${tab.id}-${size.label}.png`),
          fullPage: false,
          animations: 'disabled',
          caret: 'hide',
        });
      }
    });
  }
}
