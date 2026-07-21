// Gate 6 QA: accessibility acceptance beyond Batch 5's keyboard/focus checks.
// Semantic/programmatic DOM inspection only (axe-like checks written by hand,
// no axe-core dependency added). Real VoiceOver/NVDA/JAWS were NOT used —
// see the Gate 6 report for why, and do not claim "screen reader verified".
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const BASE = 'http://localhost:5199';
const ROOT = 'docs/qa/evidence/batch-6/accessibility';
mkdirSync(ROOT, { recursive: true });

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf-8'));
const results = { pass: [], fail: [] };
function record(label, ok, detail) {
  const entry = { label, ok, detail: detail ?? null };
  (ok ? results.pass : results.fail).push(entry);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ' :: ' + detail : ''}`);
}

async function seed(page, skin) {
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
  await page.goto(`${BASE}/`);
  await page.waitForSelector(`html[data-skin="${skin}"]`);
}

const browser = await chromium.launch();

for (const skin of ['yorunoshirube', 'cute-pop']) {
  // --- Heading hierarchy + landmarks on TOP ---
  {
    const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
    await seed(page, skin);
    const headings = await page.evaluate(() =>
      [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
        tag: h.tagName,
        text: h.textContent?.trim().slice(0, 30),
      })),
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

  // --- Modal dialog semantics + live region for Toast ---
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

  // --- Deck import validation: textarea has a programmatic label, errors are associated ---
  {
    const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
    await seed(page, skin);
    await page.getByRole('button', { name: 'JSONを読み込む' }).click();
    await page.waitForSelector('text=デッキJSONを読み込む');
    const textareaLabelled = await page.evaluate(() => {
      const ta = document.querySelector('textarea');
      if (!ta) return null;
      const ariaLabel = ta.getAttribute('aria-label');
      const labelledby = ta.getAttribute('aria-labelledby');
      const id = ta.getAttribute('id');
      const wrappedInLabel = ta.closest('label') !== null;
      const labelFor = id ? document.querySelector(`label[for="${id}"]`) !== null : false;
      return { ariaLabel: ariaLabel ?? null, labelledby: !!labelledby, wrappedInLabel, labelFor };
    });
    record(
      `${skin} import textarea has a programmatic label (aria-label/label[for]/wrapping/aria-labelledby)`,
      !!textareaLabelled &&
        (!!textareaLabelled.ariaLabel || textareaLabelled.wrappedInLabel || textareaLabelled.labelFor || textareaLabelled.labelledby),
      JSON.stringify(textareaLabelled),
    );
    await page.locator('textarea').fill('not valid json');
    await page.getByRole('button', { name: '読み込む', exact: true }).click();
    await page.waitForTimeout(200);
    const errorAnnounced = await page.evaluate(() => {
      const list = document.querySelector('.sp-issue-list');
      if (!list) return { found: false };
      const liveRegionAncestor = list.closest('[role="status"],[role="alert"],[aria-live]');
      return { found: true, hasLiveRegionAncestor: !!liveRegionAncestor, text: list.textContent?.slice(0, 60) };
    });
    // Note: this project intentionally lists rejected-import reasons as a static
    // <ul class="sp-issue-list"> without an aria-live wrapper. We record this as
    // a P2/P3 observation, not a P0/P1 — the message is visible and readable, just
    // not proactively announced to a screen reader without focus moving to it.
    record(
      `${skin} import rejection reasons are visible in the DOM (live-region announcement not implemented — recorded as improvement candidate, not a blocker)`,
      errorAnnounced.found,
      JSON.stringify(errorAnnounced),
    );
    await page.close();
  }

  // --- Game-specific UI: hand tile accessible names, disabled/selected/current state ---
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
      const disabledTiles = tiles.filter((t) => t.hasAttribute('disabled'));
      const pressedTiles = tiles.filter((t) => t.getAttribute('aria-pressed') !== null);
      return { total: tiles.length, withName: withName.length, disabled: disabledTiles.length, withAriaPressed: pressedTiles.length };
    });
    record(`${skin} Match: every rendered tile has a readable accessible name`, tileInfo.total > 0 && tileInfo.withName === tileInfo.total, JSON.stringify(tileInfo));
    record(`${skin} Match: hand tiles expose aria-pressed for selected state (not color-only)`, tileInfo.withAriaPressed > 0, JSON.stringify(tileInfo));
    await page.screenshot({ path: `${ROOT}/${skin}-match-tiles.png` });
    await page.close();
  }
}

// --- Zoom 200% spot check (both skins, TOP + MatchSetup) ---
for (const skin of ['yorunoshirube', 'cute-pop']) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 }, deviceScaleFactor: 1 });
  await seed(page, skin);
  // Playwright doesn't expose browser UI zoom directly; emulate 200% zoom via CSS transform
  // on the viewport is not equivalent to real browser zoom, so instead we halve the CSS
  // viewport (512x300) which is the effective layout viewport size in a 200%-zoomed 1024x600
  // window. This validates the layout doesn't clip/overlap at that effective width, which is
  // the layout-relevant part of "zoom 200%" (text re-flow itself is handled by the browser's
  // zoom pipeline, which Playwright's controlled viewport approach approximates for our
  // fixed-font-size layout).
  await page.setViewportSize({ width: 512, height: 300 });
  await page.waitForTimeout(200);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  await page.screenshot({ path: `${ROOT}/${skin}-zoom200-equivalent-top.png` });
  record(`${skin} TOP: no horizontal overflow at 200%-zoom-equivalent viewport (512x300)`, !overflow);
  await page.close();
}

// --- Reduced motion: verify the app doesn't rely on motion-only cues (Playwright already forces reduced-motion in visual suite; spot-check here too) ---
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
  record('reduced-motion: match screen still renders full content (no reliance on animation to reveal UI)', bodyText.includes('対局'), bodyText.slice(0, 60));
  record('reduced-motion: no console errors', consoleErrs.length === 0, JSON.stringify(consoleErrs));
  await page.close();
}

await browser.close();
writeFileSync(`${ROOT}/gate6-accessibility-summary.json`, JSON.stringify(results, null, 2));
console.log('\n=== SUMMARY ===');
console.log(`PASS: ${results.pass.length}  FAIL: ${results.fail.length}`);
if (results.fail.length > 0) {
  console.log('FAILURES:');
  for (const f of results.fail) console.log(` - ${f.label}: ${f.detail}`);
  process.exitCode = 1;
}
