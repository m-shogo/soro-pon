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

async function boot(page: Page, skin: SkinId, size: CaptureSize, seedOffset = 0) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.addInitScript(
    ({ skinId, nowMs }) => {
      Date.now = () => nowMs;
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', skinId);
    },
    {
      skinId: skin,
      nowMs: 1_700_000_000_000 + seedOffset,
    },
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'soro-pon' })).toBeVisible();
}

async function capture(page: Page, name: string) {
  await mkdir(CAPTURE_DIR, { recursive: true });
  await page.screenshot({
    path: join(CAPTURE_DIR, `${name}.png`),
    fullPage: false,
    animations: 'disabled',
    caret: 'hide',
  });
}

async function expectViewportContract(page: Page) {
  const result = await page.evaluate(() => {
    const viewport = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
    const visibleInteractive = [
      ...document.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [role="tab"]',
      ),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
    });
    const frequentMatchActions = [
      ...document.querySelectorAll<HTMLElement>('.sp-match-action-zone button:not([disabled])'),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    const pointerTarget = (element: HTMLElement): HTMLElement => {
      if (
        element instanceof HTMLInputElement &&
        (element.type === 'checkbox' || element.type === 'radio')
      ) {
        const label = element.closest('label');
        if (label instanceof HTMLElement) {
          return label;
        }
      }
      return element;
    };

    const targetName = (element: HTMLElement, target: HTMLElement): string =>
      element.getAttribute('aria-label') ??
      target.getAttribute('aria-label') ??
      target.textContent?.trim() ??
      element.textContent?.trim() ??
      element.tagName.toLowerCase();

    return {
      documentOverflow:
        document.documentElement.scrollWidth > viewport.width + 1 ||
        document.documentElement.scrollHeight > viewport.height + 1,
      smallerThanWcagMinimum: visibleInteractive
        .map((element) => ({ element, target: pointerTarget(element) }))
        .filter(({ target }) => {
          const rect = target.getBoundingClientRect();
          return rect.width < 24 || rect.height < 24;
        })
        .map(({ element, target }) => targetName(element, target)),
      smallFrequentMatchActions: frequentMatchActions
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        })
        .map((element) => element.getAttribute('aria-label') ?? element.textContent?.trim()),
    };
  });

  expect(result.documentOverflow).toBe(false);
  expect(result.smallerThanWcagMinimum).toEqual([]);
  expect(result.smallFrequentMatchActions).toEqual([]);
}

async function expectMatchGeometry(page: Page) {
  const result = await page.evaluate(() => {
    const viewport = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
    const geometrySelectors = [
      '.sp-match-utility',
      '.sp-table-stage',
      '.sp-table-seat',
      '.sp-table-center',
      '.sp-self-hand-zone',
      '.sp-match-action-zone',
      '.sp-player-panel',
      '.sp-seat-played',
      '.sp-tile',
    ];
    const elements = [
      ...document.querySelectorAll<HTMLElement>(geometrySelectors.join(',')),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
    });

    // Seats intentionally use overflow: visible so each discard river can leave
    // the metadata footprint and enter the shared table surface. Treat that as
    // composition, not clipping. Containers that are expected to contain their
    // own content still must not need scrolling.
    const boundedOverflowElements = [
      ...document.querySelectorAll<HTMLElement>(
        '.sp-match-utility, .sp-table-stage, .sp-table-center, .sp-self-hand-zone, .sp-match-action-zone, .sp-player-panel',
      ),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    // Compact mode deliberately overlays broad wrapper regions: utility spans
    // the board while only its identity/button are painted, and the action-zone
    // sits above a right-side gap reserved by hand padding. Detect real visual
    // occlusion by comparing painted controls/game objects, not those wrappers.
    const collisionElements = [
      ...document.querySelectorAll<HTMLElement>(
        '.sp-match-utility__identity, .sp-match-utility > .sp-button, .sp-player-panel, .sp-table-center, .sp-self-hand-zone .sp-tile, .sp-match-action-zone .sp-button',
      ),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
    });
    const collisions: string[] = [];

    for (let leftIndex = 0; leftIndex < collisionElements.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < collisionElements.length; rightIndex += 1) {
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
      overflow: boundedOverflowElements
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
      collisions,
    };
  });

  expect(result.overflow).toEqual([]);
  expect(result.outside).toEqual([]);
  expect(result.collisions).toEqual([]);
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    test(`${skin} ${size.label} shell flow review capture`, async ({ page }) => {
      await boot(page, skin, size, size.width + size.height);

      await capture(page, `top-${skin}-${size.label}`);
      await expectViewportContract(page);

      await page.getByRole('button', { name: /デッキ一覧/ }).click();
      await expect(page.getByRole('heading', { name: 'デッキ選択' })).toBeVisible();
      await capture(page, `deck-list-${skin}-${size.label}`);
      await expectViewportContract(page);

      const firstDeck = page.locator('.sp-deck-select-card').first();
      await expect(firstDeck).toBeVisible();
      await firstDeck.click();
      await expect(page.getByRole('button', { name: 'デッキを編集' })).toBeVisible();
      await capture(page, `deck-detail-${skin}-${size.label}`);
      await expectViewportContract(page);

      await page.getByRole('button', { name: 'デッキを編集' }).click();
      await expect(page.getByRole('heading', { name: 'デッキ編集' })).toBeVisible();
      await capture(page, `deck-editor-${skin}-${size.label}`);
      await expectViewportContract(page);

      await page.getByRole('tab', { name: /^牌/ }).click();
      await expect(page.getByRole('tabpanel')).toHaveAttribute('id', 'sp-tabpanel-tiles');
      await capture(page, `deck-editor-tiles-${skin}-${size.label}`);
      await expectViewportContract(page);

      await page.getByRole('tab', { name: /^役/ }).click();
      await expect(page.getByRole('tabpanel')).toHaveAttribute('id', 'sp-tabpanel-roles');
      await capture(page, `deck-editor-roles-${skin}-${size.label}`);
      await expectViewportContract(page);
    });
  }

  for (const playerCount of PLAYER_COUNTS) {
    for (const size of SIZES) {
      test(`${skin} ${playerCount}p ${size.label} match review capture`, async ({ page }) => {
        await boot(page, skin, size, playerCount * 1000 + size.width);

        await page.getByRole('button', { name: /まず遊ぶ/ }).click();
        await expect(page.getByRole('heading', { name: '対局設定' })).toBeVisible();
        await page.getByRole('button', { name: `${playerCount}人戦`, exact: true }).click();
        await capture(page, `match-setup-${skin}-${playerCount}p-${size.label}`);
        await expectViewportContract(page);

        await page.getByRole('button', { name: `${playerCount}人戦をはじめる` }).click();
        await expect(
          page.getByRole('main', { name: `${playerCount}人戦の対局卓` }),
        ).toBeVisible();
        await capture(page, `match-${skin}-${playerCount}p-${size.label}`);
        await expectViewportContract(page);
        await expectMatchGeometry(page);

        if (size.label === 'compact' && playerCount === 4) {
          const firstTile = page.locator('.sp-self-hand-zone .sp-tile').first();
          await expect(firstTile).toBeVisible();
          await firstTile.click();
          await expect(firstTile).toHaveAttribute('aria-pressed', 'true');
          await capture(page, `match-action-${skin}-4p-compact`);
          await expectViewportContract(page);
          await expectMatchGeometry(page);
        }
      });
    }
  }
}
