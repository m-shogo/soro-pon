import { mkdir } from 'node:fs/promises';
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
type PlayerCount = (typeof PLAYER_COUNTS)[number];

async function openMatchSetup(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript((skinId) => {
    Date.now = () => 1_700_000_660_000;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);
  }, skin);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await expect(page.getByRole('heading', { name: '対局設定' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function inspectPlayerCountLedger(page: Page) {
  return page.evaluate(() => {
    const rail = document.querySelector<HTMLElement>('.sp-match-setup__count-options');
    const lobby = document.querySelector<HTMLElement>('.sp-match-setup__lobby');
    const center = document.querySelector<HTMLElement>('.sp-match-setup__lobby-center');
    const actions = document.querySelector<HTMLElement>('.sp-match-setup__actions');
    if (!rail || !lobby || !center || !actions) return null;

    const buttons = [...rail.querySelectorAll<HTMLButtonElement>('.sp-button')];
    const visibleSkinLayers = [
      ...rail.querySelectorAll<HTMLElement>('.sp-button > .sp-skin-layer'),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    const pressed = buttons.filter((button) => button.getAttribute('aria-pressed') === 'true');
    const seats = [...lobby.querySelectorAll<HTMLElement>(':scope > .sp-match-setup__lobby-seat')];
    const startButton = actions.querySelector<HTMLButtonElement>('.sp-button');
    const railRect = rail.getBoundingClientRect();
    const radius = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      return Math.max(
        Number.parseFloat(style.borderTopLeftRadius) || 0,
        Number.parseFloat(style.borderTopRightRadius) || 0,
        Number.parseFloat(style.borderBottomLeftRadius) || 0,
        Number.parseFloat(style.borderBottomRightRadius) || 0,
      );
    };

    return {
      buttonCount: buttons.length,
      labels: buttons.map((button) => button.textContent?.trim() ?? ''),
      disabledCount: buttons.filter((button) => button.disabled).length,
      pressedCount: pressed.length,
      pressedLabel: pressed[0]?.textContent?.trim() ?? '',
      pressedAccentWidth:
        pressed.length === 0 ? 0 : Number.parseFloat(getComputedStyle(pressed[0]).borderBottomWidth) || 0,
      gap: Number.parseFloat(getComputedStyle(rail).columnGap) || 0,
      maxRadius: Math.max(...buttons.map(radius)),
      minTargetHeight: Math.min(...buttons.map((button) => button.getBoundingClientRect().height)),
      allShadowless: buttons.every((button) => getComputedStyle(button).boxShadow === 'none'),
      allTransparent: buttons.every((button) => getComputedStyle(button).backgroundColor === 'rgba(0, 0, 0, 0)'),
      visibleSkinLayerCount: visibleSkinLayers.length,
      railOverflow: rail.scrollWidth > rail.clientWidth + 1 || rail.scrollHeight > rail.clientHeight + 1,
      buttonsWithinRail: buttons.every((button) => {
        const rect = button.getBoundingClientRect();
        return rect.left >= railRect.left - 0.5 && rect.right <= railRect.right + 0.5 &&
          rect.top >= railRect.top - 0.5 && rect.bottom <= railRect.bottom + 0.5;
      }),
      lobbySeatCount: seats.length,
      centerText: center.querySelector('strong')?.textContent?.trim() ?? '',
      startLabel: startButton?.textContent?.trim() ?? '',
    };
  });
}

for (const skin of SKINS) {
  for (const playerCount of PLAYER_COUNTS) {
    for (const size of SIZES) {
      test(`Batch 66 MatchSetup player-count ledger ${skin} ${playerCount}p ${size.label}`, async ({ page }) => {
        await openMatchSetup(page, skin, size);
        const target = page.getByRole('button', { name: `${playerCount}人戦`, exact: true });
        await expect(target).toBeEnabled();
        await target.click();
        await expect(target).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByRole('button', { name: `${playerCount}人戦をはじめる`, exact: true })).toBeVisible();

        const geometry = await inspectPlayerCountLedger(page);
        expect(geometry).not.toBeNull();
        expect(geometry?.buttonCount).toBe(2);
        expect(geometry?.labels).toEqual(['3人戦', '4人戦']);
        expect(geometry?.disabledCount).toBe(0);
        expect(geometry?.pressedCount).toBe(1);
        expect(geometry?.pressedLabel).toBe(`${playerCount}人戦`);
        expect(geometry?.pressedAccentWidth ?? 0).toBeGreaterThanOrEqual(2);
        expect(geometry?.gap).toBe(0);
        expect(geometry?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
        expect(geometry?.minTargetHeight ?? 0).toBeGreaterThanOrEqual(32);
        expect(geometry?.allShadowless).toBe(true);
        expect(geometry?.allTransparent).toBe(true);
        expect(geometry?.visibleSkinLayerCount).toBe(0);
        expect(geometry?.railOverflow).toBe(false);
        expect(geometry?.buttonsWithinRail).toBe(true);
        expect(geometry?.lobbySeatCount).toBe(playerCount);
        expect(geometry?.centerText).toBe(`${playerCount}人戦`);
        expect(geometry?.startLabel).toBe(`${playerCount}人戦をはじめる`);

        await mkdir(CAPTURE_DIR, { recursive: true });
        await page.screenshot({
          path: join(CAPTURE_DIR, `match-setup-player-count-ledger-${skin}-${playerCount}p-${size.label}.png`),
          fullPage: false,
          animations: 'disabled',
          caret: 'hide',
        });
      });
    }
  }
}
