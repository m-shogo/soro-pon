// Batch 13 deployed-environment smoke.
// This script records only the URL passed through B13_BASE_URL. A local URL,
// Preview URL, rollback production, and current production remain distinct runs.
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const baseUrl = process.env.B13_BASE_URL?.replace(/\/+$/, '');
const scope = process.env.B13_DEPLOY_SCOPE ?? 'unspecified';
const sourceSha = process.env.B13_SOURCE_SHA ?? null;
const requireCloudflareHeaders =
  process.env.B13_EXPECT_CLOUDFLARE_HEADERS !== 'false';
const evidenceDir =
  process.env.B13_EVIDENCE_DIR ?? `docs/qa/evidence/batch-13/cloudflare/${scope}`;

if (
  !baseUrl ||
  (!/^https:\/\//.test(baseUrl) &&
    !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(baseUrl))
) {
  throw new Error('B13_BASE_URL must be an https:// URL or loopback harness URL');
}

mkdirSync(evidenceDir, { recursive: true });
const starterDeck = JSON.parse(
  readFileSync('samples/animal-starter.deck.json', 'utf8'),
);
const checks = [];
const errors = {
  console: [],
  page: [],
  failedRequests: [],
  unhandledRejections: [],
};

function record(id, ok, detail = null) {
  checks.push({ id, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}${detail ? ` :: ${detail}` : ''}`);
}

async function responseCheck() {
  const root = await fetch(`${baseUrl}/`, { redirect: 'follow' });
  const html = await root.text();
  const assetPaths = [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)].map(
    (match) => new URL(match[1], baseUrl).href,
  );
  record('root-200-html', root.status === 200 && /text\/html/.test(root.headers.get('content-type') ?? ''));
  record(
    'security-headers',
    !requireCloudflareHeaders ||
      ((root.headers.get('content-security-policy') ?? '').includes("default-src 'self'") &&
        root.headers.get('x-content-type-options') === 'nosniff' &&
        root.headers.get('x-frame-options') === 'DENY'),
    requireCloudflareHeaders ? 'required' : 'skipped for loopback harness validation',
  );
  record('asset-references', assetPaths.length >= 2, `count=${assetPaths.length}`);

  for (const assetUrl of assetPaths) {
    const response = await fetch(assetUrl);
    const contentType = response.headers.get('content-type') ?? '';
    const expectedType = assetUrl.endsWith('.js') ? /javascript/ : /text\/css/;
    record(
      `asset-${new URL(assetUrl).pathname.split('/').at(-1)}`,
      response.status === 200 &&
        expectedType.test(contentType) &&
        (!requireCloudflareHeaders ||
          /immutable/.test(response.headers.get('cache-control') ?? '')),
      `${response.status} ${contentType} ${response.headers.get('cache-control')}`,
    );
  }

  const deepLink = await fetch(`${baseUrl}/batch13-release-smoke`, {
    redirect: 'follow',
  });
  record(
    'spa-deep-link',
    deepLink.status === 200 && /text\/html/.test(deepLink.headers.get('content-type') ?? ''),
  );

  const jsAsset = assetPaths.find((path) => path.endsWith('.js'));
  if (jsAsset) {
    const sourceMap = await fetch(`${jsAsset}.map`, { redirect: 'manual' });
    record(
      'source-map-not-exposed',
      !requireCloudflareHeaders || sourceMap.status === 404,
      `status=${sourceMap.status}`,
    );
  }
}

const browser = await chromium.launch();

function observe(page) {
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text().slice(0, 300));
  });
  page.on('pageerror', (error) => errors.page.push(String(error).slice(0, 300)));
  page.on('requestfailed', (request) => {
    errors.failedRequests.push(
      `${request.url()} :: ${request.failure()?.errorText ?? 'unknown'}`.slice(0, 300),
    );
  });
}

async function playMatch(skin, playerCount) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 576 } });
  observe(page);
  await page.addInitScript(
    ({ skinId, nowMs }) => {
      Date.now = () => nowMs;
      window.localStorage.clear();
      window.localStorage.setItem('soro-pon.skin.v1', skinId);
      window.addEventListener('unhandledrejection', (event) => {
        window.__b13Rejections ??= [];
        window.__b13Rejections.push(String(event.reason).slice(0, 300));
      });
    },
    {
      skinId: skin,
      nowMs: playerCount === 3 ? 1_700_000_000_077 : 1_700_000_000_239,
    },
  );
  await page.goto(`${baseUrl}/`);
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.getByRole('button', { name: `${playerCount}人戦` }).click();
  await page.getByRole('button', { name: '対局開始' }).click();
  await page.waitForTimeout(800);

  const deadline = Date.now() + 120_000;
  let reachedResult = false;
  while (Date.now() < deadline) {
    if (await page.getByRole('heading', { name: '対戦結果' }).count()) {
      reachedResult = true;
      break;
    }
    const winAction = page.getByRole('button', { name: /^(ツモ|ロン)/ });
    if ((await winAction.count()) > 0 && (await winAction.first().isEnabled())) {
      await winAction.first().click();
      await page.waitForTimeout(200);
      continue;
    }
    const discard = page.getByRole('button', { name: /捨てる/ });
    if ((await discard.count()) > 0 && (await discard.isEnabled())) {
      await discard.click();
      await page.waitForTimeout(160);
      continue;
    }
    const tiles = page.locator('.sp-self-hand-zone .sp-tile:not([disabled])');
    if ((await tiles.count()) > 0) {
      await tiles.first().click();
      await page.waitForTimeout(100);
      continue;
    }
    await page.waitForTimeout(160);
  }

  await page.screenshot({
    path: `${evidenceDir}/result-${skin}-${playerCount}p.png`,
  });
  errors.unhandledRejections.push(
    ...(await page.evaluate(() => window.__b13Rejections ?? [])),
  );
  record(`result-${skin}-${playerCount}p`, reachedResult);
  await page.close();
}

async function importAndStorage() {
  const page = await browser.newPage({ viewport: { width: 1024, height: 576 } });
  observe(page);
  await page.goto(`${baseUrl}/`);
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: /JSONを読み込む/ }).click();
  const input = page.getByRole('textbox', { name: 'デッキJSON' });
  await input.fill('{"broken":');
  await page.getByRole('button', { name: '読み込む', exact: true }).click();
  record('invalid-import-rejected', (await page.locator('.sp-issue-list').count()) === 1);

  const before = await page.evaluate(() => localStorage.getItem('soro-pon.decks.v1'));
  await input.fill(JSON.stringify(starterDeck));
  await page.getByRole('button', { name: '読み込む', exact: true }).click();
  record(
    'same-id-review-no-write',
    before === (await page.evaluate(() => localStorage.getItem('soro-pon.decks.v1'))),
  );
  await page.getByRole('button', { name: 'やめる' }).click();
  record(
    'same-id-cancel-no-write',
    before === (await page.evaluate(() => localStorage.getItem('soro-pon.decks.v1'))),
  );

  await page.getByRole('button', { name: /JSONを読み込む/ }).click();
  await page.getByRole('textbox', { name: 'デッキJSON' }).fill(JSON.stringify(starterDeck));
  await page.getByRole('button', { name: '読み込む', exact: true }).click();
  await page.getByRole('button', { name: '上書きして読み込む' }).click();
  await page.getByRole('heading', { name: 'デッキ情報' }).waitFor();
  const afterWrite = await page.evaluate(() => localStorage.getItem('soro-pon.decks.v1'));
  record('same-id-confirm-write', afterWrite !== null);

  await page.reload();
  await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor();
  record(
    'storage-reload',
    afterWrite === (await page.evaluate(() => localStorage.getItem('soro-pon.decks.v1'))),
  );
  await page.close();
}

let fatalError = null;
try {
  await responseCheck();
  for (const skin of ['yorunoshirube', 'cute-pop']) {
    for (const playerCount of [3, 4]) {
      await playMatch(skin, playerCount);
    }
  }
  await importAndStorage();
  record('harness-completion', true);
} catch (error) {
  fatalError = String(error).slice(0, 500);
  record('harness-completion', false, fatalError);
} finally {
  await browser.close();
}

const benignFailedRequests = errors.failedRequests.filter((value) =>
  /ERR_ABORTED|cancelled|NS_BINDING_ABORTED/.test(value),
);
const nonBenignFailedRequests = errors.failedRequests.filter(
  (value) => !/ERR_ABORTED|cancelled|NS_BINDING_ABORTED/.test(value),
);
record('console-errors', errors.console.length === 0, `count=${errors.console.length}`);
record('page-errors', errors.page.length === 0, `count=${errors.page.length}`);
record(
  'unhandled-rejections',
  errors.unhandledRejections.length === 0,
  `count=${errors.unhandledRejections.length}`,
);
record(
  'non-benign-failed-requests',
  nonBenignFailedRequests.length === 0,
  `count=${nonBenignFailedRequests.length}`,
);

const summary = {
  schemaVersion: 1,
  batch: 13,
  scope,
  baseUrl,
  sourceSha,
  requireCloudflareHeaders,
  ranAtUtc: new Date().toISOString(),
  browser: 'Playwright Chromium (deployed smoke; not Safari)',
  checks,
  errorCounts: {
    console: errors.console.length,
    page: errors.page.length,
    unhandledRejections: errors.unhandledRejections.length,
    benignFailedRequests: benignFailedRequests.length,
    nonBenignFailedRequests: nonBenignFailedRequests.length,
  },
  errorSamples: {
    console: errors.console.slice(0, 10),
    page: errors.page.slice(0, 10),
    failedRequests: errors.failedRequests.slice(0, 10),
  },
  fatalError,
  pass: checks.every((check) => check.ok),
  claimScope:
    'HTTPS URL supplied through B13_BASE_URL, Cloudflare/static response checks and Playwright Chromium flows only.',
};
writeFileSync(
  `${evidenceDir}/deployed-smoke-summary.json`,
  `${JSON.stringify(summary, null, 2)}\n`,
);
console.log(`SUMMARY ${summary.pass ? 'PASS' : 'FAIL'} ${checks.filter((check) => check.ok).length}/${checks.length}`);
if (!summary.pass) process.exitCode = 1;
