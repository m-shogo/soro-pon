import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Batch 7: Cross-Browser & Screen Reader Acceptance — Tier A visual
// baselines for Firefox and Playwright WebKit (NOT real Safari — see
// docs/qa/BATCH-7-CROSS-BROWSER-A11Y-REPORT.md). Run via
// `pnpm test:visual:crossbrowser` (playwright.crossbrowser.config.ts).
//
// This is deliberately a SEPARATE spec tree from tests/visual/ — the
// existing 70 Chromium baselines there are untouched by this file.
// Screenshot filenames automatically include the Playwright project
// name (firefox/webkit) because playwright.crossbrowser.config.ts
// defines multiple named projects, so there is no naming collision
// with the Chromium suite's unprefixed `-darwin.png` baselines.

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
// Priority viewports per docs/qa/BATCH-7-CROSS-BROWSER-A11Y-MATRIX.md:
// narrowest, standard smartphone landscape, widest desktop.
const SIZES = [
  { width: 844, height: 390 }, // narrowest (reference size)
  { width: 852, height: 393 }, // standard smartphone landscape
  { width: 1366, height: 768 }, // widest desktop
] as const;

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));

async function seedSkin(page: import('@playwright/test').Page, skinId: string) {
  await page.addInitScript((id) => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', id);
  }, skinId);
}

async function seedSkinAndDeck(page: import('@playwright/test').Page, skinId: string) {
  await page.addInitScript(
    ({ id, deck }) => {
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', id);
      window.localStorage.setItem(
        'soro-pon.decks.v1',
        JSON.stringify({ version: 1, decks: [{ deck, source: 'official', updatedAtMs: 1000 }] }),
      );
    },
    { id: skinId, deck: ANIMAL_DECK },
  );
}

for (const skin of SKINS) {
  for (const size of SIZES) {
    const suffix = `${skin}-${size.width}x${size.height}`;

    test(`TOP ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await seedSkin(page, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await expect(page.getByRole('button', { name: /まず遊ぶ/ })).toBeVisible();
      await expect(page).toHaveScreenshot(`top-${suffix}.png`);
    });

    test(`DeckList ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await seedSkinAndDeck(page, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await page.getByRole('button', { name: 'デッキ一覧' }).click();
      await expect(page.locator('.sp-deck-card').first()).toBeVisible();
      await expect(page).toHaveScreenshot(`deck-list-${suffix}.png`);
    });

    test(`DeckEditor ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await seedSkinAndDeck(page, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await page.getByRole('button', { name: 'デッキ一覧' }).click();
      await page.locator('.sp-deck-card').first().click();
      await page.getByRole('button', { name: '編集', exact: true }).click();
      await expect(page.getByRole('button', { name: '保存する' })).toBeVisible();
      await expect(page).toHaveScreenshot(`deck-editor-${suffix}.png`);
    });

    test(`Gallery ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await seedSkin(page, skin);
      await page.goto('/#/gallery');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await expect(page.getByText('Nine-slice実証')).toBeVisible();
      await expect(page).toHaveScreenshot(`gallery-${suffix}.png`);
    });

    test(`MatchSetup ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await seedSkinAndDeck(page, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await page.getByRole('button', { name: /まず遊ぶ/ }).click();
      await expect(page.getByRole('button', { name: '対局開始' })).toBeVisible();
      await expect(page).toHaveScreenshot(`match-setup-${suffix}.png`);
    });

    test(`SkinSelectorModal ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await seedSkin(page, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await page.getByRole('button', { name: /きせかえ/ }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page).toHaveScreenshot(`skin-selector-modal-${suffix}.png`);
    });

    test(`CorruptedStorageRecovery ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.addInitScript(
        ({ id, deck }) => {
          window.localStorage.clear();
          window.localStorage.setItem('soro-pon.skin.v1', id);
          window.localStorage.setItem(
            'soro-pon.decks.v1',
            JSON.stringify({
              version: 1,
              decks: [
                { deck, source: 'official', updatedAtMs: 1000 },
                { deck: { totally: 'broken' }, source: 'created', updatedAtMs: 2000 },
              ],
            }),
          );
        },
        { id: skin, deck: ANIMAL_DECK },
      );
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await expect(page.locator('.sp-toast')).toBeVisible();
      await expect(page).toHaveScreenshot(`corrupted-storage-recovery-${suffix}.png`);
    });

    test(`QuotaExceededToast ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await seedSkinAndDeck(page, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await page.evaluate(() => {
        // Directly reassigning window.localStorage.setItem only works in
        // Chromium — in Firefox/WebKit that assignment silently no-ops
        // (Storage's own setItem is not a writable own-property there),
        // so the quota simulation would never actually trigger. Patching
        // the shared Storage.prototype method works identically across
        // all three engines (verified).
        const proto = Object.getPrototypeOf(window.localStorage);
        const orig = proto.setItem;
        proto.setItem = function (key: string, value: string) {
          if (key === 'soro-pon.decks.v1') {
            throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
          }
          return orig.call(this, key, value);
        };
      });
      await page.getByRole('button', { name: 'デッキ一覧' }).click();
      await page.locator('.sp-deck-card').first().click();
      await page.getByRole('button', { name: '編集', exact: true }).click();
      await page.getByRole('tab', { name: /カテゴリ/ }).click();
      await page.getByRole('button', { name: 'カテゴリを追加' }).click();
      await page.getByRole('button', { name: '保存する' }).click();
      await expect(page.locator('.sp-toast')).toBeVisible();
      await expect(page).toHaveScreenshot(`quota-exceeded-toast-${suffix}.png`);
    });
  }
}
