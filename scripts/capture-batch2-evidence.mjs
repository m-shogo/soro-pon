// Batch 2候補(request 010/011)レビュー証跡のスクリーンショット取得スクリプト。
// 使い方: dev server(5199)起動中に `node scripts/capture-batch2-evidence.mjs`
// 出力: docs/asset-requests/evidence/batch-2-round1/*.png (git管理のレビュー証跡)
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/asset-requests/evidence/batch-2-round1';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'phone-844x390', width: 844, height: 390 },
  { name: 'phone-852x393', width: 852, height: 393 },
  { name: 'phone-wide-932x430', width: 932, height: 430 },
  { name: 'tablet-1024x600', width: 1024, height: 600 },
  { name: 'desktop-1366x768', width: 1366, height: 768 },
];

async function switchToCutePop(page) {
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForSelector('text=Skin切り替え');
  await page.click('text=Cute Pop');
  await page.waitForTimeout(400);
}

const browser = await chromium.launch();

// desktop + phone の2 viewportで、候補行ごとのスクリーンショットを撮る
// (巨大セクション一括screenshotは未描画領域が混ざるため行単位)
for (const vp of [VIEWPORTS[0], VIEWPORTS[4]]) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  });
  await switchToCutePop(page);
  await page.waitForSelector('text=Batch 2候補レビュー');
  await page.waitForTimeout(500);

  const rows = page.locator('section:has(h2:has-text("Batch 2候補レビュー")) div:has(> h4)');
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i += 1) {
    const rowEl = rows.nth(i);
    await rowEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const label = (await rowEl.locator('h4').innerText()).trim();
    const key = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
    await rowEl.screenshot({ path: `${OUT}/${vp.name}-row${i + 1}-${key || 'row'}.png` });
  }
  await page.close();
}

// 全5 viewportでBatch 2セクション全体のoverview(スクロール確認用)
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  await switchToCutePop(page);
  await page.waitForSelector('text=Batch 2候補レビュー');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${vp.name}-overview-viewport.png` });
  await page.close();
}

// ヨルノシルベ側の回帰なし確認(candidatesは表示されず、既存fallbackのまま)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForSelector('text=Skin切り替え');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/yorunoshirube-gallery-regression-check.png` });
  await page.close();
}

// 実TOP/MatchSetup/Match/Result画面(Batch 2 candidatesは未接続だが、
// R1 finalが正しく維持されていることの回帰確認用)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchToCutePop(page);
  await page.goto('http://localhost:5199/');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/production-top-r1-regression.png` });
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.screenshot({ path: `${OUT}/production-matchsetup-r1-regression.png` });
  await page.close();
}

await browser.close();
console.log('evidence saved to', OUT);
