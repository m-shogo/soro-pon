// Batch 9: Extended Memory & Runtime Stability Soak harness.
// 設計の正本: docs/qa/BATCH-9-EXTENDED-SOAK-MATRIX.md(実行前に固定済み)。
//
// 使い方: dev server(5199)起動中に
//   node scripts/qa/run-batch9-soak.mjs --browser=chromium --max-minutes=60 --max-cycles=100 --label=chromium-primary
//   node scripts/qa/run-batch9-soak.mjs --browser=firefox  --max-cycles=20 --label=firefox-aux
//   node scripts/qa/run-batch9-soak.mjs --browser=webkit   --max-cycles=20 --label=webkit-aux
//
// 出力(docs/qa/evidence/batch-9/):
//   soak-<label>.jsonl        1 cycle = 1行(逐次flush、非有界配列を保持しない)
//   soak-<label>-summary.json 実行終了時の集計(warm-up除外トレンド込み)
//   shots/<label>-*.png       境界時刻(start/15/30/45/60min)/失敗時/最終のみ
//
// 計測方針(matrixの契約):
// - Chromiumのみmemoryが正: CDP Performance.getMetrics(JSHeapUsedSize、
//   量子化なし) + Memory.getDOMCounters(nodes/documents/jsEventListeners)。
//   heap採取直前にHeapProfiler.collectGarbageで強制GC(post-GC heapのみで判定)。
// - Firefox/WebKitはCDP非対応のため安定性のみ(crash/pageerror/console error/
//   request failure/機能完走)。memory数値はnullで記録し、同等性は主張しない。
// - timer/rAFはpage-init shim(計測専用・製品コードではない)でoutstanding
//   balanceを追跡。
import { chromium, firefox, webkit } from '@playwright/test';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

// ---- args ----
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  }),
);
const BROWSER = args.browser ?? 'chromium';
const MAX_MINUTES = Number(args['max-minutes'] ?? (BROWSER === 'chromium' ? 60 : 30));
const MAX_CYCLES = Number(args['max-cycles'] ?? (BROWSER === 'chromium' ? 100 : 20));
const LABEL = args.label ?? `${BROWSER}-soak`;
const BASE = args.base ?? 'http://localhost:5199';

// 出力先。既定はBatch 9の証跡ディレクトリ(既存の実行方法を変えない)。
// 他batchから流用する場合のみ --out-root で明示的に切り替える。
const ROOT = args['out-root'] ?? 'docs/qa/evidence/batch-9';
mkdirSync(`${ROOT}/shots`, { recursive: true });
const JSONL = `${ROOT}/soak-${LABEL}.jsonl`;
writeFileSync(JSONL, ''); // 新規実行で上書き開始

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));

// 決定的なシナリオ回転(matrixのS番号)。S6(Result->TOPへ)は全match系
// シナリオの終了経路として毎回実行されるため個別スロットを持たない。
// match系(S1-S5)を厚めに配置(13 cycle中6回match完走)。
const PATTERN = [
  { s: 'S1', kind: 'match', skin: 'yorunoshirube', players: 3 },
  { s: 'S9', kind: 'modalChurn' },
  { s: 'S8', kind: 'skinSwitch' },
  { s: 'S2', kind: 'match', skin: 'yorunoshirube', players: 4 },
  { s: 'S7', kind: 'setupReentry' },
  { s: 'S10', kind: 'importRoundTrip' },
  { s: 'S3', kind: 'match', skin: 'cute-pop', players: 3 },
  { s: 'S11', kind: 'deckRoundTrip' },
  { s: 'S5', kind: 'matchReplay', skin: 'yorunoshirube', players: 3 },
  { s: 'S4', kind: 'match', skin: 'cute-pop', players: 4 },
  { s: 'S12', kind: 'reload' },
  { s: 'S13', kind: 'corruptedFixture' },
  { s: 'S14', kind: 'resetCancel' },
];

