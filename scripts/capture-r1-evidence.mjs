// R1候補(request 008/009)レビュー証跡のスクリーンショット取得スクリプト。
// 使い方: dev server(5199)起動中に `node scripts/capture-r1-evidence.mjs`
// 出力: docs/asset-requests/evidence/r1/*.png (git管理のレビュー証跡)
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/asset-requests/evidence/r1';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'phone-844x390', width: 844, height: 390 },
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  });
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForSelector('text=Skin切り替え');
  // Cute Popへ切り替え(R1レビューセクションはcute-popのみ表示)
  await page.click('text=Cute Pop');
  await page.waitForSelector('text=tile.face.base 候補');
  // candidates画像のロード完了を待つ
  await page.waitForTimeout(800);

  // 巨大要素の一括screenshotは未描画領域が混ざるため、候補行ごとに撮る。
  // 行 = R1セクション内の h4(候補ラベル) を含む直近のdivブロック。
  const rows = page.locator('section:has(h2:has-text("R1候補レビュー")) div:has(> h4)');
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
      .slice(0, 40);
    await rowEl.screenshot({ path: `${OUT}/${vp.name}-row${i + 1}-${key || 'row'}.png` });
  }
  await page.close();
}

// ヨルノシルベ側の回帰なし確認(candidatesは表示されず、既存fallbackのまま)
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:5199/#/gallery');
await page.waitForSelector('text=Skin切り替え');
await page.waitForTimeout(500);
const galleryTop = page.locator('.sp-gallery');
await galleryTop.screenshot({ path: `${OUT}/yorunoshirube-gallery-regression-check.png` });
await page.close();

await browser.close();
console.log('evidence saved to', OUT);
