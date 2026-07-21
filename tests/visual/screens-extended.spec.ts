import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { trackResponses, waitForSkinAssetsReady } from './skinAssetReady';

// Batch 5: visual regressionのTier A/B拡張(docs/qa/BATCH-5-QA-MATRIX.md参照)。
// Tier A(全skin×全5viewport): Result
// Tier B(両skin×phone/desktop代表2viewport): DeckEditor, DeckList, きせかえModal

const SIZES = [
  { width: 844, height: 390 },
  { width: 852, height: 393 },
  { width: 932, height: 430 },
  { width: 1024, height: 600 },
  { width: 1366, height: 768 },
] as const;

const TIER_B_SIZES = [SIZES[0], SIZES[4]] as const; // phone代表 + desktop代表

const SKINS = ['yorunoshirube', 'cute-pop'] as const;

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));

async function seedDeck(page: import('@playwright/test').Page, skinId: string) {
  await page.addInitScript(
    ({ skin, deck }) => {
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', skin);
      window.localStorage.setItem(
        'soro-pon.decks.v1',
        JSON.stringify({ version: 1, decks: [{ deck, source: 'official', updatedAtMs: 1000 }] }),
      );
    },
    { skin: skinId, deck: ANIMAL_DECK },
  );
}

// 固定seedで対局を最後まで進める(勝敗どちらでも良い。決定的な最終画面が目的)。
async function playToResult(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(400);
  for (let i = 0; i < 4000; i++) {
    if ((await page.getByRole('heading', { name: '対戦結果' }).count()) > 0) {
      return;
    }
    const tsumoBtn = page.getByRole('button', { name: 'ツモ' });
    if ((await tsumoBtn.count()) && (await tsumoBtn.isEnabled().catch(() => false))) {
      await tsumoBtn.click();
      await page.waitForTimeout(300);
      continue;
    }
    const ronBtn = page.getByRole('button', { name: 'ロン' });
    if ((await ronBtn.count()) && (await ronBtn.isEnabled().catch(() => false))) {
      await ronBtn.click();
      await page.waitForTimeout(300);
      continue;
    }
    const discardBtn = page.getByRole('button', { name: '捨てる' });
    if ((await discardBtn.count()) && (await discardBtn.isEnabled().catch(() => false))) {
      await discardBtn.click();
      await page.waitForTimeout(250);
      continue;
    }
    const selectable = page.locator('.sp-tile:not(.sp-tile--back):not([disabled])');
    if ((await selectable.count()) > 0) {
      await selectable.first().click();
      await page.waitForTimeout(120);
      continue;
    }
    await page.waitForTimeout(200);
  }
  throw new Error('match did not reach Result within iteration budget');
}

// Result画面はseedがAppRoot側でDate.now()派生の非決定値(newSeed())のため、
// 手牌/役/勝者が実行のたびに変わりpixel snapshotの安定比較ができない
// (docs/qa/BATCH-5-MANUAL-QA-REPORT.md参照)。
// そのためResultはtoHaveScreenshotのbaseline対象から除外し、
// 「対戦結果画面へ到達しクラッシュしないこと」のみを両skin×全5viewportで
// 機械的に保証しつつ、非baselineのraw screenshotを証跡として残す。
for (const skin of SKINS) {
  for (const size of SIZES) {
    const suffix = `${skin}-${size.width}x${size.height}`;

    test(`Result reachable and renders ${suffix}`, async ({ page }) => {
      test.setTimeout(240_000);
      await page.setViewportSize(size);
      await seedDeck(page, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await playToResult(page);
      await expect(page.getByRole('heading', { name: '対戦結果' })).toBeVisible();
      const hasScrollOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(hasScrollOverflow, 'Result screen must not cause horizontal overflow').toBe(false);
      // 対局seedが非決定的なため、実行のたびに中身が変わるスクショを
      // git管理下のevidenceへ書くとgit statusが毎回汚れる(Gate 6で発覚し修正)。
      // test-results/はgitignore対象なので、実行毎の最新サンプルはそこへ置く。
      // Batch 5時点の固定evidenceはdocs/qa/evidence/batch-5/result/に
      // 既存のまま(playwright-result-*.png)保持し、以後の再実行では上書きしない。
      await page.screenshot({
        path: `test-results/gate6-result-samples/playwright-result-${suffix}.png`,
      });
    });
  }
}

for (const skin of SKINS) {
  for (const size of TIER_B_SIZES) {
    const suffix = `${skin}-${size.width}x${size.height}`;

    test(`DeckList ${suffix}`, async ({ page }) => {
      const responses = trackResponses(page);
      await page.setViewportSize(size);
      await seedDeck(page, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await page.getByRole('button', { name: 'デッキ一覧' }).click();
      await expect(page.locator('.sp-deck-card').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await waitForSkinAssetsReady(page, skin, responses);
      await expect(page).toHaveScreenshot(`deck-list-${suffix}.png`);
    });

    test(`DeckEditor ${suffix}`, async ({ page }) => {
      const responses = trackResponses(page);
      await page.setViewportSize(size);
      await seedDeck(page, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await page.getByRole('button', { name: 'デッキ一覧' }).click();
      await page.locator('.sp-deck-card').first().click();
      await page.getByRole('button', { name: '編集' }).click();
      await expect(page.getByRole('button', { name: '保存する' })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await waitForSkinAssetsReady(page, skin, responses);
      await expect(page).toHaveScreenshot(`deck-editor-${suffix}.png`);
    });

    test(`SkinSelectorModal ${suffix}`, async ({ page }) => {
      const responses = trackResponses(page);
      await page.setViewportSize(size);
      await seedDeck(page, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await page.getByRole('button', { name: /きせかえ/ }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await waitForSkinAssetsReady(page, skin, responses);
      await expect(page).toHaveScreenshot(`skin-selector-modal-${suffix}.png`);
    });
  }
}