// ---- per-cycle error counters (page listeners feed these) ----
let pageErrors = 0;
let consoleErrors = 0;
let failedRequests = 0;
function resetCycleErrors() {
  pageErrors = 0;
  consoleErrors = 0;
  failedRequests = 0;
}
const errorSamples = []; // 先頭数件のみ保持(非有界にしない)
function noteError(kind, text) {
  if (errorSamples.length < 40) errorSamples.push({ kind, text: String(text).slice(0, 300) });
}

// ---- metrics ----
async function forceGC(cdp) {
  if (!cdp) return;
  try {
    await cdp.send('HeapProfiler.collectGarbage');
  } catch {
    // HeapProfiler不可の環境ではidle settleにfallback(matrix記載)
  }
}
async function sampleMetrics(page, cdp) {
  let heapUsedBytes = null;
  let domNodes = null;
  let domDocuments = null;
  let jsListeners = null;
  if (cdp) {
    await forceGC(cdp);
    await page.waitForTimeout(150);
    try {
      const { metrics } = await cdp.send('Performance.getMetrics');
      heapUsedBytes = metrics.find((m) => m.name === 'JSHeapUsedSize')?.value ?? null;
    } catch {}
    try {
      const c = await cdp.send('Memory.getDOMCounters');
      domNodes = c.nodes;
      domDocuments = c.documents;
      jsListeners = c.jsEventListeners;
    } catch {}
  }
  const pageSide = await page
    .evaluate(() => {
      const t = window.__soakTimers ?? null;
      let bytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        bytes += k.length + (localStorage.getItem(k)?.length ?? 0);
      }
      return {
        liveTimers: t ? t.timeouts + t.intervals + t.rafs : null,
        liveIntervals: t ? t.intervals : null,
        localStorageKeys: localStorage.length,
        localStorageBytes: bytes,
      };
    })
    .catch(() => ({ liveTimers: null, liveIntervals: null, localStorageKeys: null, localStorageBytes: null }));
  return { heapUsedBytes, domNodes, domDocuments, jsListeners, ...pageSide };
}

// timer/rAF計測shim(page-init、製品コードには入れない)
const TIMER_SHIM = `(() => {
  const c = { timeouts: 0, intervals: 0, rafs: 0 };
  window.__soakTimers = c;
  const st = window.setTimeout, ct = window.clearTimeout;
  const si = window.setInterval, ci = window.clearInterval;
  const ra = window.requestAnimationFrame, caf = window.cancelAnimationFrame;
  const liveT = new Set(), liveI = new Set(), liveR = new Set();
  window.setTimeout = function (fn, ms, ...rest) {
    const id = st.call(window, function (...a) {
      if (liveT.delete(id)) c.timeouts--;
      return typeof fn === 'function' ? fn(...a) : undefined;
    }, ms, ...rest);
    liveT.add(id); c.timeouts++;
    return id;
  };
  window.clearTimeout = function (id) { if (liveT.delete(id)) c.timeouts--; return ct.call(window, id); };
  window.setInterval = function (...a) { const id = si.apply(window, a); liveI.add(id); c.intervals++; return id; };
  window.clearInterval = function (id) { if (liveI.delete(id)) c.intervals--; return ci.call(window, id); };
  window.requestAnimationFrame = function (fn) {
    const id = ra.call(window, function (ts) { if (liveR.delete(id)) c.rafs--; return fn(ts); });
    liveR.add(id); c.rafs++;
    return id;
  };
  window.cancelAnimationFrame = function (id) { if (liveR.delete(id)) c.rafs--; return caf.call(window, id); };
})();`;

// ---- app driving helpers ----
async function waitTop(page) {
  await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor({ timeout: 15000 });
}
async function gotoTop(page) {
  // Result画面ならTOPへ、それ以外は直接navigate
  const topBtn = page.getByRole('button', { name: 'TOPへ' });
  if (await topBtn.count()) {
    await topBtn.click();
  } else if ((await page.getByRole('button', { name: /まず遊ぶ/ }).count()) === 0) {
    await page.goto(`${BASE}/`);
  }
  await waitTop(page);
}
async function ensureSkin(page, skinId) {
  const current = await page.evaluate(() => document.documentElement.getAttribute('data-skin'));
  if (current === skinId) return;
  await page.getByRole('button', { name: /きせかえ/ }).click();
  const name = skinId === 'cute-pop' ? /Cute Pop/ : /ヨルノシルベ/;
  await page.getByRole('button', { name }).click();
  await page.getByRole('button', { name: 'とじる' }).click();
  await page.waitForSelector(`html[data-skin="${skinId}"]`);
}

