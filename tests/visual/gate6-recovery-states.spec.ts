import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { trackResponses, waitForSkinAssetsReady } from './skinAssetReady';

// Gate 6: visual regression for recovery/migration states introduced or
// verified this batch (docs/qa/BATCH-6-GATE-6-QA-MATRIX.md Phase 9).
// All states here are deterministic (no match-seed randomness), so unlike
// the Result screen these are safe for strict pixel baselines.

const SKINS = ['yorunoshirube', 'cute-pop'] as const;
const SIZES = [
  { width: 844, height: 390 },
  { width: 1366, height: 768 },
] as const; // Tier B: phone + desktop representative, matches Batch 5's own Tier B convention

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));

for (const skin of SKINS) {
  for (const size of SIZES) {
    const suffix = `${skin}-${size.width}x${size.height}`;

    test(`ResetConfirmation ${suffix}`, async ({ page }) => {
      const responses = trackResponses(page);
      await page.setViewportSize(size);
      await page.addInitScript((skinId) => {
        window.localStorage.clear();
        window.localStorage.setItem('soro-pon.skin.v1', skinId);
      }, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await page.getByRole('button', { name: 'ローカルデータを初期化…' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await waitForSkinAssetsReady(page, skin, responses);
      await expect(page).toHaveScreenshot(`reset-confirmation-${suffix}.png`);
    });

    test(`QuotaExceededToast ${suffix}`, async ({ page }) => {
      const responses = trackResponses(page);
      await page.setViewportSize(size);
      await page.addInitScript(
        ({ skinId, deck }) => {
          window.localStorage.clear();
          window.localStorage.setItem('soro-pon.skin.v1', skinId);
          window.localStorage.setItem(
            'soro-pon.decks.v1',
            JSON.stringify({ version: 1, decks: [{ deck, source: 'official', updatedAtMs: 1000 }] }),
          );
        },
        { skinId: skin, deck: ANIMAL_DECK },
      );
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      // quota超過をmonkey-patchで再現する(実quotaを本当に枯渇させない)
      await page.evaluate(() => {
        const orig = window.localStorage.setItem.bind(window.localStorage);
        window.localStorage.setItem = (key: string, value: string) => {
          if (key === 'soro-pon.decks.v1') {
            throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
          }
          return orig(key, value);
        };
      });
      await page.getByRole('button', { name: 'デッキ一覧' }).click();
      await page.locator('.sp-deck-card').first().click();
      await page.getByRole('button', { name: '編集' }).click();
      await page.getByRole('tab', { name: /カテゴリ/ }).click();
      await page.getByRole('button', { name: 'カテゴリを追加' }).click();
      await page.getByRole('button', { name: '保存する' }).click();
      await expect(page.locator('.sp-toast')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await waitForSkinAssetsReady(page, skin, responses);
      await expect(page).toHaveScreenshot(`quota-exceeded-toast-${suffix}.png`);
    });

    test(`PartialSalvageToast ${suffix}`, async ({ page }) => {
      const responses = trackResponses(page);
      await page.setViewportSize(size);
      await page.addInitScript(
        ({ skinId, deck }) => {
          window.localStorage.clear();
          window.localStorage.setItem('soro-pon.skin.v1', skinId);
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
        { skinId: skin, deck: ANIMAL_DECK },
      );
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await expect(page.locator('.sp-toast')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await waitForSkinAssetsReady(page, skin, responses);
      await expect(page).toHaveScreenshot(`partial-salvage-toast-${suffix}.png`);
    });
  }
}

// invalid skin fallback: skin-agnostic outcome by definition, one representative case per size
for (const size of SIZES) {
  test(`InvalidSkinFallback ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', 'not-a-real-skin-id');
    });
    await page.goto('/');
    await page.waitForSelector('html[data-skin="yorunoshirube"]');
    await expect(page.getByRole('button', { name: /まず遊ぶ/ })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`invalid-skin-fallback-${size.width}x${size.height}.png`);
  });
}
