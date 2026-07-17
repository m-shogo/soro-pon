// Batch 4(request 016、badge.info.background候補 + B/C装飾監査)の証跡取得。
// 使い方: dev server(5199)起動中に
//   node scripts/capture-batch4-evidence.mjs
// 出力:
//   docs/asset-requests/evidence/batch-4-yorunoshirube-decoration-audit/*.png
//   docs/asset-requests/evidence/batch-4-yorunoshirube-badge-info-round1/*.png
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const AUDIT_OUT = 'docs/asset-requests/evidence/batch-4-yorunoshirube-decoration-audit';
const BADGE_OUT = 'docs/asset-requests/evidence/batch-4-yorunoshirube-badge-info-round1';
mkdirSync(AUDIT_OUT, { recursive: true });
mkdirSync(BADGE_OUT, { recursive: true });

async function switchTo(page, skinLabelRegex) {
  await page.goto('http://localhost:5199/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5199/');
  await page.getByRole('button', { name: /きせかえ/ }).click();
  await page.getByRole('button', { name: skinLabelRegex }).click();
  await page.getByRole('button', { name: 'とじる' }).click();
  await page.waitForTimeout(300);
}

// .sp-gallery is an internal overflow:scroll container; scrollIntoViewIfNeeded()
// does not reliably scroll it in this app, so scroll it directly by matching text.
async function scrollGalleryTo(page, text) {
  await page.evaluate((needle) => {
    const container = document.querySelector('.sp-gallery');
    const all = Array.from(container.querySelectorAll('*'));
    const el = all.find((e) => e.children.length === 0 && e.textContent && e.textContent.includes(needle));
    if (el) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      container.scrollTop += elRect.top - containerRect.top - 40;
    }
  }, text);
}

const browser = await chromium.launch();

// ===== 1) B/C decoration audit evidence (current state, no change made) =====

// badge.warning.background: DeckEditor validation issue list (real warning badge)
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForTimeout(300);
  await scrollGalleryTo(page, 'CategoryChip / InkDivider / LanternGlow');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${AUDIT_OUT}/badge-warning-current.png` });
  await page.close();
}

// table.overlay.ink / table.overlay.light: real Match screen (both overlays visible together)
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'まず遊ぶ' }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${AUDIT_OUT}/table-overlay-ink-current.png` });
  await page.screenshot({ path: `${AUDIT_OUT}/table-overlay-light-current.png` });
  await page.close();
}

// panel.paper.emphasis: Gallery PaperPanel variants ("選択中")
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForTimeout(300);
  await scrollGalleryTo(page, 'PaperPanel variants');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${AUDIT_OUT}/panel-emphasis-current.png` });
  await page.close();
}

// ===== 2) badge.info.background candidate evidence (Gallery review UI) =====

{
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForTimeout(300);
  await scrollGalleryTo(page, 'Batch 4候補レビュー');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${BADGE_OUT}/gallery-overview.png` });

  await scrollGalleryTo(page, 'Size proof(24x20〜120x40 + 長文)');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${BADGE_OUT}/candidate-a-small-sizes.png` });

  await scrollGalleryTo(page, 'B: グラシン紙の記録ラベル');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${BADGE_OUT}/candidate-b-small-sizes.png` });

  await scrollGalleryTo(page, 'C: 写真フィルムの見出し片');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${BADGE_OUT}/candidate-c-small-sizes.png` });

  await scrollGalleryTo(page, 'Production-context preview');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${BADGE_OUT}/deck-editor-context.png` });

  await scrollGalleryTo(page, 'warning badgeとの並列(識別確認)');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${BADGE_OUT}/warning-comparison.png` });

  await page.close();
}

// deck-detail-context / collection-context: real screens (fallback badge; candidates are
// Gallery-only preview, not wired into these production screens by design)
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${BADGE_OUT}/deck-detail-context.png` });
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.getByRole('button', { name: '記憶帳' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${BADGE_OUT}/collection-context.png` });
  await page.close();
}

// Cute Pop regression: no candidate leakage, v5/9 finals unaffected
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /Cute Pop/);
  await page.goto('http://localhost:5199/#/gallery');
  await page.waitForTimeout(300);
  await scrollGalleryTo(page, 'Batch 4候補レビュー');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${BADGE_OUT}/cutepop-regression.png` });
  await page.close();
}

// skin switching persistence (reload keeps Yorunoshirube, no candidate leaks to production)
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await switchTo(page, /ヨルノシルベ/);
  await page.reload();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${BADGE_OUT}/skin-switch.png` });
  await page.close();
}

await browser.close();
console.log('batch 4 evidence saved to', AUDIT_OUT, 'and', BADGE_OUT);
