import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  screen: 'src/ui/screens/CollectionScreen.tsx',
  css: 'src/ui/styles/collection-ledger-stage.css',
  visual: 'tests/visual/batch22-collection-review.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
};

const files = Object.fromEntries(
  await Promise.all(Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')])),
);
const failures = [];

function requireText(fileKey, needle, reason) {
  if (!files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
}
function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: found forbidden ${JSON.stringify(needle)} — ${reason}`);
}

for (const needle of [
  'title="高得点 Top 10"',
  'title="クリアボード"',
  'title={`あがった役 ${collectedRoles.length}`}',
  'title="最近の記録"',
  'records.records.slice(0, 12).map',
  'onClick={onBack}',
]) {
  requireText('screen', needle, 'Batch 41 must preserve collection data and navigation semantics');
}

for (const needle of [
  '@layer screens',
  'grid-template-columns: minmax(0, 1fr);',
  'grid-template-rows: minmax(0, 1fr) auto;',
  '.sp-collection-screen__main {',
  'width: 100%;',
  '.sp-collection-screen__recent {',
  'max-height: 58px;',
  'border-top: 1px solid color-mix(in srgb, var(--sp-color-cream) 8%, transparent);',
  'border-left: 0;',
  'grid-template-columns: auto minmax(0, 1fr);',
  '.sp-collection-screen__recent .sp-collection-recent-list {',
  'display: flex;',
  'overscroll-behavior-inline: contain;',
]) {
  requireText('css', needle, 'compact chronology must stay a low bottom rail while the collection ledger owns full width');
}
for (const forbidden of ['width: min(190px, 24%);', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed', '!important']) {
  forbidText('css', forbidden, 'Batch 41 must not restore the compact right rail or generic web decoration/escape hatches');
}

for (const needle of [
  'async function expectCompactCollectionGeometry',
  '(geometry?.mainWidth ?? 0) / (geometry?.bodyWidth ?? 1)',
  '(geometry?.recentWidth ?? 0) / (geometry?.bodyWidth ?? 1)',
  'toBeGreaterThanOrEqual(0.95)',
  'toBeLessThanOrEqual(64)',
  'recentBelowMain',
  "if (size.label === 'compact') await expectCompactCollectionGeometry(page);",
  'collection-${skin}-${size.label}',
]) {
  requireText('visual', needle, 'Batch 41 must be protected by measured current-head collection geometry');
}

requireText('packageJson', '"qa:batch41:collection-bottom-rail-contract": "node scripts/qa/validate-batch41-collection-bottom-rail-contract.mjs"', 'Batch 41 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch41:collection-bottom-rail-contract', 'Batch 41 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 41 compact collection bottom rail contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 41 compact collection bottom rail contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