async function playToResult(page) {
  const deadline = Date.now() + 4 * 60 * 1000;
  while (Date.now() < deadline) {
    if (await page.getByRole('heading', { name: '対戦結果' }).count()) return true;
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
    const selectable = page.locator('.sp-tile:not(.sp-tile--back):not([disabled])');
    if (await selectable.count()) {
      await selectable.first().click();
      await page.waitForTimeout(100);
      continue;
    }
    await page.waitForTimeout(200);
  }
  return false;
}

async function runMatch(page, { skin, players, replay }) {
  await ensureSkin(page, skin);
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: `${players}人戦` }).click();
  await page.getByRole('button', { name: '対局開始' }).click();
  let reached = await playToResult(page);
  if (reached && replay) {
    await page.getByRole('button', { name: /もう一局/ }).click();
    await page.waitForTimeout(300);
    reached = await playToResult(page);
  }
  await gotoTop(page); // S6経路(Result -> TOPへ)を毎回実行
  return reached;
}

const SCENARIOS = {
  async match(page, spec) {
    return { reachedResult: await runMatch(page, { skin: spec.skin, players: spec.players, replay: false }) };
  },
  async matchReplay(page, spec) {
    // S5: replayスキンを交互に(決定的: cycle番号はspec.cycleで渡る)
    const skin = spec.cycle % 2 === 0 ? 'cute-pop' : 'yorunoshirube';
    return { reachedResult: await runMatch(page, { skin, players: spec.players, replay: true }) };
  },
  async setupReentry(page) {
    await page.getByRole('button', { name: /まず遊ぶ/ }).click();
    await page.waitForSelector('text=対局設定');
    await page.getByRole('button', { name: 'もどる' }).click();
    await waitTop(page);
    return {};
  },
  async skinSwitch(page) {
    const current = await page.evaluate(() => document.documentElement.getAttribute('data-skin'));
    await ensureSkin(page, current === 'cute-pop' ? 'yorunoshirube' : 'cute-pop');
    return {};
  },
  async modalChurn(page) {
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /きせかえ/ }).click();
      await page.getByRole('button', { name: 'とじる' }).click();
    }
    return {};
  },
  async importRoundTrip(page) {
    await page.getByRole('button', { name: /JSONを読み込む/ }).click();
    // getByLabelはmodal dialog(aria-labelledby)とtextareaの両方に解決するため
    // roleで限定する(smoke runで発見したharness defectの修正)
    await page.getByRole('textbox', { name: 'デッキJSON' }).fill(JSON.stringify(ANIMAL_DECK));
    // 「読み込む」はTOPの「JSONを読み込む」にも部分一致するためexact指定
    // (Batch 7で確認済みのgetByRole substringピットフォールと同種)
    await page.getByRole('button', { name: '読み込む', exact: true }).click();
    // saveDeckはid upsertのため同一deckの再importは有界(localStorage増殖しない)
    await page.waitForSelector('text=デッキ情報');
    await gotoTop(page);
    return {};
  },
  async deckRoundTrip(page) {
    await page.getByRole('button', { name: 'デッキ一覧' }).click();
    await page.waitForSelector('.sp-deck-card');
    await page.locator('.sp-deck-card').first().click();
    await page.waitForSelector('text=デッキ情報');
    await page.getByRole('button', { name: '編集' }).click();
    await page.waitForSelector('text=デッキ編集');
    await page.getByRole('button', { name: 'もどる' }).click();
    await gotoTop(page);
    return {};
  },
  async reload(page) {
    await page.reload();
    await waitTop(page);
    return {};
  },
  async corruptedFixture(page) {
    // 壊れたdeck entryを1件注入 -> boot -> 正常deckが生き残ることを確認 -> 復元
    const snapshot = await page.evaluate(() => localStorage.getItem('soro-pon.decks.v1'));
    await page.evaluate(() => {
      const payload = JSON.parse(localStorage.getItem('soro-pon.decks.v1'));
      payload.decks.push({ bogus: true, deck: { id: 'broken' } });
      localStorage.setItem('soro-pon.decks.v1', JSON.stringify(payload));
    });
    await page.reload();
    await waitTop(page);
    const playable = await page.getByRole('button', { name: /まず遊ぶ/ }).isEnabled();
    await page.evaluate((s) => localStorage.setItem('soro-pon.decks.v1', s), snapshot);
    await page.reload();
    await waitTop(page);
    if (!playable) throw new Error('corrupted fixture: healthy deck did not survive salvage');
    return {};
  },
  async resetCancel(page) {
    // 確認dialogを開いて必ずキャンセル(確定するとfixtureが消えるため絶対に確定しない)
    await page.getByRole('button', { name: 'ローカルデータを初期化…' }).click();
    await page.waitForSelector('text=ローカルデータの初期化');
    await page.getByRole('button', { name: 'やめる' }).click();
    await waitTop(page);
    return {};
  },
};

