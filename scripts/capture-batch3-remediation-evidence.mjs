// Batch 3 blocker remediation(panel.paper.default A2 / panel.result.frame B2、
// yorunoshirube v3)のproduction証跡取得。
// 使い方: dev server(5199)起動中に
//   node scripts/capture-batch3-remediation-evidence.mjs
// 出力: docs/asset-requests/evidence/batch-3-blocker-remediation/*.png
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/asset-requests/evidence/batch-3-blocker-remediation';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'phone-844x390', width: 844, height: 390 },
  { name: 'phone-932x430', width: 932, height: 430 },
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

// 1) panel.paper.default: MatchSetup at multiple viewports (full-bleed proof)
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.screenshot({ path: `${OUT}/paper-${vp.name}.png` });
  await page.close();
}

// 2) panel.modal.background regression check (untouched, must still be fine)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: /きせかえ/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /ヨルノシルベ/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/modal-v3-regression.png` });
  await page.close();
}

// 3) panel.result.frame: reach Result screen via real gameplay
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
    await page.screenshot({ path: `${OUT}/result-v3-fullbleed.png` });
  } else {
    console.log('WARNING: result screen not reached within step budget');
  }
  await page.close();
}

// 4) Cute Pop regression: still v5/9 finals, unaffected
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /Cute Pop/);
  await page.screenshot({ path: `${OUT}/cutepop-v5-regression.png` });
  await page.close();
}

// 5) skin switching persistence + Yorunoshirube existing 6 finals regression
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/yoru-table-tiles-buttons-v3.png` });
  await page.reload();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/skin-switch-v3-persists.png` });
  await page.close();
}

await browser.close();
console.log('batch 3 remediation evidence saved to', OUT);
