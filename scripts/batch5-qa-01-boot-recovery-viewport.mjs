// Batch 5 QA: boot/recovery + skin switching + 5-viewport screen sweep.
// 使い方: dev server(5199)起動中に
//   node scripts/batch5-qa-01-boot-recovery-viewport.mjs
// 出力: docs/qa/evidence/batch-5/{cutepop,yorunoshirube}/<viewport>/*.png
//       docs/qa/evidence/batch-5/recovery/*.png
//       docs/qa/evidence/batch-5/skin-switch/*.png
//       docs/qa/evidence/batch-5/console/*.json
//       docs/qa/evidence/batch-5/network/*.json
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const BASE = 'http://localhost:5199';
const ROOT = 'docs/qa/evidence/batch-5';
mkdirSync(`${ROOT}/recovery`, { recursive: true });
mkdirSync(`${ROOT}/skin-switch`, { recursive: true });
mkdirSync(`${ROOT}/console`, { recursive: true });
mkdirSync(`${ROOT}/network`, { recursive: true });

const VIEWPORTS = [
  { name: '844x390', width: 844, height: 390 },
  { name: '852x393', width: 852, height: 393 },
  { name: '932x430', width: 932, height: 430 },
  { name: '1024x600', width: 1024, height: 600 },
  { name: '1366x768', width: 1366, height: 768 },
];

const SKIN_DIRS = { yorunoshirube: 'yorunoshirube', 'cute-pop': 'cutepop' };
const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));

const results = { pass: [], fail: [], notes: [] };

function record(label, ok, detail) {
  const entry = { label, ok, detail: detail ?? null };
  (ok ? results.pass : results.fail).push(entry);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ' :: ' + detail : ''}`);
}

async function seedDeckAndSkin(page, skinId) {
  await page.goto(`${BASE}/`);
  await page.evaluate(
    ({ skin, deck }) => {
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', skin);
      window.localStorage.setItem(
        'soro-pon.decks.v1',
        JSON.stringify({
          version: 1,
          decks: [{ deck, source: 'official', updatedAtMs: 1000 }],
        }),
      );
    },
    { skin: skinId, deck: ANIMAL_DECK },
  );
  await page.goto(`${BASE}/`);
  await page.waitForSelector(`html[data-skin="${skinId}"]`);
}

async function collectConsoleErrors(page, bucket) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      bucket.push({ type: 'console.error', text: msg.text() });
    }
  });
  page.on('pageerror', (err) => {
    bucket.push({ type: 'pageerror', text: String(err) });
  });
}

const browser = await chromium.launch();

// ---------- 1) Fresh boot (no localStorage) for both skins, all 5 viewports, TOP screen ----------
for (const [skinId, dir] of Object.entries(SKIN_DIRS)) {
  for (const vp of VIEWPORTS) {
    const errs = [];
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await collectConsoleErrors(page, errs);
    await page.goto(`${BASE}/`);
    await page.evaluate((skin) => {
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', skin);
    }, skinId);
    await page.goto(`${BASE}/`);
    const ok = await page
      .waitForSelector(`html[data-skin="${skinId}"]`, { timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    await page.waitForTimeout(300);
    mkdirSync(`${ROOT}/${dir}/${vp.name}`, { recursive: true });
    await page.screenshot({ path: `${ROOT}/${dir}/${vp.name}/top-fresh-boot.png` });
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    record(
      `fresh boot TOP ${skinId} ${vp.name}`,
      ok && !hasHScroll,
      !ok ? 'data-skin not applied' : hasHScroll ? 'horizontal scroll detected' : undefined,
    );
    if (errs.length > 0) {
      writeFileSync(
        `${ROOT}/console/fresh-boot-${dir}-${vp.name}.json`,
        JSON.stringify(errs, null, 2),
      );
      record(`console clean fresh boot ${skinId} ${vp.name}`, false, JSON.stringify(errs));
    } else {
      record(`console clean fresh boot ${skinId} ${vp.name}`, true);
    }
    await page.close();
  }
}

// ---------- 2) Full screen sweep with seeded deck data (both skins, all 5 viewports) ----------
for (const [skinId, dir] of Object.entries(SKIN_DIRS)) {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await seedDeckAndSkin(page, skinId);

    // TOP
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${ROOT}/${dir}/${vp.name}/top.png` });
    const hScrollTop = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    record(`no h-scroll TOP ${skinId} ${vp.name}`, !hScrollTop);

    // DeckList
    await page.getByRole('button', { name: 'デッキ一覧' }).click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${ROOT}/${dir}/${vp.name}/deck-list.png` });
    const hScrollList = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    record(`no h-scroll DeckList ${skinId} ${vp.name}`, !hScrollList);

    // DeckDetail
    const deckCard = page.locator('.sp-deck-card').first();
    const hasCard = await deckCard.count();
    if (hasCard) {
      await deckCard.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${ROOT}/${dir}/${vp.name}/deck-detail.png` });
    } else {
      record(`DeckDetail reachable ${skinId} ${vp.name}`, false, 'no .sp-deck-card found');
    }

    // DeckEditor
    const editBtn = page.getByRole('button', { name: '編集' });
    if (await editBtn.count()) {
      await editBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${ROOT}/${dir}/${vp.name}/deck-editor.png` });
      const hScrollEd = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      record(`no h-scroll DeckEditor ${skinId} ${vp.name}`, !hScrollEd);
      // back to top for the rest
      await page.goto(`${BASE}/`);
      await page.waitForSelector(`html[data-skin="${skinId}"]`);
    } else {
      record(`DeckEditor reachable ${skinId} ${vp.name}`, false, 'no 編集 button found');
      await page.goto(`${BASE}/`);
    }

    // Collection
    await page.getByRole('button', { name: '記憶帳' }).click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${ROOT}/${dir}/${vp.name}/collection.png` });

    // MatchSetup
    await page.goto(`${BASE}/`);
    await page.waitForSelector(`html[data-skin="${skinId}"]`);
    await page.getByRole('button', { name: /まず遊ぶ/ }).click();
    await page.waitForSelector('text=対局設定');
    await page.screenshot({ path: `${ROOT}/${dir}/${vp.name}/match-setup.png` });

    // 2-player must be blocked (button disabled, only 3/4 shown)
    const twoPlayerBtn = page.getByRole('button', { name: '2人戦' });
    const twoPlayerExists = await twoPlayerBtn.count();
    record(`2-player not selectable ${skinId} ${vp.name}`, twoPlayerExists === 0, twoPlayerExists ? 'found a 2人戦 button' : undefined);

    // Gallery
    await page.goto(`${BASE}/#/gallery`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${ROOT}/${dir}/${vp.name}/gallery.png` });

    await page.close();
  }
}

// ---------- 3) Boot/Recovery scenarios ----------
{
  // reload on main screens (TOP, DeckList)
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seedDeckAndSkin(page, 'yorunoshirube');
  await page.reload();
  const okAfterReload = await page
    .waitForSelector('text=まず遊ぶ', { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  await page.screenshot({ path: `${ROOT}/recovery/reload-top.png` });
  record('reload on TOP does not crash', okAfterReload);
  await page.close();
}

{
  // reload during match
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seedDeckAndSkin(page, 'yorunoshirube');
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.waitForSelector('text=対局開始');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${ROOT}/recovery/before-reload-during-match.png` });
  await page.reload();
  await page.waitForTimeout(500);
  const bodyText = await page.evaluate(() => document.body.innerText);
  const blank = bodyText.trim().length === 0;
  await page.screenshot({ path: `${ROOT}/recovery/after-reload-during-match.png` });
  record('reload during match does not blank-screen', !blank, blank ? 'body text empty' : `landed on: ${bodyText.slice(0, 60)}`);
  await page.close();
}

