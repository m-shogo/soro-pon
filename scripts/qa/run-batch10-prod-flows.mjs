// Batch 10 B10-PROD-02: production preview core-flow walkthrough.
// 設計の正本: docs/qa/BATCH-10-REAL-DEVICE-RELEASE-MATRIX.md
//
// 使い方: production build後、preview server(4199)起動中に
//   node scripts/qa/run-batch10-prod-flows.mjs
//
// dev serverではなく production artifact(dist/)を配信するpreviewを対象にする。
// 主張範囲はChromium + production preview のみ。実端末・実deployへは拡張しない。
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const BASE = process.env.B10_BASE ?? 'http://localhost:4199';
const ROOT = 'docs/qa/evidence/batch-10';
mkdirSync(`${ROOT}/prod-flows`, { recursive: true });

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));
const results = [];
const errors = { pageErrors: [], consoleErrors: [], failedRequests: [], unhandledRejections: [] };

function record(id, label, ok, detail) {
  results.push({ id, label, ok, detail: detail ?? null });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${label}${detail ? ' :: ' + detail : ''}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
page.on('pageerror', (e) => errors.pageErrors.push(String(e).slice(0, 300)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.consoleErrors.push(m.text().slice(0, 300));
});
page.on('requestfailed', (r) =>
  errors.failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`.slice(0, 300)),
);
// unhandled rejection は pageerror として上がらない場合があるため明示的に拾う
await page.addInitScript(`window.addEventListener('unhandledrejection', (e) => {
  (window.__b10rejections ||= []).push(String(e.reason));
});`);

const shot = (name) => page.screenshot({ path: `${ROOT}/prod-flows/${name}.png` });

// --- 1) TOP (fresh boot on production artifact) ---
await page.goto(`${BASE}/`);
await page.evaluate(
  ({ deck }) => {
    localStorage.clear();
    localStorage.setItem('soro-pon.skin.v1', 'yorunoshirube');
    localStorage.setItem(
      'soro-pon.decks.v1',
      JSON.stringify({ version: 1, decks: [{ deck, source: 'official', updatedAtMs: 1000 }] }),
    );
  },
  { deck: ANIMAL_DECK },
);
await page.goto(`${BASE}/`);
await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor({ timeout: 15000 });
await shot('01-top-yorunoshirube');
record('B10-PROD-02.1', 'TOP renders on production artifact', true);

// --- 2) JSON Import ---
await page.getByRole('button', { name: /JSONを読み込む/ }).click();
await page.getByRole('textbox', { name: 'デッキJSON' }).fill('{"broken":');
await page.getByRole('button', { name: '読み込む', exact: true }).click();
const rejected = await page.locator('.sp-issue-list').count();
await shot('02-import-validation-error');
record('B10-PROD-02.2', 'JSON Import rejects invalid JSON with visible reasons', rejected > 0);
await page.getByRole('textbox', { name: 'デッキJSON' }).fill(JSON.stringify(ANIMAL_DECK));
await page.getByRole('button', { name: '読み込む', exact: true }).click();
await page.waitForSelector('text=デッキ情報');
await shot('03-import-success-deckdetail');
record('B10-PROD-02.3', 'JSON Import accepts a valid deck and lands on Deck Detail', true);

// --- 3) Deck Editor ---
await page.getByRole('button', { name: '編集' }).click();
await page.waitForSelector('text=デッキ編集');
await shot('04-deck-editor');
record('B10-PROD-02.4', 'Deck Editor opens from Deck Detail', true);
// Deck Editorの「もどる」はDeck Detailへ戻る(TOPではない)。TOPへは明示navigate。
await page.getByRole('button', { name: 'もどる' }).click();
await page.waitForSelector('text=デッキ情報');
record('B10-PROD-02.4b', 'Deck Editor もどる returns to Deck Detail', true);
await page.goto(`${BASE}/`);
await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor();

// --- 4) Match Setup + 3p match to Result ---
async function playMatch(playerCount, tag) {
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: `${playerCount}人戦` }).click();
  await shot(`05-match-setup-${tag}`);
  await page.getByRole('button', { name: '対局開始' }).click();
  const deadline = Date.now() + 5 * 60 * 1000;
  let reached = false;
  while (Date.now() < deadline) {
    if (await page.getByRole('heading', { name: '対戦結果' }).count()) {
      reached = true;
      break;
    }
    const tsumo = page.getByRole('button', { name: 'ツモ' });
    if ((await tsumo.count()) && (await tsumo.isEnabled().catch(() => false))) {
      await tsumo.click();
      await page.waitForTimeout(250);
      continue;
    }
    const ron = page.getByRole('button', { name: 'ロン' });
    if ((await ron.count()) && (await ron.isEnabled().catch(() => false))) {
      await ron.click();
      await page.waitForTimeout(250);
      continue;
    }
    const discard = page.getByRole('button', { name: '捨てる' });
    if ((await discard.count()) && (await discard.isEnabled().catch(() => false))) {
      await discard.click();
      await page.waitForTimeout(150);
      continue;
    }
    const tile = page.locator('.sp-tile:not(.sp-tile--back):not([disabled])');
    if (await tile.count()) {
      await tile.first().click();
      await page.waitForTimeout(100);
      continue;
    }
    await page.waitForTimeout(200);
  }
  await shot(`06-result-${tag}`);
  return reached;
}

const r3 = await playMatch(3, '3p-yorunoshirube');
record('B10-PROD-02.5', '3-player match reaches Result on production build', r3);
await page.getByRole('button', { name: 'TOPへ' }).click();
await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor();
record('B10-PROD-02.6', 'Result → TOP navigation works', true);

// --- 5) skin switch to cute-pop, then 4p match ---
await page.getByRole('button', { name: /きせかえ/ }).click();
await page.getByRole('button', { name: /Cute Pop/ }).click();
await page.getByRole('button', { name: 'とじる' }).click();
await page.waitForSelector('html[data-skin="cute-pop"]');
await shot('07-top-cute-pop');
record('B10-PROD-02.7', 'Skin switch to cute-pop applies on production build', true);

const r4 = await playMatch(4, '4p-cutepop');
record('B10-PROD-02.8', '4-player match reaches Result on production build (cute-pop)', r4);
await page.getByRole('button', { name: 'TOPへ' }).click();
await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor();

// --- 6) reload + localStorage restore ---
const before = await page.evaluate(() => ({
  skin: localStorage.getItem('soro-pon.skin.v1'),
  decks: JSON.parse(localStorage.getItem('soro-pon.decks.v1') ?? '{}').decks?.length ?? 0,
  records: JSON.parse(localStorage.getItem('soro-pon.records.v1') ?? '{}').records?.length ?? 0,
}));
await page.reload();
await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor();
// skinはskin.json取得後に非同期でdata-skinへ反映される(UIは先にbase tokenで描画される
// 設計)。属性を待たずに読むとnullになるため、明示的に待ってから検証する。
await page.waitForSelector('html[data-skin="cute-pop"]', { timeout: 10000 });
const after = await page.evaluate(() => ({
  skin: localStorage.getItem('soro-pon.skin.v1'),
  decks: JSON.parse(localStorage.getItem('soro-pon.decks.v1') ?? '{}').decks?.length ?? 0,
  records: JSON.parse(localStorage.getItem('soro-pon.records.v1') ?? '{}').records?.length ?? 0,
}));
const skinKept = await page.evaluate(() => document.documentElement.getAttribute('data-skin'));
await shot('08-after-reload');
record(
  'B10-PROD-02.9',
  'reload restores skin, decks and records from localStorage',
  before.skin === after.skin && before.decks === after.decks && before.records === after.records && skinKept === 'cute-pop',
  JSON.stringify({ before, after, skinKept }),
);

// --- 7) error counters ---
const rejections = await page.evaluate(() => window.__b10rejections ?? []);
errors.unhandledRejections = rejections;
// navigation中断由来のfetch abortはBatch 7/9で良性分類済み。ここでは区別して数える。
const benign = errors.failedRequests.filter((f) => /ERR_ABORTED|cancelled|NS_BINDING_ABORTED/.test(f));
const nonBenign = errors.failedRequests.filter((f) => !/ERR_ABORTED|cancelled|NS_BINDING_ABORTED/.test(f));
record('B10-PROD-02.10', 'no page errors', errors.pageErrors.length === 0, JSON.stringify(errors.pageErrors).slice(0, 200));
record('B10-PROD-02.11', 'no console errors', errors.consoleErrors.length === 0, JSON.stringify(errors.consoleErrors).slice(0, 200));
record('B10-PROD-02.12', 'no unhandled promise rejections', rejections.length === 0, JSON.stringify(rejections).slice(0, 200));
record(
  'B10-PROD-02.13',
  'no non-benign failed requests (asset 404 etc.)',
  nonBenign.length === 0,
  `benign(navigation-cancelled)=${benign.length} nonBenign=${nonBenign.length} ${JSON.stringify(nonBenign).slice(0, 200)}`,
);

await browser.close();

const summary = {
  testId: 'B10-PROD-02',
  base: BASE,
  buildType: 'production (vite build → vite preview)',
  commit: process.env.B10_COMMIT ?? null,
  browser: 'Chromium (Playwright-bundled)',
  ranAt: new Date().toISOString(),
  results,
  errorCounts: {
    pageErrors: errors.pageErrors.length,
    consoleErrors: errors.consoleErrors.length,
    unhandledRejections: errors.unhandledRejections.length,
    failedRequestsBenign: benign.length,
    failedRequestsNonBenign: nonBenign.length,
  },
  errorSamples: {
    pageErrors: errors.pageErrors.slice(0, 10),
    consoleErrors: errors.consoleErrors.slice(0, 10),
    failedRequests: errors.failedRequests.slice(0, 10),
  },
  claimScope:
    'Chromium against a local production preview of this commit only. Does NOT extend to real Safari, Firefox, WebKit, real devices, or a deployed environment.',
  pass: results.every((r) => r.ok),
};
writeFileSync(`${ROOT}/prod-flows-summary.json`, JSON.stringify(summary, null, 2) + '\n');
console.log('\n=== B10-PROD-02 SUMMARY ===');
console.log(`PASS ${results.filter((r) => r.ok).length}/${results.length}`);
if (!summary.pass) process.exitCode = 1;
