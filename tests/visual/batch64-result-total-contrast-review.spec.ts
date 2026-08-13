import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;
const CAPTURE_DIR = 'test-results/batch14-review';
const FIXED_NOW_MS = 1_700_000_230_000;

type SkinId = (typeof SKINS)[number];
type CaptureSize = (typeof SIZES)[number];
type ReadyAction = 'result' | 'tsumo' | 'ron' | 'discard' | 'tile';

async function boot(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript(({ skinId, nowMs }) => {
    Date.now = () => nowMs;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);

    const nativeSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
      nativeSetTimeout(handler, Math.min(Number(timeout ?? 0), 8), ...args)) as typeof window.setTimeout;
  }, { skinId: skin, nowMs: FIXED_NOW_MS });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);
}

async function waitForReadyAction(page: Page): Promise<ReadyAction> {
  const handle = await page.waitForFunction(() => {
    const isVisible = (element: Element | null): element is HTMLElement => {
      if (!(element instanceof HTMLElement)) return false;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
    };
    const enabledButtons = [...document.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];
    const hasButton = (label: string) =>
      enabledButtons.some((button) => button.textContent?.trim() === label && isVisible(button));

    if (
      [...document.querySelectorAll('h1')].some(
        (heading) => heading.textContent?.trim() === '対戦結果' && isVisible(heading),
      )
    ) return 'result';
    if (hasButton('ツモ')) return 'tsumo';
    if (hasButton('ロン')) return 'ron';
    if (hasButton('捨てる')) return 'discard';
    if (isVisible(document.querySelector('.sp-self-hand-zone .sp-tile:not([disabled])'))) return 'tile';
    return null;
  }, undefined, { timeout: 5_000 });

  return (await handle.jsonValue()) as ReadyAction;
}

async function playRealMatchToResult(page: Page) {
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await expect(page.getByRole('heading', { name: '対局設定' })).toBeVisible();
  await page.getByRole('button', { name: '3人戦', exact: true }).click();
  await page.getByRole('button', { name: '3人戦をはじめる' }).click();
  await expect(page.getByRole('main', { name: '3人戦の対局卓' })).toBeVisible();

  for (let step = 0; step < 240; step += 1) {
    const action = await waitForReadyAction(page);
    if (action === 'result') return;
    if (action === 'tsumo') {
      await page.getByRole('button', { name: 'ツモ', exact: true }).click();
      continue;
    }
    if (action === 'ron') {
      await page.getByRole('button', { name: 'ロン', exact: true }).click();
      continue;
    }
    if (action === 'discard') {
      await page.getByRole('button', { name: '捨てる', exact: true }).click();
      continue;
    }
    await page.locator('.sp-self-hand-zone .sp-tile:not([disabled])').first().click();
  }

  throw new Error('実対局を240操作以内にResultまで進行できませんでした');
}

async function inspectTotalContrast(page: Page) {
  return page.evaluate(() => {
    const total = document.querySelector<HTMLElement>('.sp-score-breakdown__total');
    const value = document.querySelector<HTMLElement>('.sp-score-breakdown__total-points');
    const resultScreen = document.querySelector<HTMLElement>('.sp-result-screen');
    if (!total || !value || !resultScreen) return null;

    const parseRgb = (input: string) => {
      const match = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return match ? [Number(match[1]), Number(match[2]), Number(match[3])] as const : null;
    };
    const relativeLuminance = (rgb: readonly [number, number, number]) => {
      const linear = rgb.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const contrastRatio = (a: readonly [number, number, number], b: readonly [number, number, number]) => {
      const l1 = relativeLuminance(a);
      const l2 = relativeLuminance(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    const totalStyle = getComputedStyle(total);
    const foreground = parseRgb(totalStyle.color);
    const background = parseRgb(totalStyle.backgroundColor);

    const semanticProbe = document.createElement('span');
    semanticProbe.style.color = 'var(--sp-result-total-text)';
    semanticProbe.style.backgroundColor = 'var(--sp-result-total-surface)';
    semanticProbe.style.position = 'fixed';
    semanticProbe.style.visibility = 'hidden';
    resultScreen.append(semanticProbe);
    const semanticStyle = getComputedStyle(semanticProbe);
    const semanticTextColor = semanticStyle.color;
    const semanticSurfaceColor = semanticStyle.backgroundColor;
    semanticProbe.remove();

    const rect = total.getBoundingClientRect();
    const valueRect = value.getBoundingClientRect();
    return {
      label: total.firstElementChild?.textContent?.trim() ?? '',
      value: value.textContent?.trim() ?? '',
      foreground: totalStyle.color,
      background: totalStyle.backgroundColor,
      semanticTextColor,
      semanticSurfaceColor,
      contrast: foreground && background ? contrastRatio(foreground, background) : 0,
      totalVisible: rect.width > 0 && rect.height > 0,
      valueVisible: valueRect.width > 0 && valueRect.height > 0,
      overflow: total.scrollWidth > total.clientWidth + 1 || total.scrollHeight > total.clientHeight + 1,
    };
  });
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`Batch 64 Result total contrast ${skin} ${size.label}`, async ({ page }) => {
      test.setTimeout(45_000);
      await boot(page, skin, size);
      await playRealMatchToResult(page);
      await expect(page.getByRole('heading', { name: '対戦結果' })).toBeVisible();
      await page.waitForTimeout(700);

      const total = await inspectTotalContrast(page);
      expect(total).not.toBeNull();
      expect(total?.label).toBe('合計得点');
      expect(Number(total?.value ?? 0)).toBeGreaterThan(0);
      expect(total?.totalVisible).toBe(true);
      expect(total?.valueVisible).toBe(true);
      expect(total?.overflow).toBe(false);
      expect(total?.foreground).toBe(total?.semanticTextColor);
      expect(total?.background).toBe(total?.semanticSurfaceColor);
      expect(total?.contrast ?? 0).toBeGreaterThanOrEqual(4.5);

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `result-total-contrast-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
}
