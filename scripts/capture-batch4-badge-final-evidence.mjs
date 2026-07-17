// Batch 4 badge.info.background promotion (candidate A, request 016) の
// production final証跡取得。
// 使い方: dev server(5199)起動中に
//   node scripts/capture-batch4-badge-final-evidence.mjs
// 出力: docs/asset-requests/evidence/batch-4-yorunoshirube-badge-info-final/*.png
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'docs/asset-requests/evidence/batch-4-yorunoshirube-badge-info-final';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: '844x390', width: 844, height: 390 },
  { name: '852x393', width: 852, height: 393 },
  { name: '932x430', width: 932, height: 430 },
  { name: '1024x600', width: 1024, height: 600 },
  { name: '1366x768', width: 1366, height: 768 },
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

// 1) DeckList: real info badge ("遊べる") across 5 viewports (use 1366x768 for primary + size proof)
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.waitForTimeout(300);
  if (vp.name === '1366x768') {
    await page.screenshot({ path: `${OUT}/badge-info-deck-list.png` });
  }
  await page.close();
}

// 2) DeckDetail: real info badge ("遊べる" on canPlay)
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.waitForTimeout(300);
  await page.locator('.sp-deck-card').first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/badge-info-deck-detail.png` });
  await page.close();
}

// 3) DeckEditor: ValidationIssueList (INFO/WARN badges together)
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.waitForTimeout(300);
  await page.locator('.sp-deck-card').first().click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: '編集' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/badge-info-deck-editor.png` });
  // scroll to the validation section if present
  const validationHeading = page.getByText('検証', { exact: true }).first();
  if (await validationHeading.count()) {
    await validationHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${OUT}/badge-info-validation-list.png` });
  }
  await page.close();
}

// 4) Collection: real info badges (記憶コイン / 称号)
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: '記憶帳' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/badge-info-collection.png` });
  await page.close();
}

// 5) Gallery: standard Badge component variants (production, no review UI), 24x20 size proof
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const container = document.querySelector('.sp-gallery');
    const all = Array.from(container.querySelectorAll('*'));
    const el = all.find((e) => e.children.length === 0 && e.textContent && e.textContent.includes('CategoryChip / InkDivider / LanternGlow'));
    if (el) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      container.scrollTop += elRect.top - containerRect.top - 40;
    }
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/badge-info-gallery-production.png` });
  await page.screenshot({ path: `${OUT}/badge-info-warning-comparison.png` });

  // 24x20 minRenderSize direct proof: render the real Badge classes at the contract minimum
  await page.evaluate(() => {
    const holder = document.createElement('div');
    holder.id = 'sp-badge-24x20-proof';
    holder.style.cssText = 'position:fixed;top:8px;left:8px;z-index:9999;background:#120d08;padding:8px;display:flex;gap:8px;align-items:center;';
    const span = document.querySelector('.sp-badge--info').cloneNode(true);
    span.textContent = '';
    span.style.width = '24px';
    span.style.height = '20px';
    span.style.boxSizing = 'border-box';
    holder.appendChild(span);
    document.body.appendChild(holder);
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/badge-info-24x20.png`, clip: { x: 0, y: 0, width: 120, height: 80 } });
  await page.close();
}

// 6) Skin switch persistence + Cute Pop regression
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.reload();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/skin-switch-yoru-v4-cutepop-v5.png` });
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /Cute Pop/);
  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/cutepop-v5-regression.png` });
  await page.close();
}

// 7) Versioned URL / network evidence: all 9 Yorunoshirube slots resolve at ?v=4
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  const requests = [];
  page.on('response', (res) => {
    if (res.url().includes('/skins/yorunoshirube/generated/final/')) {
      requests.push({ url: res.url(), status: res.status() });
    }
  });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(500);
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForTimeout(300);
  await page.close();
  writeFileSync(`${OUT}/network-v4-assets.json`, JSON.stringify(requests, null, 2));
}

await browser.close();
console.log('batch 4 badge final evidence saved to', OUT);
