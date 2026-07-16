// R1 final promotion(request 008/009, D/E/D)のproduction証跡取得スクリプト。
// 使い方: dev server(5199)起動中に `node scripts/capture-r1-final-evidence.mjs`
// 出力: docs/asset-requests/evidence/r1-final/*.png
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/asset-requests/evidence/r1-final';
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

// 1) Gallery: TileCard states (production consumer, not a candidate-review hack)
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  await switchToCutePop(page);
  const h2 = page.locator('h2', { hasText: 'TileCard states' });
  await h2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const section = page.locator('section', { has: h2 });
  await section.screenshot({ path: `${OUT}/${vp.name}-tilecard-states.png` });
  const btnH2 = page.locator('h2', { hasText: 'Button variants' });
  await btnH2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const btnSection = page.locator('section', { has: btnH2 });
  await btnSection.screenshot({ path: `${OUT}/${vp.name}-button-variants.png` });
  await page.close();
}

// 2) Real match screen: hand tiles, selected state, discard pile, primary CTA
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchToCutePop(page);
  await page.goto('http://localhost:5199/');
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.screenshot({ path: `${OUT}/match-setup-cta.png` });
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForSelector('text=対局');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/match-hand-default.png` });

  // select a tile -> selected state composited over base (ADR-015) in real screen
  const tiles = page.getByRole('button', { name: /^(?!捨てる|中断).+$/ }).filter({ hasText: /./ });
  const firstTile = page.locator('.sp-tile').first();
  await firstTile.click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/match-hand-selected.png` });

  // discard -> discard pile shows tile.face.base at small size
  const discardBtn = page.getByRole('button', { name: '選んだ牌を捨てる' });
  await discardBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/match-discard-pile.png` });
  await page.close();
}

// 3) Yorunoshirube regression check (same Gallery sections, unmodified skin)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForSelector('text=Skin切り替え');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/yorunoshirube-gallery-top.png` });
  const h2 = page.locator('h2', { hasText: 'TileCard states' });
  await h2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.locator('section', { has: h2 }).screenshot({ path: `${OUT}/yorunoshirube-tilecard-states.png` });
  await page.close();
}

await browser.close();
console.log('final evidence saved to', OUT);
