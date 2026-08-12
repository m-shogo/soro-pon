import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/CollectionScreen.tsx',
  css: 'src/ui/styles/collection-empty-score-ledger.css',
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

requireText('app', "import './ui/styles/collection-empty-score-ledger.css';", 'Batch 53 compact empty-ledger override must be loaded');

for (const needle of [
  'const hasTopResults = topResults.length > 0;',
  "className={`sp-collection-scoreboard${hasTopResults ? '' : ' sp-collection-scoreboard--empty'}`}",
  '{hasTopResults ? (',
  '<ol className="sp-collection-ranking">',
  '<p className="sp-collection-empty">勝利記録はまだありません。</p>',
]) requireText('screen', needle, 'empty-state class must be explicit while records-present ranking stays on the existing branch');

for (const needle of [
  'Batch 53: an empty high-score panel is status, not content',
  '.sp-collection-scoreboard--empty {',
  'min-height: 34px;',
  'height: 34px;',
  'grid-template-columns: auto minmax(0, 1fr);',
  'border-radius: 2px;',
  'box-shadow: none;',
  '.sp-collection-scoreboard--empty .sp-paper-panel__title {',
  '.sp-collection-scoreboard--empty .sp-collection-empty {',
]) requireText('css', needle, 'compact empty scoreboard must collapse to one quiet ledger row');

if (files.css.includes('.sp-collection-scoreboard {')) {
  failures.push(`${REQUIRED_FILES.css}: records-present scoreboard must not receive generic Batch 53 styling`);
}
for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:']) {
  if (files.css.includes(forbidden)) failures.push(`${REQUIRED_FILES.css}: forbidden ${JSON.stringify(forbidden)} in Batch 53 styling`);
}

for (const needle of [
  'emptyScoreboardHeight',
  'emptyScoreboardNeedsScroll',
  'emptyMessageVisible',
  'clearCellCount',
  'clearBoardColumnCount',
  'expect(geometry?.emptyScoreboardHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(38);',
  'expect(geometry?.emptyScoreboardNeedsScroll).toBe(false);',
  'expect(geometry?.emptyMessageVisible).toBe(true);',
  'expect(geometry?.clearCellCount).toBe(25);',
  'expect(geometry?.clearBoardColumnCount).toBe(5);',
]) requireText('visual', needle, 'canonical Collection evidence must prove compact collapse without damaging the clear board');

requireText('packageJson', '"qa:batch53:collection-empty-score-ledger-contract": "node scripts/qa/validate-batch53-collection-empty-score-ledger-contract.mjs"', 'Batch 53 contract must be runnable');
requireText('workflow', 'pnpm qa:batch53:collection-empty-score-ledger-contract', 'Batch 53 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 53 Collection empty score ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 53 Collection empty score ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