// ---- main ----
const engines = { chromium, firefox, webkit };
const browser = await engines[BROWSER].launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
await page.addInitScript(TIMER_SHIM);
page.on('pageerror', (e) => {
  pageErrors++;
  noteError('pageerror', e);
});
page.on('console', (m) => {
  if (m.type() === 'error') {
    consoleErrors++;
    noteError('console', m.text());
  }
});
page.on('requestfailed', (r) => {
  // devサーバ停止/中断系のnoiseは失敗理由付きで記録し、集計はそのまま数える
  failedRequests++;
  noteError('requestfailed', `${r.url()} :: ${r.failure()?.errorText}`);
});

let cdp = null;
if (BROWSER === 'chromium') {
  cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('HeapProfiler.enable').catch(() => {});
}

// seed: animal deck + yorunoshirube(batch5と同一fixture)
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
await waitTop(page);
await page.screenshot({ path: `${ROOT}/shots/${LABEL}-000-start.png` });

const t0 = Date.now();
const shotMarks = [15, 30, 45, 60].map((m) => ({ min: m, done: false }));
let cycle = 0;
let consecutiveFailures = 0;
let aborted = null;
const scenarioCounts = {};

while (Date.now() - t0 < MAX_MINUTES * 60 * 1000 && cycle < MAX_CYCLES) {
  const spec = { ...PATTERN[cycle % PATTERN.length], cycle };
  resetCycleErrors();
  const cStart = Date.now();
  let note = null;
  let extra = {};
  try {
    extra = await SCENARIOS[spec.kind](page, spec);
    consecutiveFailures = 0;
  } catch (e) {
    note = String(e).slice(0, 400);
    consecutiveFailures++;
    await page.screenshot({ path: `${ROOT}/shots/${LABEL}-fail-cycle${cycle}.png` }).catch(() => {});
    // 失敗後はTOPへ強制復帰を試みる
    await page.goto(`${BASE}/`).catch(() => {});
    await waitTop(page).catch(() => {});
  }
  const cycleDurationMs = Date.now() - cStart;
  const m = await sampleMetrics(page, cdp);
  const line = {
    cycle,
    tSinceStartMs: Date.now() - t0,
    scenario: spec.s,
    kind: spec.kind,
    skin: spec.skin ?? null,
    playerCount: spec.players ?? null,
    reachedResult: extra.reachedResult ?? null,
    ...m,
    cycleDurationMs,
    pageErrors,
    consoleErrors,
    failedRequests,
    note,
  };
  appendFileSync(JSONL, JSON.stringify(line) + '\n');
  scenarioCounts[spec.s] = (scenarioCounts[spec.s] ?? 0) + 1;
  const min = ((Date.now() - t0) / 60000).toFixed(1);
  console.log(
    `[${min}m] c${cycle} ${spec.s}/${spec.kind} ${cycleDurationMs}ms heap=${m.heapUsedBytes ? (m.heapUsedBytes / 1048576).toFixed(1) + 'MB' : 'n/a'} nodes=${m.domNodes ?? 'n/a'} listeners=${m.jsListeners ?? 'n/a'} timers=${m.liveTimers ?? 'n/a'}${note ? ' FAIL: ' + note : ''}`,
  );
  for (const mark of shotMarks) {
    if (!mark.done && Date.now() - t0 >= mark.min * 60 * 1000) {
      mark.done = true;
      await page.screenshot({ path: `${ROOT}/shots/${LABEL}-${String(mark.min).padStart(3, '0')}min.png` }).catch(() => {});
    }
  }
  if (consecutiveFailures >= 3) {
    aborted = `3 consecutive cycle failures at cycle ${cycle}`;
    break;
  }
  cycle++;
}

