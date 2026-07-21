// Gate 6 QA: performance spot-check (startup, transitions, memory growth over
// repeated matches/skin switches, console/long-task/layout-shift observation).
// Quantitative where the browser exposes it (Chromium-only: performance.memory).
// This is NOT a real-device performance guarantee — see the Gate 6 report.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const BASE = 'http://localhost:4173'; // built+previewed, matches production bundle
const ROOT = 'docs/qa/evidence/batch-6/performance';
mkdirSync(ROOT, { recursive: true });

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));
const metrics = {};

async function seed(page, skin = 'yorunoshirube') {
  await page.goto(`${BASE}/`);
  await page.evaluate(
    ({ skin, deck }) => {
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', skin);
      window.localStorage.setItem(
        'soro-pon.decks.v1',
        JSON.stringify({ version: 1, decks: [{ deck, source: 'official', updatedAtMs: 1000 }] }),
      );
    },
    { skin, deck: ANIMAL_DECK },
  );
}

// performance.memory (JS-exposed) is intentionally quantized/noised by modern
// Chromium for fingerprinting protection and is not precise enough to see
// small heap deltas. Use the CDP Performance domain instead, which reports
// real (unquantized) JSHeapUsedSize.
async function heapViaCDP(page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');
  const { metrics } = await client.send('Performance.getMetrics');
  await client.detach();
  const m = metrics.find((m) => m.name === 'JSHeapUsedSize');
  return m ? m.value : null;
}

const browser = await chromium.launch();

// 1) Cold boot timing (navigation to first meaningful paint proxy: まず遊ぶ visible)
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await page.evaluate(() => window.localStorage.clear()).catch(() => {});
  const t0 = Date.now();
  await page.goto(`${BASE}/`);
  await page.waitForSelector('text=まず遊ぶ');
  const bootMs = Date.now() - t0;
  metrics.coldBootMs = bootMs;
  console.log(`cold boot to まず遊ぶ visible: ${bootMs}ms`);
  await page.close();
}

// 2) Screen transition timing (TOP -> DeckList -> DeckDetail -> DeckEditor -> back -> Gallery)
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seed(page);
  await page.goto(`${BASE}/`);
  await page.waitForSelector('text=まず遊ぶ');

  const timeIt = async (label, action) => {
    const t0 = Date.now();
    await action();
    const ms = Date.now() - t0;
    metrics[label] = ms;
    console.log(`${label}: ${ms}ms`);
  };

  await timeIt('nav.top-to-deckList', async () => {
    await page.getByRole('button', { name: 'デッキ一覧' }).click();
    await page.waitForSelector('.sp-deck-card');
  });
  await timeIt('nav.deckList-to-deckDetail', async () => {
    await page.locator('.sp-deck-card').first().click();
    await page.waitForSelector('text=デッキ情報');
  });
  await timeIt('nav.deckDetail-to-deckEditor', async () => {
    await page.getByRole('button', { name: '編集' }).click();
    await page.waitForSelector('text=デッキ編集');
  });
  await timeIt('nav.top-to-matchSetup', async () => {
    await page.goto(`${BASE}/`);
    await page.waitForSelector('text=まず遊ぶ');
    await page.getByRole('button', { name: /まず遊ぶ/ }).click();
    await page.waitForSelector('text=対局設定');
  });
  await timeIt('nav.matchSetup-to-matchStart', async () => {
    await page.getByRole('button', { name: '対局開始' }).click();
    await page.waitForSelector('text=対局');
  });
  await timeIt('nav.gallery-load', async () => {
    await page.goto(`${BASE}/#/gallery`);
    await page.waitForSelector('text=Nine-slice実証');
  });

  await page.close();
}

// 3) Memory growth over repeated skin switches (modal open/close x 10)
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seed(page);
  await page.goto(`${BASE}/`);
  await page.waitForSelector('text=まず遊ぶ');
  await page.waitForTimeout(300);
  const before = await heapViaCDP(page);
  for (let i = 0; i < 10; i++) {
    await page.getByRole('button', { name: /きせかえ/ }).click();
    await page.waitForTimeout(80);
    await page.getByRole('button', { name: i % 2 === 0 ? /Cute Pop/ : /ヨルノシルベ/ }).click();
    await page.waitForTimeout(80);
    await page.getByRole('button', { name: 'とじる' }).click();
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));
  const after = await heapViaCDP(page);
  metrics.heapBeforeSkinSwitchLoopBytes = before;
  metrics.heapAfterSkinSwitchLoopBytes = after;
  if (before !== null && after !== null) {
    metrics.heapGrowthSkinSwitchLoopBytes = after - before;
    console.log(`heap growth over 10 skin switches: ${((after - before) / 1024).toFixed(1)} KB`);
  } else {
    console.log('performance.memory not available in this Chromium build (non-fatal, recorded as null)');
  }
  await page.close();
}

