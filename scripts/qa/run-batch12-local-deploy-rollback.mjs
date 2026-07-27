// Batch 12 supplemental-only local immutable artifact deploy/rollback rehearsal.
//
// Required:
//   B12_PREVIOUS_DIST=/absolute/path/to/previous/dist
//   B12_EXECUTION_SHA=<frozen sha>
//   B12_PREVIOUS_SHA=<known-good sha>
//
// Optional:
//   B12_CURRENT_DIST=dist
//   B12_EVIDENCE_DIR=docs/qa/evidence/batch-12/local-deploy
//
// This proves a loopback, immutable-artifact version switch. It is not staging,
// production deployment, CDN invalidation, or a deployed-artifact rollback.
import { chromium } from '@playwright/test';
import {
  cpSync,
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, extname, join, relative, resolve, sep } from 'node:path';

const currentDist = resolve(process.env.B12_CURRENT_DIST ?? 'dist');
const previousDist = process.env.B12_PREVIOUS_DIST
  ? resolve(process.env.B12_PREVIOUS_DIST)
  : null;
const evidenceDir = resolve(
  process.env.B12_EVIDENCE_DIR ?? 'docs/qa/evidence/batch-12/local-deploy',
);
const executionSha = process.env.B12_EXECUTION_SHA ?? null;
const previousSha = process.env.B12_PREVIOUS_SHA ?? null;

if (!existsSync(join(currentDist, 'index.html'))) {
  throw new Error(`current production artifact is missing index.html: ${currentDist}`);
}
if (!previousDist || !existsSync(join(previousDist, 'index.html'))) {
  throw new Error('B12_PREVIOUS_DIST must point to a previous immutable production artifact');
}
if (!executionSha || !previousSha) {
  throw new Error('B12_EXECUTION_SHA and B12_PREVIOUS_SHA are required');
}

mkdirSync(evidenceDir, { recursive: true });
const stagingRoot = mkdtempSync(join(tmpdir(), 'soro-pon-b12-local-deploy-'));
const releasesRoot = join(stagingRoot, 'releases');
mkdirSync(releasesRoot);

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function inventory(root) {
  const rows = [];
  function walk(dir) {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name);
      const stat = statSync(path);
      if (stat.isDirectory()) walk(path);
      else {
        rows.push({
          path: relative(root, path).split(sep).join('/'),
          bytes: stat.size,
          sha256: sha256File(path),
        });
      }
    }
  }
  walk(root);
  const aggregateSha256 = createHash('sha256')
    .update(rows.map((row) => `${row.sha256}  ${row.bytes}  ${row.path}\n`).join(''))
    .digest('hex');
  return {
    files: rows,
    fileCount: rows.length,
    totalBytes: rows.reduce((sum, row) => sum + row.bytes, 0),
    aggregateSha256,
  };
}

const sourceInventories = {
  current: inventory(currentDist),
  previous: inventory(previousDist),
};
const currentRelease = join(releasesRoot, sourceInventories.current.aggregateSha256);
const previousRelease = join(releasesRoot, sourceInventories.previous.aggregateSha256);
cpSync(currentDist, currentRelease, { recursive: true, errorOnExist: true });
cpSync(previousDist, previousRelease, { recursive: true, errorOnExist: true });

const copiedInventories = {
  current: inventory(currentRelease),
  previous: inventory(previousRelease),
};
for (const kind of ['current', 'previous']) {
  if (
    sourceInventories[kind].aggregateSha256 !==
    copiedInventories[kind].aggregateSha256
  ) {
    throw new Error(`${kind} artifact changed during immutable publish`);
  }
}

const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};
let active = { label: 'current', path: currentRelease, sha: executionSha };
const audit = [];
function switchRelease(label, path, sha, action) {
  active = { label, path, sha };
  audit.push({
    action,
    release: label,
    sha,
    aggregateSha256: inventory(path).aggregateSha256,
    atUtc: new Date().toISOString(),
  });
}
switchRelease('current', currentRelease, executionSha, 'deploy');

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const decoded = decodeURIComponent(url.pathname);
  const requested = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const candidate = resolve(active.path, requested);
  const inside = candidate === active.path || candidate.startsWith(`${active.path}${sep}`);
  let file = inside && existsSync(candidate) && statSync(candidate).isFile()
    ? candidate
    : null;
  if (!file && !extname(requested)) file = join(active.path, 'index.html');
  if (!file) {
    response.writeHead(404, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end('Not Found');
    return;
  }
  const isIndex = basename(file) === 'index.html';
  response.writeHead(200, {
    'Cache-Control': isIndex ? 'no-store' : 'public, max-age=31536000, immutable',
    'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
    'X-B12-Release': active.label,
    'X-B12-Sha': active.sha,
    'X-Content-Type-Options': 'nosniff',
  });
  createReadStream(file).pipe(response);
});
await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

