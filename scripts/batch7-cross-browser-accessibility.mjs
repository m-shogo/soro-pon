// Batch 7: accessibility automation extended to Firefox and Playwright
// WebKit (NOT real Safari). Same semantic/programmatic DOM inspection
// approach as Gate 6's scripts/gate6-qa-04-accessibility-acceptance.mjs
// (parameterized by engine), not a new methodology.
//
// Usage: dev server (5199) running, then:
//   node scripts/batch7-cross-browser-accessibility.mjs firefox
//   node scripts/batch7-cross-browser-accessibility.mjs webkit
import { chromium, firefox, webkit } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const ENGINE = process.argv[2];
if (!['firefox', 'webkit'].includes(ENGINE)) {
  console.error('usage: node scripts/batch7-cross-browser-accessibility.mjs <firefox|webkit>');
  process.exit(1);
}
const LAUNCHERS = { chromium, firefox, webkit };
const launch = LAUNCHERS[ENGINE];

const BASE = 'http://localhost:5199';
const ROOT = `docs/qa/evidence/batch-7/${ENGINE}/accessibility`;
mkdirSync(ROOT, { recursive: true });

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));
const results = { pass: [], fail: [] };
function record(label, ok, detail) {
  const entry = { label, ok, detail: detail ?? null };
  (ok ? results.pass : results.fail).push(entry);
  console.log(`[${ENGINE}] ${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ' :: ' + detail : ''}`);
}

async function seed(page, skin) {
  await page.addInitScript(
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
  await page.goto(`${BASE}/`);
  await page.waitForSelector(`html[data-skin="${skin}"]`);
}

const browser = await launch.launch();

for (const skin of ['yorunoshirube', 'cute-pop']) {
  {
    const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
    await seed(page, skin);
    const headings = await page.evaluate(() =>
      [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({ tag: h.tagName, text: h.textContent?.trim().slice(0, 30) })),
    );
    record(`${skin} TOP: exactly one h1`, headings.filter((h) => h.tag === 'H1').length === 1, JSON.stringify(headings));

    const buttonsWithoutName = await page.evaluate(() =>
      [...document.querySelectorAll('button')].filter((b) => {
        const name = b.getAttribute('aria-label') ?? b.textContent?.trim();
        return !name || name.length === 0;
      }).length,
    );
    record(`${skin} TOP: every button has an accessible name`, buttonsWithoutName === 0, `unnamed=${buttonsWithoutName}`);
    await page.close();
  }

  {
    const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
    await seed(page, skin);
    await page.getByRole('button', { name: /きせかえ/ }).click();
    await page.waitForTimeout(150);
    const dialog = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return d
        ? {
            hasAriaModal: d.getAttribute('aria-modal') === 'true',
            hasLabelledby: !!d.getAttribute('aria-labelledby'),
            labelResolves: !!document.getElementById(d.getAttribute('aria-labelledby') ?? ''),
          }
        : null;
    });
    record(`${skin} きせかえ modal: role=dialog with aria-modal + resolvable aria-labelledby`, !!dialog && dialog.hasAriaModal && dialog.hasLabelledby && dialog.labelResolves, JSON.stringify(dialog));
    await page.close();
  }

  {
    const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
    await seed(page, skin);
    await page.getByRole('button', { name: 'JSONを読み込む' }).click();
    await page.waitForSelector('text=デッキJSONを読み込む');
    const textareaLabelled = await page.evaluate(() => {
      const ta = document.querySelector('textarea');
      if (!ta) return null;
      return { ariaLabel: ta.getAttribute('aria-label') ?? null };
    });
    record(`${skin} import textarea has aria-label`, !!textareaLabelled?.ariaLabel, JSON.stringify(textareaLabelled));

    await page.locator('textarea').fill('not valid json');
    await page.getByRole('button', { name: '読み込む', exact: true }).click();
    await page.waitForTimeout(200);
    const errorAnnounced = await page.evaluate(() => {
      const list = document.querySelector('.sp-issue-list');
      if (!list) return { found: false };
      const liveRegionAncestor = list.closest('[role="status"],[role="alert"],[aria-live]');
      return { found: true, hasLiveRegionAncestor: !!liveRegionAncestor, text: list.textContent?.slice(0, 60) };
    });
    record(`${skin} import rejection reasons visible + live-region wrapped`, errorAnnounced.found && errorAnnounced.hasLiveRegionAncestor, JSON.stringify(errorAnnounced));
    await page.close();
  }

  {
    const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
    await seed(page, skin);
    await page.getByRole('button', { name: /まず遊ぶ/ }).click();
    await page.waitForSelector('text=対局開始');
    await page.getByRole('button', { name: '対局開始' }).click();
    await page.waitForTimeout(600);
    const tileInfo = await page.evaluate(() => {
      const tiles = [...document.querySelectorAll('.sp-tile')];
      const withName = tiles.filter((t) => (t.getAttribute('aria-label') ?? t.textContent ?? '').trim().length > 0);
      const pressedTiles = tiles.filter((t) => t.getAttribute('aria-pressed') !== null);
      return { total: tiles.length, withName: withName.length, withAriaPressed: pressedTiles.length };
    });
    record(`${skin} Match: every tile has an accessible name`, tileInfo.total > 0 && tileInfo.withName === tileInfo.total, JSON.stringify(tileInfo));
    record(`${skin} Match: tiles expose aria-pressed`, tileInfo.withAriaPressed > 0, JSON.stringify(tileInfo));
    await page.screenshot({ path: `${ROOT}/${skin}-match-tiles.png` });
    await page.close();
  }
}