// 4) Memory growth over 3 consecutive rematches (Result -> もう一局 loop)
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  await seed(page);
  await page.goto(`${BASE}/`);
  await page.waitForSelector('text=まず遊ぶ');
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.waitForSelector('text=対局開始');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(400);

  const before = await heapViaCDP(page);
  let rematches = 0;
  for (let m = 0; m < 3; m++) {
    for (let i = 0; i < 2000; i++) {
      if ((await page.getByRole('heading', { name: '対戦結果' }).count()) > 0) break;
      const tsumoBtn = page.getByRole('button', { name: 'ツモ' });
      if ((await tsumoBtn.count()) && (await tsumoBtn.isEnabled().catch(() => false))) {
        await tsumoBtn.click();
        await page.waitForTimeout(250);
        continue;
      }
      const ronBtn = page.getByRole('button', { name: 'ロン' });
      if ((await ronBtn.count()) && (await ronBtn.isEnabled().catch(() => false))) {
        await ronBtn.click();
        await page.waitForTimeout(250);
        continue;
      }
      const discardBtn = page.getByRole('button', { name: '捨てる' });
      if ((await discardBtn.count()) && (await discardBtn.isEnabled().catch(() => false))) {
        await discardBtn.click();
        await page.waitForTimeout(200);
        continue;
      }
      const selectable = page.locator('.sp-tile:not(.sp-tile--back):not([disabled])');
      if ((await selectable.count()) > 0) {
        await selectable.first().click();
        await page.waitForTimeout(100);
        continue;
      }
      await page.waitForTimeout(150);
    }
    const rematchBtn = page.getByRole('button', { name: 'もう一局' });
    if (await rematchBtn.count()) {
      await rematchBtn.click();
      await page.waitForTimeout(400);
      rematches++;
    }
  }
  await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));
  const after = await heapViaCDP(page);
  metrics.rematchesCompleted = rematches;
  metrics.heapBeforeRematchLoopBytes = before;
  metrics.heapAfterRematchLoopBytes = after;
  if (before !== null && after !== null) {
    metrics.heapGrowthRematchLoopBytes = after - before;
    console.log(`heap growth over ${rematches} rematches: ${((after - before) / 1024).toFixed(1)} KB`);
  }
  metrics.consoleErrorsDuringRematchLoop = consoleErrors;
  console.log(`console errors during rematch loop: ${consoleErrors.length}`);
  await page.close();
}

// 5) Bundle / asset sizes (from disk, deterministic — not a runtime measurement)
{
  const { readdirSync, statSync } = await import('node:fs');
  const sumSizes = (dir, filterExt) => {
    let total = 0;
    const walk = (d) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const p = `${d}/${entry.name}`;
        if (entry.isDirectory()) walk(p);
        else if (!filterExt || entry.name.endsWith(filterExt)) total += statSync(p).size;
      }
    };
    walk(dir);
    return total;
  };
  metrics.jsBundleBytes = sumSizes('dist/assets', '.js');
  metrics.cssBundleBytes = sumSizes('dist/assets', '.css');
  metrics.cutePopFinalAssetsBytes = sumSizes('public/assets/ui/soro-pon/skins/cute-pop/generated/final');
  metrics.yorunoshirubeFinalAssetsBytes = sumSizes('public/assets/ui/soro-pon/skins/yorunoshirube/generated/final');
  metrics.distTotalBytes = sumSizes('dist');
  console.log(`JS bundle: ${(metrics.jsBundleBytes / 1024).toFixed(1)} KB, CSS: ${(metrics.cssBundleBytes / 1024).toFixed(1)} KB`);
  console.log(`Cute Pop finals: ${(metrics.cutePopFinalAssetsBytes / 1024 / 1024).toFixed(2)} MB, Yorunoshirube finals: ${(metrics.yorunoshirubeFinalAssetsBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`dist/ total: ${(metrics.distTotalBytes / 1024 / 1024).toFixed(2)} MB`);
}

await browser.close();
writeFileSync(`${ROOT}/gate6-performance-metrics.json`, JSON.stringify(metrics, null, 2));
console.log('\nmetrics written to', `${ROOT}/gate6-performance-metrics.json`);