const ANIMAL_DECK = JSON.parse(readFileSync('samples/animal-starter.deck.json', 'utf8'));
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1024, height: 600 } });

async function playMatch(page, playerCount) {
  await page.getByRole('button', { name: /まず遊ぶ/ }).click();
  await page.waitForSelector('text=対局設定');
  await page.getByRole('button', { name: `${playerCount}人戦` }).click();
  await page.getByRole('button', { name: '対局開始' }).click();
  // 下記固定seedでは人間の初手ツモが可能。自動DRAW_TILEまで待ってから
  // 操作し、turnStart中の牌を先にクリックするraceを避ける。
  await page.waitForTimeout(750);
  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    if (await page.getByRole('heading', { name: '対戦結果' }).count()) return true;
    const tsumo = page.getByRole('button', { name: 'ツモ' });
    if ((await tsumo.count()) && (await tsumo.isEnabled().catch(() => false))) {
      await tsumo.click();
      await page.waitForTimeout(200);
      continue;
    }
    const ron = page.getByRole('button', { name: 'ロン' });
    if ((await ron.count()) && (await ron.isEnabled().catch(() => false))) {
      await ron.click();
      await page.waitForTimeout(200);
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
  return false;
}

async function smoke(label, expectedSha, seedStorage) {
  const errors = { console: [], page: [], failedRequests: [] };
  function attachObservers(targetPage) {
    targetPage.on('console', (message) => {
      if (message.type() === 'error') errors.console.push(message.text().slice(0, 300));
    });
    targetPage.on('pageerror', (error) => errors.page.push(String(error).slice(0, 300)));
    targetPage.on('requestfailed', (request) => {
      errors.failedRequests.push(
        `${request.url()} :: ${request.failure()?.errorText}`.slice(0, 300),
      );
    });
  }
  let page = await context.newPage();
  attachObservers(page);
  // AppRoot newSeed(): (Date.now() % 1_000_000) * 1000 + counter。
  // 77001はanimal 3人戦の人間初手が即ツモ可能な決定seed。
  await page.addInitScript(() => {
    Date.now = () => 1_700_000_000_077;
  });
  const response = await page.goto(`${baseUrl}/deep/link`);
  const headers = response?.headers() ?? {};
  if (seedStorage) {
    await page.evaluate((deck) => {
      localStorage.clear();
      localStorage.setItem(
        'soro-pon.decks.v1',
        JSON.stringify({
          version: 1,
          decks: [{ deck, source: 'official', updatedAtMs: 1000 }],
        }),
      );
    }, ANIMAL_DECK);
  }
  await page.goto(baseUrl);
  await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor();
  const storageBefore = await page.evaluate(() => ({
    decks: JSON.parse(localStorage.getItem('soro-pon.decks.v1') ?? '{}').decks?.length ?? 0,
    records:
      JSON.parse(localStorage.getItem('soro-pon.records.v1') ?? '{}').records?.length ?? 0,
  }));
  await page.getByRole('button', { name: /きせかえ/ }).click();
  await page.getByRole('button', { name: /Cute Pop/ }).click();
  await page.getByRole('button', { name: 'とじる' }).click();
  await page.waitForSelector('html[data-skin="cute-pop"]');
  await page.getByRole('button', { name: /JSONを読み込む/ }).click();
  await page.getByRole('textbox', { name: 'デッキJSON' }).fill('{"broken":');
  await page.getByRole('button', { name: '読み込む', exact: true }).click();
  const invalidRejected = (await page.locator('.sp-issue-list').count()) > 0;
  await page.getByRole('button', { name: 'やめる' }).click();
  const result3p = await playMatch(page, 3);
  if (result3p) {
    await page.getByRole('button', { name: 'TOPへ' }).click();
    await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor();
  }
  await page.close();
  page = await context.newPage();
  attachObservers(page);
  // 新しいpageでAppRootのseed counterもリセットする。239001はanimal
  // 4人戦の人間初手が即ツモ可能な決定seed。
  await page.addInitScript(() => {
    Date.now = () => 1_700_000_000_239;
  });
  await page.goto(baseUrl);
  await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor();
  await page.getByRole('button', { name: /きせかえ/ }).click();
  await page.getByRole('button', { name: /ヨルノシルベ/ }).click();
  await page.getByRole('button', { name: 'とじる' }).click();
  await page.waitForSelector('html[data-skin="yorunoshirube"]');
  const result4p = await playMatch(page, 4);
  if (result4p) {
    await page.getByRole('button', { name: 'TOPへ' }).click();
    await page.getByRole('button', { name: /まず遊ぶ/ }).waitFor();
  }
  const storageAfter = await page.evaluate(() => ({
    decks: JSON.parse(localStorage.getItem('soro-pon.decks.v1') ?? '{}').decks?.length ?? 0,
    records:
      JSON.parse(localStorage.getItem('soro-pon.records.v1') ?? '{}').records?.length ?? 0,
  }));
  const missingResponse = await page.request.get(`${baseUrl}/missing.asset.js`);
  const aggregate = inventory(active.path).aggregateSha256;
  const failedRequestsBenign = errors.failedRequests.filter((entry) =>
    /ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i.test(entry),
  );
  const failedRequestsNonBenign = errors.failedRequests.filter(
    (entry) => !failedRequestsBenign.includes(entry),
  );
  const result = {
    label,
    expectedSha,
    releaseHeader: headers['x-b12-sha'] ?? null,
    aggregateSha256: aggregate,
    deepLinkStatus: response?.status() ?? null,
    deepLinkMime: headers['content-type'] ?? null,
    invalidImportRejected: invalidRejected,
    result3p,
    result4p,
    storageBefore,
    storageAfter,
    missingAssetStatus: missingResponse.status(),
    errors,
    failedRequestsBenign,
    failedRequestsNonBenign,
    pass:
      response?.status() === 200 &&
      headers['x-b12-sha'] === expectedSha &&
      headers['content-type']?.startsWith('text/html') &&
      invalidRejected &&
      result3p &&
      result4p &&
      storageBefore.decks > 0 &&
      storageAfter.decks > 0 &&
      storageAfter.records >= storageBefore.records &&
      missingResponse.status() === 404 &&
      errors.console.length === 0 &&
      errors.page.length === 0 &&
      failedRequestsNonBenign.length === 0,
  };
  await page.close();
  return result;
}

let summary;
try {
  const currentSmoke = await smoke('after-deploy', executionSha, true);
  switchRelease('previous', previousRelease, previousSha, 'rollback');
  const rollbackSmoke = await smoke('after-rollback', previousSha, false);
  switchRelease('current', currentRelease, executionSha, 'redeploy');
  const redeploySmoke = await smoke('after-redeploy', executionSha, false);
  summary = {
    schemaVersion: 1,
    gateIds: [
      'B12-DEPLOY-01',
      'B12-DEPLOY-SMOKE-01',
      'B12-ROLLBACK-01',
      'B12-ROLLBACK-VERIFY-01',
    ],
    ranAtUtc: new Date().toISOString(),
    environment: {
      kind: 'local immutable artifact server',
      networkBinding: '127.0.0.1',
      browser: 'Playwright Chromium',
      realDeploy: false,
    },
    releases: {
      current: { sha: executionSha, ...sourceInventories.current },
      previous: { sha: previousSha, ...sourceInventories.previous },
    },
    audit,
    smoke: [currentSmoke, rollbackSmoke, redeploySmoke],
    claimScope:
      'SUPPLEMENTAL_ONLY: loopback immutable-artifact deploy/rollback simulation and Chromium smoke. Not staging, production, CDN/cache invalidation, real Safari, or a deployed-artifact rollback.',
    explicitNonClaims: [
      'real deploy',
      'staging deploy',
      'production deploy',
      'CDN invalidation',
      'deployed-artifact rollback',
      'Safari validation',
    ],
  };
  summary.pass =
    copiedInventories.current.aggregateSha256 ===
      sourceInventories.current.aggregateSha256 &&
    copiedInventories.previous.aggregateSha256 ===
      sourceInventories.previous.aggregateSha256 &&
    summary.smoke.every((row) => row.pass);
  writeFileSync(
    join(evidenceDir, 'local-deploy-rollback-summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  writeFileSync(
    join(evidenceDir, 'artifact-manifests.json'),
    `${JSON.stringify(sourceInventories, null, 2)}\n`,
  );
  console.log(
    `${summary.pass ? 'PASS' : 'FAIL'} local immutable deploy/rollback rehearsal`,
  );
  if (!summary.pass) process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
  rmSync(stagingRoot, { recursive: true, force: true });
}