{
  // corrupt deck data recovery
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  const errs = [];
  await collectConsoleErrors(page, errs);
  await page.goto(`${BASE}/`);
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.decks.v1', '{"version":1,"decks":[BROKEN_JSON');
  });
  await page.goto(`${BASE}/`);
  const okTop = await page
    .waitForSelector('text=まず遊ぶ', { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  await page.screenshot({ path: `${ROOT}/recovery/corrupt-deck-data.png` });
  const backupPresent = await page.evaluate(
    () => window.localStorage.getItem('soro-pon.decks.v1.corrupt-backup') !== null,
  );
  record('corrupt deck data recovers to usable TOP', okTop, okTop ? undefined : 'TOP not reachable');
  record('corrupt deck data preserved in backup key', backupPresent);
  await page.close();
}

{
  // invalid skin id recovery
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  const errs = [];
  await collectConsoleErrors(page, errs);
  await page.goto(`${BASE}/`);
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', 'not-a-real-skin-id');
  });
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(500);
  const dataSkin = await page.evaluate(() => document.documentElement.getAttribute('data-skin'));
  const okTop = await page
    .waitForSelector('text=まず遊ぶ', { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  await page.screenshot({ path: `${ROOT}/recovery/invalid-skin-id.png` });
  record(
    'invalid skin id falls back to a valid built-in skin',
    okTop && (dataSkin === 'yorunoshirube' || dataSkin === 'cute-pop'),
    `resolved data-skin=${dataSkin}`,
  );
  if (errs.length > 0) {
    writeFileSync(`${ROOT}/console/invalid-skin-id.json`, JSON.stringify(errs, null, 2));
  }
  await page.close();
}

{
  // missing deck (deckDetail/matchSetup for a deckId that isn't stored) -> should not infinite-load / blank
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await page.goto(`${BASE}/`);
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', 'yorunoshirube');
  });
  await page.goto(`${BASE}/`);
  await page.waitForSelector('text=まず遊ぶ');
  // デッキが1件もない状態で「まず遊ぶ」を押す(missing/未作成デッキの経路)
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.waitForTimeout(400);
  const bodyText = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: `${ROOT}/recovery/no-deck-play-now.png` });
  record(
    'missing/no deck does not blank-screen on まず遊ぶ',
    bodyText.trim().length > 0,
    bodyText.trim().length === 0 ? 'blank body' : `landed on: ${bodyText.slice(0, 80)}`,
  );
  await page.close();
}