await page.screenshot({ path: `${ROOT}/shots/${LABEL}-final.png` }).catch(() => {});

// ---- summary(JSONLから再読込して集計: warm-up除外トレンド) ----
const lines = readFileSync(JSONL, 'utf-8')
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l));
const WARMUP_MS = 5 * 60 * 1000;
const postWarm = lines.filter((l, i) => i >= 10 && l.tSinceStartMs >= WARMUP_MS);
const usable = postWarm.length >= 20 ? postWarm : lines.slice(Math.min(10, Math.floor(lines.length / 3)));
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};
const p95 = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.95))] : null;
};
function trend(field) {
  const vals = usable.map((l) => l[field]).filter((v) => v != null);
  if (vals.length < 10) return { first10Median: null, last10Median: null, growthPct: null };
  const first = median(vals.slice(0, 10));
  const last = median(vals.slice(-10));
  return { first10Median: first, last10Median: last, growthPct: first ? Number((((last - first) / first) * 100).toFixed(1)) : null };
}
function perfTrend() {
  // match系cycleのみ(シナリオ混在のままだと比較にならない)
  const match = usable.filter((l) => l.kind === 'match' || l.kind === 'matchReplay').map((l) => l.cycleDurationMs);
  if (match.length < 10) return { firstP95: null, lastP95: null, slowdownPct: null };
  const firstP95 = p95(match.slice(0, Math.min(10, Math.floor(match.length / 2))));
  const lastP95 = p95(match.slice(-Math.min(10, Math.floor(match.length / 2))));
  return { firstP95, lastP95, slowdownPct: firstP95 ? Number((((lastP95 - firstP95) / firstP95) * 100).toFixed(1)) : null };
}
const summary = {
  label: LABEL,
  browser: BROWSER,
  base: BASE,
  startedAt: new Date(t0).toISOString(),
  durationMinutes: Number(((Date.now() - t0) / 60000).toFixed(1)),
  cyclesCompleted: lines.length,
  maxMinutes: MAX_MINUTES,
  maxCycles: MAX_CYCLES,
  aborted,
  scenarioCounts,
  matchesReachedResult: lines.filter((l) => l.reachedResult === true).length,
  matchesFailedResult: lines.filter((l) => l.reachedResult === false).length,
  cyclesWithNote: lines.filter((l) => l.note).length,
  totalPageErrors: lines.reduce((a, l) => a + l.pageErrors, 0),
  totalConsoleErrors: lines.reduce((a, l) => a + l.consoleErrors, 0),
  totalFailedRequests: lines.reduce((a, l) => a + l.failedRequests, 0),
  errorSamples,
  warmupExcluded: { cycles: lines.length - usable.length, policy: 'first 5min OR first 10 cycles (longer wins)' },
  trends: {
    heapUsedBytes: trend('heapUsedBytes'),
    domNodes: trend('domNodes'),
    jsListeners: trend('jsListeners'),
    liveTimers: trend('liveTimers'),
    localStorageBytes: trend('localStorageBytes'),
    matchCyclePerf: perfTrend(),
  },
  memoryAuthority: BROWSER === 'chromium' ? 'authoritative (CDP, post-GC)' : 'not measured (stability-only run, per matrix)',
};
writeFileSync(`${ROOT}/soak-${LABEL}-summary.json`, JSON.stringify(summary, null, 2) + '\n');
console.log('\n=== SOAK SUMMARY ===');
console.log(JSON.stringify(summary, null, 2));

await browser.close();
if (aborted) process.exitCode = 1;
