// Batch 7: cross-browser functional QA (Firefox and Playwright WebKit).
// IMPORTANT: "webkit" here is Playwright's WebKit engine, NOT real Safari.
// Never label results from this script as "real Safari" or "iOS Safari".
//
// Usage: dev server (5199) running, then:
//   node scripts/batch7-cross-browser-functional.mjs firefox
//   node scripts/batch7-cross-browser-functional.mjs webkit
import { chromium, firefox, webkit } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const ENGINE = process.argv[2];
if (!['firefox', 'webkit'].includes(ENGINE)) {
  console.error('usage: node scripts/batch7-cross-browser-functional.mjs <firefox|webkit>');
  process.exit(1);
}
const LAUNCHERS = { chromium, firefox, webkit };
const launch = LAUNCHERS[ENGINE];

const BASE = 'http://localhost:5199';
const ROOT = `docs/qa/evidence/batch-7/${ENGINE}`;
mkdirSync(ROOT, { recursive: true });

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));
const results = { pass: [], fail: [] };
function record(label, ok, detail) {
  const entry = { label, ok, detail: detail ?? null };
  (ok ? results.pass : results.fail).push(entry);
  console.log(`[${ENGINE}] ${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ' :: ' + detail : ''}`);
}

async function seed(page, skin, withDeck = true) {
  // Use addInitScript (runs before any page script on the FIRST
  // navigation) instead of goto->evaluate->goto. The double-navigation
  // pattern was found to abort the first document's in-flight skin.json
  // fetches on WebKit, which WebKit reports as a confusing "access
  // control checks" console error (verified: 100% reproducible with
  // double-navigation, 0% with addInitScript's single navigation) —
  // a QA-script artifact, not a real cross-origin/CORS product issue
  // (a bare same-origin fetch succeeds fine; see Batch 7 report).
  await page.addInitScript(
    ({ skin, deck, withDeck }) => {
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', skin);
      if (withDeck) {
        window.localStorage.setItem(
          'soro-pon.decks.v1',
          JSON.stringify({ version: 1, decks: [{ deck, source: 'official', updatedAtMs: 1000 }] }),
        );
      }
    },
    { skin, deck: ANIMAL_DECK, withDeck },
  );
  await page.goto(`${BASE}/`);
  await page.waitForSelector(`html[data-skin="${skin}"]`);
}

async function playToResult(page, maxIters = 3000) {
  for (let i = 0; i < maxIters; i++) {
    if ((await page.getByRole('heading', { name: '対戦結果' }).count()) > 0) return true;
    const tsumoBtn = page.getByRole('button', { name: 'ツモ' });
    if ((await tsumoBtn.count()) && (await tsumoBtn.isEnabled().catch(() => false))) {
      await tsumoBtn.click();
      await page.waitForTimeout(300);
      continue;
    }
    const ronBtn = page.getByRole('button', { name: 'ロン' });
    if ((await ronBtn.count()) && (await ronBtn.isEnabled().catch(() => false))) {
      await ronBtn.click();
      await page.waitForTimeout(300);
      continue;
    }
    const discardBtn = page.getByRole('button', { name: '捨てる' });
    if ((await discardBtn.count()) && (await discardBtn.isEnabled().catch(() => false))) {
      await discardBtn.click();
      await page.waitForTimeout(250);
      continue;
    }
    const selectable = page.locator('.sp-tile:not(.sp-tile--back):not([disabled])');
    if ((await selectable.count()) > 0) {
      await selectable.first().click();
      await page.waitForTimeout(120);
      continue;
    }
    await page.waitForTimeout(200);
  }
  return false;
}

const browser = await launch.launch();

// 1) Fresh boot, both skins
for (const skin of ['yorunoshirube', 'cute-pop']) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(m.text());
  });
  await seed(page, skin, false);
  const ok = await page.getByRole('button', { name: /まず遊ぶ/ }).isVisible().catch(() => false);
  await page.screenshot({ path: `${ROOT}/fresh-boot-${skin}.png` });
  record(`fresh boot ${skin}`, ok);
  record(`fresh boot ${skin}: no console errors`, errs.length === 0, JSON.stringify(errs));
  await page.close();
}

// 2) Corrupt data recovery
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.decks.v1', '{"version":1,"decks":[BROKEN');
  });
  await page.goto(`${BASE}/`);
  const ok = await page.getByRole('button', { name: /まず遊ぶ/ }).isVisible({ timeout: 5000 }).catch(() => false);
  await page.screenshot({ path: `${ROOT}/corrupt-data-recovery.png` });
  record('corrupt deck data recovers to usable TOP', ok);
  await page.close();
}

// 3) Invalid skin fallback
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', 'not-a-real-skin');
  });
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(400);
  const dataSkin = await page.evaluate(() => document.documentElement.getAttribute('data-skin'));
  const ok = await page.getByRole('button', { name: /まず遊ぶ/ }).isVisible({ timeout: 5000 }).catch(() => false);
  await page.screenshot({ path: `${ROOT}/invalid-skin-fallback.png` });
  record('invalid skin ID falls back to a valid built-in skin', ok && (dataSkin === 'yorunoshirube' || dataSkin === 'cute-pop'), `data-skin=${dataSkin}`);
  await page.close();
}

