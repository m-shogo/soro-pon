// Gate 6 QA: migration salvage + quota-exceeded write-failure UX, verified in a real browser.
// 使い方: dev server(5199)起動中に node scripts/gate6-qa-01-migration-storage-recovery.mjs
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const BASE = 'http://localhost:5199';
const ROOT = 'docs/qa/evidence/batch-6';
mkdirSync(`${ROOT}/migration`, { recursive: true });
mkdirSync(`${ROOT}/storage-recovery`, { recursive: true });

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));
const results = { pass: [], fail: [] };
function record(label, ok, detail) {
  const entry = { label, ok, detail: detail ?? null };
  (ok ? results.pass : results.fail).push(entry);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ' :: ' + detail : ''}`);
}

const browser = await chromium.launch();

// 1) Partial deck-store corruption: one bad entry alongside the official starter should not wipe both.
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await page.goto(`${BASE}/`);
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
            { deck: { totally: 'broken' }, source: 'created', updatedAtMs: 2000 },
          ],
        }),
      );
    },
    { deck: ANIMAL_DECK },
  );
  await page.goto(`${BASE}/`);
  await page.waitForSelector('text=まず遊ぶ');
  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.waitForTimeout(300);
  const cardCount = await page.locator('.sp-deck-card').count();
  await page.screenshot({ path: `${ROOT}/migration/partial-salvage-deck-list.png` });
  record('partial deck-store corruption keeps the healthy deck (not wiped to 0)', cardCount === 1, `cardCount=${cardCount}`);
  const toastText = await page.locator('.sp-toast').innerText().catch(() => '');
  record('salvage warning toast is visible and readable', toastText.length > 0, toastText.slice(0, 80));
  await page.close();
}

// 2) Quota-exceeded on deck save: verify a Toast appears and the editor stays open (draft not lost).
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await page.goto(`${BASE}/`);
  await page.evaluate(
    ({ deck }) => {
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', 'yorunoshirube');
      window.localStorage.setItem(
        'soro-pon.decks.v1',
        JSON.stringify({ version: 1, decks: [{ deck, source: 'official', updatedAtMs: 1000 }] }),
      );
    },
    { deck: ANIMAL_DECK },
  );
  await page.goto(`${BASE}/`);
  await page.waitForSelector('text=まず遊ぶ');

  // Monkey-patch localStorage.setItem to throw QuotaExceededError for the decks key only.
  await page.evaluate(() => {
    const orig = window.localStorage.setItem.bind(window.localStorage);
    window.localStorage.setItem = (key, value) => {
      if (key === 'soro-pon.decks.v1') {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      }
      return orig(key, value);
    };
  });

  await page.getByRole('button', { name: 'デッキ一覧' }).click();
  await page.waitForTimeout(200);
  await page.locator('.sp-deck-card').first().click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: '編集' }).click();
  await page.waitForTimeout(300);
  // make a small dirty change: add a category
  const catTab = page.getByRole('tab', { name: /カテゴリ/ });
  await catTab.click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'カテゴリを追加' }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: '保存する' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${ROOT}/storage-recovery/quota-exceeded-save.png` });

  const stillInEditor = (await page.getByRole('button', { name: '保存する' }).count()) > 0;
  record('editor stays open after a failed (quota-exceeded) save (draft not lost)', stillInEditor);
  const toastText = await page.locator('.sp-toast').innerText().catch(() => '');
  const hasCleanMessage = toastText.includes('保存に失敗') && !toastText.includes('QuotaExceededError') && !toastText.includes('DOMException');
  record('quota-exceeded shows a clear, non-technical Japanese message', hasCleanMessage, toastText.slice(0, 120));

  await page.close();
}

// 3) Invalid skin ID still recovers safely alongside the new migration logic (regression check).
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await page.goto(`${BASE}/`);
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('soro-pon.skin.v1', 'not-a-real-skin');
  });
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(400);
  const dataSkin = await page.evaluate(() => document.documentElement.getAttribute('data-skin'));
  const okTop = await page.waitForSelector('text=まず遊ぶ', { timeout: 5000 }).then(() => true).catch(() => false);
  record('invalid skin ID still recovers to a valid built-in skin', okTop && (dataSkin === 'yorunoshirube' || dataSkin === 'cute-pop'), `data-skin=${dataSkin}`);
  await page.close();
}

await browser.close();

writeFileSync(`${ROOT}/gate6-script-01-summary.json`, JSON.stringify(results, null, 2));
console.log('\n=== SUMMARY ===');
console.log(`PASS: ${results.pass.length}  FAIL: ${results.fail.length}`);
if (results.fail.length > 0) {
  console.log('FAILURES:');
  for (const f of results.fail) console.log(` - ${f.label}: ${f.detail}`);
  process.exitCode = 1;
}
