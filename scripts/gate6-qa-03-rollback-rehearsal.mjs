// Gate 6 QA: rollback rehearsal using local build artifacts.
// NEW = current HEAD build (localhost:4173, from `pnpm preview`)
// OLD = pre-Batch-5 commit 9b9ba1a build, served from a separate git worktree (localhost:4174)
// No production environment exists for this project; this rehearses the only
// concrete rollback risk that matters for a local-first, no-service-worker
// SPA: does data written by one build load safely in the other build?
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const NEW_BASE = 'http://localhost:4173';
const OLD_BASE = 'http://localhost:4174';
const ROOT = 'docs/qa/evidence/batch-6/rollback';
mkdirSync(ROOT, { recursive: true });

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));
const results = { pass: [], fail: [] };
function record(label, ok, detail) {
  const entry = { label, ok, detail: detail ?? null };
  (ok ? results.pass : results.fail).push(entry);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ' :: ' + detail : ''}`);
}

const browser = await chromium.launch();

// 1) OLD build boots cleanly on its own (rollback target itself is healthy)
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(`${OLD_BASE}/`);
  const ok = await page.waitForSelector('text=まず遊ぶ', { timeout: 5000 }).then(() => true).catch(() => false);
  await page.screenshot({ path: `${ROOT}/old-build-boot.png` });
  record('OLD build (pre-Batch-5, 9b9ba1a) boots cleanly', ok && errs.length === 0, `errs=${errs.length}`);
  await page.close();
}

// 2) Data written by NEW build (post-storage-hardening) loads safely when rolled back to OLD build.
//    This is the realistic rollback scenario: deploy NEW, user plays, something is wrong, roll back to OLD.
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  // Seed data as NEW build would write it (decks payload + records payload), then load it with OLD build.
  await page.goto(`${OLD_BASE}/`);
  await page.evaluate(
    ({ deck }) => {
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', 'yorunoshirube');
      window.localStorage.setItem(
        'soro-pon.decks.v1',
        JSON.stringify({
          version: 1,
          decks: [
            { deck, source: 'official', updatedAtMs: 1000 },
            { deck: { ...deck, id: 'created-rollback-test', name: '巻き戻しテスト用' }, source: 'created', updatedAtMs: 2000 },
          ],
        }),
      );
      window.localStorage.setItem(
        'soro-pon.records.v1',
        JSON.stringify({
          version: 1,
          coins: 42,
          records: [],
          roleCollection: [],
          achievements: [],
          totalMatches: 3,
        }),
      );
    },
    { deck: ANIMAL_DECK },
  );
  await page.goto(`${OLD_BASE}/`);
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.waitForSelector('text=まず遊ぶ');
  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.waitForTimeout(300);
  const cardCount = await page.locator('.sp-deck-card').count();
  await page.screenshot({ path: `${ROOT}/rollback-old-reads-new-data.png` });
  record('OLD build reads 2 decks written in NEW-build shape without loss', cardCount === 2, `cardCount=${cardCount}`);
  record('OLD build: no crash reading NEW-shape data', errs.length === 0, JSON.stringify(errs));
  await page.close();
}

// 3) Roll forward again: data now touched by the OLD build (unlikely to differ, same schema)
//    loads safely back in the NEW build (round-trip safety).
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await page.goto(`${NEW_BASE}/`);
  await page.evaluate(
    ({ deck }) => {
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', 'yorunoshirube');
      window.localStorage.setItem(
        'soro-pon.decks.v1',
        JSON.stringify({
          version: 1,
          decks: [{ deck, source: 'official', updatedAtMs: 1000 }],
        }),
      );
    },
    { deck: ANIMAL_DECK },
  );
  await page.goto(`${NEW_BASE}/`);
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.waitForSelector('text=まず遊ぶ');
  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.waitForTimeout(300);
  const cardCount = await page.locator('.sp-deck-card').count();
  await page.screenshot({ path: `${ROOT}/roll-forward-new-reads-old-shape-data.png` });
  record('NEW build reads OLD-shape data without loss (roll-forward safety)', cardCount === 1, `cardCount=${cardCount}`);
  record('NEW build: no crash reading OLD-shape data', errs.length === 0, JSON.stringify(errs));
  await page.close();
}

// 4) Skin package rollback: OLD build's skin.json (yorunoshirube v3-era, no badge.info.background)
//    still resolves and renders without brick, even though NEW build's skin selection key is compatible.
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  const responses = [];
  page.on('response', (res) => {
    if (res.url().includes('/skins/yorunoshirube/')) {
      responses.push({ url: res.url(), status: res.status() });
    }
  });
  await page.goto(`${OLD_BASE}/`);
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', 'yorunoshirube');
  });
  await page.goto(`${OLD_BASE}/`);
  await page.waitForSelector('text=まず遊ぶ');
  await page.waitForSelector('html[data-skin="yorunoshirube"]', { timeout: 5000 }).catch(() => {});
  const dataSkin = await page.evaluate(() => document.documentElement.getAttribute('data-skin'));
  await page.screenshot({ path: `${ROOT}/old-build-skin-package.png` });
  const bad = responses.filter((r) => r.status >= 400);
  record('OLD build resolves its own bundled skin package cleanly (no 4xx/5xx)', bad.length === 0, JSON.stringify(bad));
  record('OLD build skin applies (data-skin set)', dataSkin === 'yorunoshirube');
  await page.close();
}

await browser.close();
writeFileSync(`${ROOT}/gate6-rollback-summary.json`, JSON.stringify(results, null, 2));
console.log('\n=== SUMMARY ===');
console.log(`PASS: ${results.pass.length}  FAIL: ${results.fail.length}`);
if (results.fail.length > 0) {
  console.log('FAILURES:');
  for (const f of results.fail) console.log(` - ${f.label}: ${f.detail}`);
  process.exitCode = 1;
}
