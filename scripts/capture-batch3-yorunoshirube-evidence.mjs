// Batch 3(request 012-015, yorunoshirube 8slot)のcandidate review証跡取得。
// 使い方: dev server(5199)起動中に `node scripts/capture-batch3-yorunoshirube-evidence.mjs`
// 出力: docs/asset-requests/evidence/batch-3-yorunoshirube-round1/*.png
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/asset-requests/evidence/batch-3-yorunoshirube-round1';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'phone-844x390', width: 844, height: 390 },
  { name: 'phone-852x393', width: 852, height: 393 },
  { name: 'phone-wide-932x430', width: 932, height: 430 },
  { name: 'tablet-1024x600', width: 1024, height: 600 },
  { name: 'desktop-1366x768', width: 1366, height: 768 },
];

async function switchTo(page, skinLabelRegex) {
  await page.goto('http://localhost:5199/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5199/');
  await page.getByRole('button', { name: /きせかえ/ }).click();
  await page.getByRole('button', { name: skinLabelRegex }).click();
  await page.getByRole('button', { name: 'とじる' }).click();
  await page.waitForTimeout(300);
}

const browser = await chromium.launch();

// 1) Gallery: Batch 3 review section, full page, 5 viewports (yorunoshirube)
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${vp.name}-gallery-overview.png`, fullPage: true });
  await page.close();
}

// 2) Gallery: per-slot section close-ups (desktop, full res)
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForTimeout(400);
  const sectionTitles = [
    ['1. table.background', 'batch3-table-background-section.png'],
    ['2. panel.paper.default', 'batch3-panel-paper-default-section.png'],
    ['3. button.primary.background', 'batch3-button-primary-section.png'],
    ['4. button.secondary.background', 'batch3-button-secondary-section.png'],
    ['5. tile.face.base', 'batch3-tile-face-section.png'],
    ['6. tile.back.base', 'batch3-tile-back-section.png'],
    ['7. panel.modal.background', 'batch3-panel-modal-section.png'],
    ['8. panel.result.frame', 'batch3-panel-result-section.png'],
  ];
  for (const [heading, filename] of sectionTitles) {
    const h3 = page.locator('h3', { hasText: heading });
    await h3.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${filename}` });
  }
  await page.close();
}

// 3) Yorunoshirube plain production screens (no candidates wired into production
//    resolver -- this proves candidates do NOT leak into normal runtime)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.screenshot({ path: `${OUT}/production-top-no-candidate-leak.png` });
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.screenshot({ path: `${OUT}/production-matchsetup-no-candidate-leak.png` });
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/production-match-no-candidate-leak.png` });
  await page.close();
}

// 4) Cute Pop regression: production finals (v5) unaffected, Gallery shows fallback text
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /Cute Pop/);
  await page.screenshot({ path: `${OUT}/cutepop-regression-top.png` });
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/cutepop-regression-match-table.png` });
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForTimeout(300);
  const h2 = page.locator('h2', { hasText: 'Batch 3候補レビュー' });
  await h2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/cutepop-gallery-batch3-fallback-message.png` });
  await page.close();
}

// 5) Skin switching proof: reload persistence
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.reload();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/skin-switch-persists-after-reload.png` });
  await page.close();
}

await browser.close();
console.log('batch 3 evidence saved to', OUT);
