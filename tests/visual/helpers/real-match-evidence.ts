import { expect, type Page } from '@playwright/test';

export const FIXED_EVIDENCE_NOW_MS = 1_700_000_230_000;

export type EvidenceSkinId = 'yorunoshirube' | 'cute-pop';
export type EvidenceSize = { width: number; height: number; label: 'compact' | 'desktop' };
export type ReadyAction = 'result' | 'tsumo' | 'ron' | 'discard' | 'tile';
export type ResultSignature = {
  title: string;
  scoreRole: string | null;
  totalPoints: string | null;
};

export async function bootRealMatchEvidence(
  page: Page,
  skin: EvidenceSkinId,
  size: EvidenceSize,
  nowMs = FIXED_EVIDENCE_NOW_MS,
) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript(({ skinId, fixedNowMs }) => {
    Date.now = () => fixedNowMs;
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', skinId);

    // Production CPU/phase actions remain intact. Only presentation pacing is
    // capped so evidence runs are practical in CI.
    const nativeSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
      nativeSetTimeout(handler, Math.min(Number(timeout ?? 0), 8), ...args)) as typeof window.setTimeout;
  }, { skinId: skin, fixedNowMs: nowMs });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.skin)).toBe(skin);
}

export async function expectEvidenceViewportContract(page: Page) {
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

export async function waitForReadyAction(page: Page): Promise<ReadyAction> {
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

export async function startRealMatch(page: Page, playerCount: 3 | 4) {
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await expect(page.getByRole('heading', { name: '対局設定' })).toBeVisible();
  await page.getByRole('button', { name: `${playerCount}人戦`, exact: true }).click();
  await page.getByRole('button', { name: `${playerCount}人戦をはじめる` }).click();
  await expect(page.getByRole('main', { name: `${playerCount}人戦の対局卓` })).toBeVisible();
}

export async function performReadyAction(page: Page): Promise<ReadyAction> {
  const action = await waitForReadyAction(page);
  if (action === 'result') return action;
  if (action === 'tsumo') {
    await page.getByRole('button', { name: 'ツモ', exact: true }).click();
    return action;
  }
  if (action === 'ron') {
    await page.getByRole('button', { name: 'ロン', exact: true }).click();
    return action;
  }
  if (action === 'discard') {
    await page.getByRole('button', { name: '捨てる', exact: true }).click();
    return action;
  }
  await page.locator('.sp-self-hand-zone .sp-tile:not([disabled])').first().click();
  return action;
}

export async function playRealMatchToResult(page: Page, playerCount: 3 | 4 = 3) {
  await startRealMatch(page, playerCount);
  for (let step = 0; step < 240; step += 1) {
    if ((await performReadyAction(page)) === 'result') return;
  }
  throw new Error('実対局を240操作以内にResultまで進行できませんでした');
}

export async function countVisibleDiscards(page: Page): Promise<number> {
  return page.locator('.sp-seat-played__tiles .sp-tile').count();
}

export async function playRealMatchToDiscardCount(
  page: Page,
  playerCount: 3 | 4,
  targetDiscards: number,
): Promise<number> {
  await startRealMatch(page, playerCount);
  for (let step = 0; step < 180; step += 1) {
    const discardCount = await countVisibleDiscards(page);
    if (discardCount >= targetDiscards) return discardCount;
    if ((await performReadyAction(page)) === 'result') {
      throw new Error(`中盤capture前にResultへ到達しました: ${discardCount}/${targetDiscards}捨て牌`);
    }
  }
  throw new Error(`${targetDiscards}捨て牌へ180操作以内に到達できませんでした`);
}

export async function readResultSignature(page: Page): Promise<ResultSignature> {
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