{
  // AppErrorBoundary + reset path
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seedDeckAndSkin(page, 'yorunoshirube');
  await page.waitForSelector('text=ローカルデータを初期化');
  await page.getByRole('button', { name: 'ローカルデータを初期化…' }).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${ROOT}/recovery/reset-confirmation.png` });
  const dialogText = await page.evaluate(() => document.querySelector('[role="dialog"]')?.textContent ?? '');
  record('reset confirmation dialog explains scope', dialogText.length > 10, dialogText.slice(0, 120));
  await page.close();
}

// ---------- 4) Skin switching QA ----------
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  const responses = [];
  page.on('response', (res) => {
    if (res.url().includes('/skins/')) {
      responses.push({ url: res.url(), status: res.status(), contentType: res.headers()['content-type'] ?? '' });
    }
  });
  await seedDeckAndSkin(page, 'yorunoshirube');

  // navigate deep into DeckEditor, switch skin, verify state preserved
  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.waitForTimeout(200);
  await page.locator('.sp-deck-card').first().click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: '編集' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${ROOT}/skin-switch/before-switch-deck-editor.png` });

  // find and open skin selector via a global entry point: navigate home then back is not state-preserving,
  // so first check whether SkinSelector is reachable from within DeckEditor
  const kisekaeBtn = page.getByRole('button', { name: /きせかえ/ });
  const reachableFromEditor = await kisekaeBtn.count();
  record('SkinSelector reachable from DeckEditor', reachableFromEditor > 0);

  await page.goto(`${BASE}/`);
  await page.waitForSelector(`html[data-skin="yorunoshirube"]`);
  await page.getByRole('button', { name: /きせかえ/ }).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${ROOT}/skin-switch/selector-open.png` });
  await page.getByRole('button', { name: /Cute Pop/ }).click();
  await page.waitForTimeout(300);
  const dataSkinAfter = await page.evaluate(() => document.documentElement.getAttribute('data-skin'));
  record('skin switch to cute-pop applies without reload', dataSkinAfter === 'cute-pop');
  await page.getByRole('button', { name: 'とじる' }).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${ROOT}/skin-switch/after-switch-top.png` });

  // colorScheme / theme-color update check
  const colorScheme = await page.evaluate(() => document.documentElement.style.colorScheme);
  const themeColor = await page.evaluate(
    () => document.getElementById('sp-theme-color')?.getAttribute('content') ?? null,
  );
  record('color-scheme meta updates on skin switch', !!colorScheme, `colorScheme=${colorScheme}`);
  record('theme-color meta updates on skin switch', !!themeColor, `themeColor=${themeColor}`);

  // reload persistence
  await page.reload();
  await page.waitForTimeout(300);
  const dataSkinPersist = await page.evaluate(() => document.documentElement.getAttribute('data-skin'));
  record('skin selection persists after reload', dataSkinPersist === 'cute-pop');

  writeFileSync(`${ROOT}/network/skin-switch-requests.json`, JSON.stringify(responses, null, 2));
  const candidateLeaks = responses.filter((r) => r.url.includes('/candidates/'));
  const four04s = responses.filter((r) => r.status === 404);
  record('no candidate asset requests in production runtime', candidateLeaks.length === 0, JSON.stringify(candidateLeaks));
  record('no 404 asset requests during skin switch', four04s.length === 0, JSON.stringify(four04s));

  await page.close();
}

// ---------- 5) Final asset version/URL audit for both skins ----------
for (const [skinId, dir] of Object.entries(SKIN_DIRS)) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const responses = [];
  page.on('response', (res) => {
    if (res.url().includes(`/skins/${skinId}/`)) {
      responses.push({ url: res.url(), status: res.status(), contentType: res.headers()['content-type'] ?? '' });
    }
  });
  await seedDeckAndSkin(page, skinId);
  await page.goto(`${BASE}/#/gallery`);
  await page.waitForTimeout(500);
  writeFileSync(`${ROOT}/network/${dir}-asset-audit.json`, JSON.stringify(responses, null, 2));
  const finals = responses.filter((r) => r.url.includes('/generated/final/'));
  const bad = finals.filter((r) => r.status !== 200 || !r.contentType.startsWith('image/'));
  record(`${skinId} final asset requests all 200 image/*`, bad.length === 0, JSON.stringify(bad));
  await page.close();
}

await browser.close();

writeFileSync(`${ROOT}/issues/script-01-summary.json`, JSON.stringify(results, null, 2));
console.log('\n=== SUMMARY ===');
console.log(`PASS: ${results.pass.length}  FAIL: ${results.fail.length}`);
if (results.fail.length > 0) {
  console.log('FAILURES:');
  for (const f of results.fail) console.log(` - ${f.label}: ${f.detail}`);
  process.exitCode = 1;
}
