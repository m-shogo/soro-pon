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

type ResultSignature = {
  title: string;
  scoreRole: string | null;
  totalPoints: string | null;
};

async function boot(page: Page, skin: SkinId, size: CaptureSize) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript(({ skinId, nowMs }) => {
    // Keep the production seed/session path deterministic. No MatchState or
    // Result state is injected; AppRoot still creates the match seed itself.
    Date.now = () => nowMs;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);

    // Match progression uses timeouts only to pace CPU/flow presentation. Cap
    // those waits so evidence runs stay fast without bypassing engine actions.
    const nativeSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
      nativeSetTimeout(handler, Math.min(Number(timeout ?? 0), 8), ...args)) as typeof window.setTimeout;
  }, { skinId: skin, nowMs: FIXED_NOW_MS });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);
}

async function expectViewportContract(page: Page) {
  const result = await page.evaluate(() => {
    const viewport = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
    const controls = [
      ...document.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary',
      ),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
    });

    return {
      overflow:
        document.documentElement.scrollWidth > viewport.width + 1 ||
        document.documentElement.scrollHeight > viewport.height + 1,
      tooSmall: controls
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width < 24 || rect.height < 24;
        })
        .map((element) => element.getAttribute('aria-label') ?? element.textContent?.trim() ?? element.tagName),
    };
  });

  expect(result.overflow).toBe(false);
  expect(result.tooSmall).toEqual([]);
}

async function inspectResultComposition(page: Page) {
  return page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>('.sp-result-screen__stage');
    const main = document.querySelector<HTMLElement>('.sp-result-screen__main');
    const side = document.querySelector<HTMLElement>('.sp-result-screen__side');
    const ledger = document.querySelector<HTMLElement>('.sp-result-screen__ledger');
    const actions = document.querySelector<HTMLElement>('.sp-result-screen__actions');
    if (!stage || !main || !side || !ledger || !actions) return null;

    const visible = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const panels = [...ledger.querySelectorAll<HTMLElement>(':scope > .sp-paper-panel')];
    const skinLayers = [
      ...ledger.querySelectorAll<HTMLElement>(':scope > .sp-paper-panel > .sp-skin-layer'),
    ];
    const buttons = [...actions.querySelectorAll<HTMLButtonElement>('button')].filter(visible);
    const stageRect = stage.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    const sideRect = side.getBoundingClientRect();

    return {
      stageWidth: stageRect.width,
      mainWidth: mainRect.width,
      sideWidth: sideRect.width,
      sideRightOfMain: sideRect.left >= mainRect.right - 1,
      sideTopAlignedWithMain: Math.abs(sideRect.top - mainRect.top) <= 2,
      sideOverflow: side.scrollWidth > side.clientWidth + 1 || side.scrollHeight > side.clientHeight + 1,
      ledgerOverflow:
        ledger.scrollWidth > ledger.clientWidth + 1 || ledger.scrollHeight > ledger.clientHeight + 1,
      actionsOverflow:
        actions.scrollWidth > actions.clientWidth + 1 || actions.scrollHeight > actions.clientHeight + 1,
      actionCount: buttons.length,
      maxPanelRadius:
        panels.length === 0
          ? 0
          : Math.max(
              ...panels.map((panel) => Number.parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 0),
            ),
      panelsShadowless: panels.every((panel) => getComputedStyle(panel).boxShadow === 'none'),
      visibleSkinLayerCount: skinLayers.filter(visible).length,
    };
  });
}

async function expectResultComposition(page: Page, size: CaptureSize) {
  const geometry = await inspectResultComposition(page);
  expect(geometry).not.toBeNull();
  expect(geometry?.sideRightOfMain).toBe(true);
  expect(geometry?.sideOverflow).toBe(false);
  expect(geometry?.ledgerOverflow).toBe(false);
  expect(geometry?.actionsOverflow).toBe(false);
  expect(geometry?.actionCount).toBe(3);

  if (size.label === 'compact') {
    expect(geometry?.sideWidth ?? 0).toBeGreaterThanOrEqual(160);
    expect(geometry?.sideWidth ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(174);
    expect((geometry?.mainWidth ?? 0) / (geometry?.stageWidth ?? 1)).toBeGreaterThanOrEqual(0.76);
    expect(geometry?.maxPanelRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
    expect(geometry?.panelsShadowless).toBe(true);
    expect(geometry?.visibleSkinLayerCount).toBe(0);
  } else {
    expect(geometry?.sideTopAlignedWithMain).toBe(true);
    expect(geometry?.sideWidth ?? 0).toBeGreaterThanOrEqual(214);
    expect((geometry?.sideWidth ?? 0) / (geometry?.stageWidth ?? 1)).toBeGreaterThanOrEqual(0.2);
  }
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
    ) {
      return 'result';
    }
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

async function readResultSignature(page: Page): Promise<ResultSignature> {
  // TotalPoints is a presentational count-up; wait for it to settle before
  // comparing semantic Result output between two identical production runs.
  await page.waitForTimeout(700);
  const title = (await page.locator('.sp-result-frame .sp-paper-panel__title').innerText()).trim();
  const scoreRoleLocator = page.locator('.sp-score-breakdown__row').first();
  const totalPointsLocator = page.locator('.sp-score-breakdown__total-points');
  return {
    title,
    scoreRole: (await scoreRoleLocator.count()) > 0 ? (await scoreRoleLocator.innerText()).trim() : null,
    totalPoints: (await totalPointsLocator.count()) > 0 ? (await totalPointsLocator.innerText()).trim() : null,
  };
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`${skin} ${size.label} real-match result review`, async ({ page }) => {
      test.setTimeout(45_000);
      await boot(page, skin, size);
      await playRealMatchToResult(page);

      await expect(page.getByRole('heading', { name: '対戦結果' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'もう一局' })).toBeVisible();
      await expect(page.getByRole('button', { name: '記憶帳を見る' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'TOPへ' })).toBeVisible();
      await expectViewportContract(page);
      await expectResultComposition(page, size);

      await mkdir(CAPTURE_DIR, { recursive: true });
      await page.screenshot({
        path: join(CAPTURE_DIR, `result-${skin}-${size.label}.png`),
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
}

test('fixed seed repeats the same semantic Result through real UI actions', async ({ page }) => {
  test.setTimeout(45_000);
  const skin: SkinId = 'yorunoshirube';
  const size: CaptureSize = { width: 844, height: 390, label: 'compact' };

  await boot(page, skin, size);
  await playRealMatchToResult(page);
  const first = await readResultSignature(page);

  // Re-run from a fresh app/storage state while keeping the exact same upstream
  // Date.now seed input and the same action-ready UI policy.
  await boot(page, skin, size);
  await playRealMatchToResult(page);
  const second = await readResultSignature(page);

  expect(second).toEqual(first);
});