// 4) Deck import: valid + invalid
for (const [name, text, expectAccept] of [
  ['valid', JSON.stringify(ANIMAL_DECK), true],
  ['invalid-json', '{ not valid', false],
  ['unsafe-script', JSON.stringify({ ...ANIMAL_DECK, script: '<script>alert(1)</script>' }), false],
]) {
  // fresh, isolated browser context per case (not just a fresh page) so
  // localStorage cannot leak between cases regardless of clear() timing
  const context = await browser.newContext({ viewport: { width: 1024, height: 600 } });
  const page = await context.newPage();
  await seed(page, 'yorunoshirube', false);
  await page.getByRole('button', { name: 'JSONを読み込む' }).click();
  await page.waitForSelector('text=デッキJSONを読み込む');
  await page.locator('textarea').click();
  await page.locator('textarea').fill(text);
  const typedValue = await page.locator('textarea').inputValue();
  const readBtn = page.getByRole('button', { name: '読み込む', exact: true });
  const readBtnEnabled = await readBtn.isEnabled();
  await readBtn.click();
  await page.waitForTimeout(400);
  // NOTE: getByRole name matching is substring-based by default in Playwright,
  // so a bare name:'編集' false-matches TOP's "デッキ一覧" button (its subLabel
  // text is "保存したデッキを確認・編集します", which contains "編集").
  // Use exact:true against the DeckDetail-specific "編集" button instead.
  const inDeckDetail = (await page.getByRole('button', { name: '編集', exact: true }).count()) > 0;
  const rejectedBadge = await page.getByText('拒否').count();
  await page.screenshot({ path: `${ROOT}/import-${name}.png` });
  record(
    `import ${name}: ${expectAccept ? 'accepted' : 'rejected'}`,
    inDeckDetail === expectAccept,
    `inDeckDetail=${inDeckDetail} rejectedBadge=${rejectedBadge} textareaValueLen=${typedValue.length} readBtnEnabled=${readBtnEnabled}`,
  );
  await context.close();
}

// 5) Deck editor: category add, unsaved changes warning
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seed(page, 'yorunoshirube');
  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.locator('.sp-deck-card').first().click();
  await page.getByRole('button', { name: '編集' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('tab', { name: /カテゴリ/ }).click();
  await page.getByRole('button', { name: 'カテゴリを追加' }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'もどる' }).click();
  await page.waitForTimeout(200);
  const warningShown = (await page.getByText(/保存していない変更/).count()) > 0;
  await page.screenshot({ path: `${ROOT}/deck-editor-unsaved-warning.png` });
  record('unsaved changes warning shown', warningShown);
  await page.close();
}

// 6) Gallery loads
for (const skin of ['yorunoshirube', 'cute-pop']) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await seed(page, skin, false);
  await page.goto(`${BASE}/#/gallery`);
  await page.waitForTimeout(500);
  const ok = await page.getByText('Nine-slice実証').isVisible().catch(() => false);
  await page.screenshot({ path: `${ROOT}/gallery-${skin}.png` });
  record(`Gallery loads (${skin})`, ok);
  record(`Gallery no console errors (${skin})`, errs.length === 0, JSON.stringify(errs));
  await page.close();
}

// 7) Skin switching
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seed(page, 'yorunoshirube', false);
  await page.getByRole('button', { name: /きせかえ/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /Cute Pop/ }).click();
  await page.waitForTimeout(300);
  const dataSkin = await page.evaluate(() => document.documentElement.getAttribute('data-skin'));
  await page.screenshot({ path: `${ROOT}/skin-switch-after.png` });
  record('skin switch applies without reload', dataSkin === 'cute-pop');
  await page.close();
}

// 8) Match Setup constraints: 2-player not selectable
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seed(page, 'yorunoshirube');
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.waitForSelector('text=対局設定');
  const twoPlayer = await page.getByRole('button', { name: '2人戦' }).count();
  await page.screenshot({ path: `${ROOT}/match-setup.png` });
  record('2-player not selectable', twoPlayer === 0);
  await page.close();
}

// 9) Full matches: 3p and 4p, reach Result
for (const playerCount of [3, 4]) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(m.text());
  });
  await seed(page, 'yorunoshirube');
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: `${playerCount}人戦` }).click();
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(500);
  const reachedResult = await playToResult(page);
  await page.screenshot({ path: `${ROOT}/match-${playerCount}p-final.png` });
  record(`${playerCount}-player match reaches Result`, reachedResult);
  record(`${playerCount}-player match: no console errors`, errs.length === 0, JSON.stringify(errs).slice(0, 300));
  if (reachedResult) {
    const rematchOrTop = (await page.getByRole('button', { name: 'もう一局' }).count()) > 0;
    record(`${playerCount}-player: rematch/TOP options present on Result`, rematchOrTop);
  }
  await page.close();
}

// 10) Modal open/close + reload + reset confirmation
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seed(page, 'yorunoshirube', false);
  await page.getByRole('button', { name: 'ローカルデータを初期化…' }).click();
  await page.waitForTimeout(200);
  const dialogVisible = await page.getByRole('dialog').isVisible().catch(() => false);
  await page.screenshot({ path: `${ROOT}/reset-confirmation.png` });
  record('reset confirmation dialog opens', dialogVisible);
  await page.getByRole('button', { name: 'やめる' }).click();
  await page.waitForTimeout(150);
  const dialogClosed = (await page.getByRole('dialog').count()) === 0;
  record('reset confirmation dialog closes via cancel', dialogClosed);
  await page.reload();
  const okAfterReload = await page.getByRole('button', { name: /まず遊ぶ/ }).isVisible({ timeout: 5000 }).catch(() => false);
  record('reload on TOP does not crash', okAfterReload);
  await page.close();
}

await browser.close();
writeFileSync(`${ROOT}/gate7-${ENGINE}-summary.json`, JSON.stringify(results, null, 2));
console.log(`\n=== ${ENGINE.toUpperCase()} SUMMARY ===`);
console.log(`PASS: ${results.pass.length}  FAIL: ${results.fail.length}`);
if (results.fail.length > 0) {
  console.log('FAILURES:');
  for (const f of results.fail) console.log(` - ${f.label}: ${f.detail}`);
  process.exitCode = 1;
}
