import { expect, test, type Page } from '@playwright/test';

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const PLAYER_COUNTS = [3, 4] as const;
const SIZES = [
  { width: 844, height: 390, label: 'compact' },
  { width: 1440, height: 900, label: 'desktop' },
] as const;

async function openMatch(
  page: Page,
  skin: (typeof SKINS)[number],
  playerCount: (typeof PLAYER_COUNTS)[number],
) {
  await page.addInitScript(
    ({ skinId, nowMs }) => {
      Date.now = () => nowMs;
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', skinId);
    },
    {
      skinId: skin,
      nowMs: playerCount === 3 ? 1_700_000_000_077 : 1_700_000_000_239,
    },
  );
  await page.goto('/');
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.getByRole('button', { name: `${playerCount}人戦` }).click();
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(850);
}

async function expectNoLayoutDefect(page: Page) {
  const result = await page.evaluate(() => {
    const selectors = [
      '.sp-match-layout',
      '.sp-match-utility',
      '.sp-table-stage',
      '.sp-table-seat',
      '.sp-table-center',
      '.sp-self-hand-zone',
      '.sp-match-action-zone',
      '.sp-player-panel',
      '.sp-seat-played',
      '.sp-tile',
      '.sp-button',
    ];
    const elements = [...document.querySelectorAll<HTMLElement>(selectors.join(','))].filter(
      (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
      },
    );
    const viewport = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
    const collisionElements = [
      ...document.querySelectorAll<HTMLElement>(
        '.sp-match-utility, .sp-table-seat, .sp-table-center, .sp-self-hand-zone, .sp-match-action-zone',
      ),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const collisions: string[] = [];
    for (let leftIndex = 0; leftIndex < collisionElements.length; leftIndex += 1) {
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < collisionElements.length;
        rightIndex += 1
      ) {
        const left = collisionElements[leftIndex]!;
        const right = collisionElements[rightIndex]!;
        if (left.contains(right) || right.contains(left)) continue;
        const a = left.getBoundingClientRect();
        const b = right.getBoundingClientRect();
        const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (overlapWidth > 1 && overlapHeight > 1) {
          collisions.push(`${left.className} <> ${right.className}`);
        }
      }
    }
    return {
      documentOverflow:
        document.documentElement.scrollWidth > viewport.width + 1 ||
        document.documentElement.scrollHeight > viewport.height + 1,
      overflow: elements
        .filter(
          (element) =>
            element.scrollWidth > element.clientWidth + 1 ||
            element.scrollHeight > element.clientHeight + 1,
        )
        .map((element) => element.className),
      outside: elements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.left < -0.5 ||
            rect.top < -0.5 ||
            rect.right > viewport.width + 0.5 ||
            rect.bottom > viewport.height + 0.5
          );
        })
        .map((element) => element.className),
      smallTargets: [...document.querySelectorAll<HTMLButtonElement>('button:not([disabled])')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
        })
        .map((element) => element.getAttribute('aria-label') ?? element.textContent),
      collisions,
    };
  });

  expect(result.documentOverflow).toBe(false);
  expect(result.overflow).toEqual([]);
  expect(result.outside).toEqual([]);
  expect(result.smallTargets).toEqual([]);
  expect(result.collisions).toEqual([]);
}

for (const skin of SKINS) {
  for (const playerCount of PLAYER_COUNTS) {
    for (const size of SIZES) {
      test(`${skin} ${playerCount}p ${size.label} table`, async ({ page }) => {
        await page.setViewportSize(size);
        await openMatch(page, skin, playerCount);

        await expect(
          page.getByRole('main', { name: `${playerCount}人戦の対局卓` }),
        ).toBeVisible();
        await expect(page.getByRole('region', { name: '自分の手牌' })).toBeVisible();
        await expect(page.getByRole('region', { name: '対局の操作' })).toBeVisible();
        await expectNoLayoutDefect(page);
        await expect(page).toHaveScreenshot(
          `batch13-table-${skin}-${playerCount}p-${size.label}.png`,
        );
      });
    }
  }
}