// Keyboard: Tab/Enter/Escape on TOP + modal
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seed(page, 'yorunoshirube');
  await page.keyboard.press('Tab');
  const firstFocused = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 20));
  record('keyboard: Tab moves focus on TOP', !!firstFocused, firstFocused);

  const kisekae = page.getByRole('button', { name: /きせかえ/ });
  await kisekae.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const dialogOpened = (await page.getByRole('dialog').count()) > 0;
  record('keyboard: Enter opens きせかえ dialog', dialogOpened);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const dialogClosed = (await page.getByRole('dialog').count()) === 0;
  const focusReturned = await page.evaluate(() => document.activeElement?.textContent?.includes('きせかえ'));
  record('keyboard: Escape closes dialog and returns focus', dialogClosed && !!focusReturned);
  await page.close();
}

// 200%-zoom-equivalent viewport
for (const skin of ['yorunoshirube', 'cute-pop']) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await seed(page, skin);
  await page.setViewportSize({ width: 512, height: 300 });
  await page.waitForTimeout(200);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  await page.screenshot({ path: `${ROOT}/${skin}-zoom200-equivalent-top.png` });
  record(`${skin} TOP: no horizontal overflow at 200%-zoom-equivalent viewport`, !overflow);
  await page.close();
}

// Reduced motion
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 }, reducedMotion: 'reduce' });
  await seed(page, 'yorunoshirube');
  const consoleErrs = [];
  page.on('pageerror', (e) => consoleErrs.push(String(e)));
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.waitForSelector('text=対局開始');
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(600);
  const bodyText = await page.evaluate(() => document.body.innerText);
  record('reduced-motion: match screen renders full content', bodyText.includes('対局'), bodyText.slice(0, 60));
  record('reduced-motion: no console errors', consoleErrs.length === 0, JSON.stringify(consoleErrs));
  await page.close();
}

await browser.close();
writeFileSync(`${ROOT}/gate7-${ENGINE}-accessibility-summary.json`, JSON.stringify(results, null, 2));
console.log(`\n=== ${ENGINE.toUpperCase()} ACCESSIBILITY SUMMARY ===`);
console.log(`PASS: ${results.pass.length}  FAIL: ${results.fail.length}`);
if (results.fail.length > 0) {
  console.log('FAILURES:');
  for (const f of results.fail) console.log(` - ${f.label}: ${f.detail}`);
  process.exitCode = 1;
}
