import { expect, test } from '@playwright/test';

// H9/P1-2: 主要画面 × 公式2スキン × 5サイズのvisual regression。
// 記録(タイムスタンプ)はlocalStorageを空にして排除する。

const SIZES = [
  { width: 844, height: 390 },
  { width: 852, height: 393 },
  { width: 932, height: 430 },
  { width: 1024, height: 600 },
  { width: 1366, height: 768 },
] as const;

const SKINS = ['yorunoshirube', 'cute-pop'] as const;

for (const skin of SKINS) {
  for (const size of SIZES) {
    const suffix = `${skin}-${size.width}x${size.height}`;

    test(`TOP ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.addInitScript((skinId) => {
        window.localStorage.clear();
        window.localStorage.setItem('soro-pon.skin.v1', skinId);
      }, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await expect(page.getByRole('button', { name: /まず遊ぶ/ })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`top-${suffix}.png`);
    });

    test(`Gallery ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.addInitScript((skinId) => {
        window.localStorage.clear();
        window.localStorage.setItem('soro-pon.skin.v1', skinId);
      }, skin);
      await page.goto('/#/gallery');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      // nine-slice実証画像の読み込みまで待つ
      await expect(page.getByText('Nine-slice実証')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`gallery-${suffix}.png`, { fullPage: false });
    });

    test(`MatchSetup ${suffix}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.addInitScript((skinId) => {
        window.localStorage.clear();
        window.localStorage.setItem('soro-pon.skin.v1', skinId);
      }, skin);
      await page.goto('/');
      await page.waitForSelector(`html[data-skin="${skin}"]`);
      await page.getByRole('button', { name: /まず遊ぶ/ }).click();
      await expect(page.getByRole('button', { name: /対局開始/ })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`match-setup-${suffix}.png`);
    });
  }
}
