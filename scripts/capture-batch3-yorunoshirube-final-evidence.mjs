// Batch 3 final promotion(request 012-015, 6/8 slots promoted to v2)の
// production証跡取得。panel.paper.default/panel.result.frameはBLOCKED_BY_
// TECHNICAL_VALIDATIONのためCSS fallbackのまま(このスクリプトはfallbackが
// 正常表示されることも確認する)。
// 使い方: dev server(5199)起動中に
//   node scripts/capture-batch3-yorunoshirube-final-evidence.mjs
// 出力: docs/asset-requests/evidence/batch-3-yorunoshirube-final/*.png
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/asset-requests/evidence/batch-3-yorunoshirube-final';
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

// 1) table.background: 5 viewport (MatchSetup + Match table)
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.screenshot({ path: `${OUT}/${vp.name}-matchsetup.png` });
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${vp.name}-match-table.png` });
  await page.close();
}

// 2) tile face/back detail: selected + discard pile
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(300);
  const firstTile = page.locator('button.sp-tile:not(.sp-tile--back):not([disabled])').first();
  await firstTile.click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/match-tile-selected.png` });
  const discardBtn = page.getByRole('button', { name: '選んだ牌を捨てる' });
  if (await discardBtn.isEnabled()) {
    await discardBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/match-discard-pile.png` });
  }
  await page.close();
}

// 3) panel.modal.background: real Modal (きせかえ) short/long content
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5199/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5199/');
  await page.getByRole('button', { name: /きせかえ/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /ヨルノシルベ/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/modal-skin-select-yorunoshirube-final.png` });
  await page.close();
}

// 4) panel.paper.default / panel.result.frame CSS-fallback check (blocked slots
//    must render cleanly via existing token fallback, not broken/blank)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.screenshot({ path: `${OUT}/matchsetup-paper-panel-fallback.png` });
  await page.close();
}

// 5) Result screen via real short gameplay (draw or win/lose, whichever occurs)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(500);
  let reached = false;
  for (let i = 0; i < 150; i += 1) {
    const winner = await Promise.race([
      page.waitForSelector('text=対戦結果', { timeout: 8000 }).then(() => 'result').catch(() => null),
      page.waitForSelector('text=手番 あなた', { timeout: 8000 }).then(() => 'myTurn').catch(() => null),
    ]);
    if (winner === 'result' || (await page.locator('text=対戦結果').count())) {
      reached = true;
      break;
    }
    if (winner === 'myTurn') {
      const tile = page.locator('button.sp-tile:not(.sp-tile--back):not([disabled])').first();
      if (await tile.count().catch(() => 0)) {
        await tile.click({ timeout: 5000 }).catch(() => {});
        const discardBtn = page.getByRole('button', { name: '選んだ牌を捨てる' });
        if (await discardBtn.isEnabled({ timeout: 3000 }).catch(() => false)) {
          await discardBtn.click({ timeout: 5000 }).catch(() => {});
        }
      }
      await page.waitForTimeout(300);
    }
  }
  if (await page.locator('text=対戦結果').count()) {
    reached = true;
  }
  if (reached) {
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/result-screen-paper-fallback.png` });
  } else {
    console.log('WARNING: result screen not reached within step budget');
  }
  await page.close();
}

// 6) Cute Pop regression: unaffected finals + Yorunoshirube leak check
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /Cute Pop/);
  await page.screenshot({ path: `${OUT}/cutepop-regression-top.png` });
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/cutepop-regression-match-table.png` });
  await page.close();
}

// 7) Skin switching persistence across reload
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.reload();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/skin-switch-persists-after-reload.png` });
  await page.close();
}

await browser.close();
console.log('batch 3 final evidence saved to', OUT);
