import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const NAMES = [
  {
    id: 'japanese',
    value: '夜更けの記憶を集める動物スターター改訂版・旅路と星空と約束のデッキ'.repeat(3).slice(0, 80),
  },
  {
    id: 'latin',
    value: 'LANTERN-MEMORY-EXPEDITION-DECK-'.repeat(3).slice(0, 80),
  },
] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;
const CAPTURE_DIR = 'test-results/batch14-review';

type SkinId = (typeof SKINS)[number];
type CaptureSize = (typeof SIZES)[number];

async function bootEditor(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript((skinId) => {
    Date.now = () => 1_700_000_700_000;
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

async function inspectLongNameLedger(page: Page) {
  return page.evaluate(() => {
    const ledger = document.querySelector<HTMLElement>('.sp-deck-basic-ledger');
    const identity = ledger?.querySelector<HTMLElement>('.sp-deck-basic-ledger__identity') ?? null;
    const head = identity?.querySelector<HTMLElement>('.sp-deck-basic-ledger__identity-head') ?? null;
    const label = head?.querySelector<HTMLElement>(':scope > span') ?? null;
    const name = head?.querySelector<HTMLElement>(':scope > strong') ?? null;
    const rack = identity?.querySelector<HTMLElement>('.sp-deck-basic-ledger__rack') ?? null;
    const metrics = identity?.querySelector<HTMLElement>('.sp-deck-basic-ledger__metrics') ?? null;
    if (!ledger || !identity || !head || !label || !name || !rack || !metrics) return null;

    const headRect = head.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const nameRect = name.getBoundingClientRect();
    const rackRect = rack.getBoundingClientRect();
    const tileRects = [...rack.querySelectorAll<HTMLElement>('.sp-tile')].map((tile) =>
      tile.getBoundingClientRect(),
    );
    const metricCells = [...metrics.querySelectorAll<HTMLElement>(':scope > div')];
    const nameStyle = getComputedStyle(name);
    const labelStyle = getComputedStyle(label);

    return {
      labelText: label.textContent?.trim(),
      labelSingleLine: labelStyle.whiteSpace === 'nowrap' && label.scrollHeight <= label.clientHeight + 1,
      labelFullyVisible: label.scrollWidth <= label.clientWidth + 1,
      nameText: name.textContent?.trim(),
      nameEllipsis: nameStyle.textOverflow === 'ellipsis',
      nameSingleLine: nameStyle.whiteSpace === 'nowrap' && name.scrollHeight <= name.clientHeight + 1,
      nameActuallyClipped: name.scrollWidth > name.clientWidth + 1,
      headContainsChildren:
        labelRect.left >= headRect.left - 1 &&
        nameRect.right <= headRect.right + 1 &&
        labelRect.right <= nameRect.left + 1,
      headOverflow: head.scrollWidth > head.clientWidth + 1 || head.scrollHeight > head.clientHeight + 1,
      rackTileCount: tileRects.length,
      rackContainsTiles: tileRects.every(
        (rect) => rect.left >= rackRect.left - 1 && rect.right <= rackRect.right + 1,
      ),
      metricCellCount: metricCells.length,
      metricOverflow:
        metrics.scrollWidth > metrics.clientWidth + 1 || metrics.scrollHeight > metrics.clientHeight + 1,
      viewportOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
        document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
    };
  });
}

for (const skin of SKINS) {
  for (const longName of NAMES) {
    for (const size of SIZES) {
      test(`${skin} ${longName.id} ${size.label} long deck name stays inside the Basic ledger`, async ({ page }) => {
        await bootEditor(page, skin, size);

        const input = page.getByRole('textbox', { name: 'デッキ名' });
        await input.fill(longName.value);
        await expect(input).toHaveValue(longName.value);
        await expect(page.getByRole('button', { name: '保存する' })).toBeEnabled();

        const geometry = await inspectLongNameLedger(page);
        expect(geometry).not.toBeNull();
        expect(geometry?.labelText).toBe('DECK FACE');
        expect(geometry?.labelSingleLine).toBe(true);
        expect(geometry?.labelFullyVisible).toBe(true);
        expect(geometry?.nameText).toBe(longName.value);
        expect(geometry?.nameEllipsis).toBe(true);
        expect(geometry?.nameSingleLine).toBe(true);
        expect(geometry?.nameActuallyClipped).toBe(true);
        expect(geometry?.headContainsChildren).toBe(true);
        expect(geometry?.headOverflow).toBe(false);
        expect(geometry?.rackTileCount).toBe(8);
        expect(geometry?.rackContainsTiles).toBe(true);
        expect(geometry?.metricCellCount).toBe(5);
        expect(geometry?.metricOverflow).toBe(false);
        expect(geometry?.viewportOverflow).toBe(false);

        await mkdir(CAPTURE_DIR, { recursive: true });
        await page.screenshot({
          path: join(
            CAPTURE_DIR,
            `deck-basic-long-name-${skin}-${longName.id}-${size.label}.png`,
          ),
          fullPage: false,
          animations: 'disabled',
          caret: 'hide',
        });
      });
    }
  }
}
