// Batch 2 final promotion(request 010/011, A/B/B)のproduction証跡取得スクリプト。
// 使い方: dev server(5199)起動中に `node scripts/capture-batch2-final-evidence.mjs`
// 出力: docs/asset-requests/evidence/batch-2-final/*.png
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/asset-requests/evidence/batch-2-final';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'phone-844x390', width: 844, height: 390 },
  { name: 'phone-852x393', width: 852, height: 393 },
  { name: 'phone-wide-932x430', width: 932, height: 430 },
  { name: 'tablet-1024x600', width: 1024, height: 600 },
  { name: 'desktop-1366x768', width: 1366, height: 768 },
];

async function switchToCutePop(page) {
  await page.goto('http://localhost:5199/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5199/');
  await page.getByRole('button', { name: /きせかえ/ }).click();
  await page.getByRole('button', { name: /Cute Pop/ }).click();
  await page.getByRole('button', { name: 'とじる' }).click();
  await page.waitForTimeout(300);
}

const browser = await chromium.launch();

// 1) table.background: MatchScreen(手牌/捨て牌/selected/modal open)
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  await switchToCutePop(page);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.screenshot({ path: `${OUT}/${vp.name}-matchsetup.png` });
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${vp.name}-match-table.png` });
  await page.close();
}

// 2) selected tile + discard pile on table.background (desktop, detailed)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchToCutePop(page);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(300);
  const firstTile = page.locator('.sp-tile').first();
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

// 3) panel.modal.background: real Modal (きせかえ) with short/long content
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5199/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5199/');
  await page.getByRole('button', { name: /きせかえ/ }).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/modal-skin-select-yorunoshirube-fallback.png` });
  await page.getByRole('button', { name: /Cute Pop/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/modal-skin-select-cutepop-long-content.png` });
  await page.close();
}

// 4) panel.result.frame: real ResultScreen(短い実対局でresult phaseへ到達する。
//    gameplayロジックへの変更・shortcutは一切追加しない。CPU自動進行+捨て牌操作
//    のみで自然に決着する。tile buttonは button.sp-tile で厳密指定し、
//    各操作にタイムアウトを設けてハングを防ぐ)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchToCutePop(page);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(300);
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
      // button.sp-tileは自分の手牌だけでなく捨て牌(disabled)・相手の伏せ牌
      // (sp-tile--back)も含むため、両方を除外して自分の手牌のみを対象にする。
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
    await page.screenshot({ path: `${OUT}/result-screen.png` });
  } else {
    console.log('WARNING: did not reach result screen within step budget');
  }
  await page.close();
}

// 5) R1 regression: jelly CTA, tile face/back, selected state (TOP/MatchSetup)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await switchToCutePop(page);
  await page.screenshot({ path: `${OUT}/r1-regression-top-cta.png` });
  await page.close();
}

// 6) Yorunoshirube regression (TOP, Match table CSS fallback)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5199/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5199/');
  await page.screenshot({ path: `${OUT}/yorunoshirube-top-regression.png` });
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/yorunoshirube-match-table-regression.png` });
  await page.close();
}

await browser.close();
console.log('final evidence saved to', OUT);
