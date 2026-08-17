import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  inspector: 'src/ui/components/DeckEditorInspector.tsx',
  batch54Css: 'src/ui/styles/deck-editor-compact-inspector-rail.css',
  css: 'src/ui/styles/deck-editor-readable-inspector-ledger.css',
  visual: 'tests/visual/batch68-deck-editor-readable-inspector-ledger-review.spec.ts',
  batch54Visual: 'tests/visual/batch54-deck-editor-inspector-rail-review.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
};

const files = Object.fromEntries(
  await Promise.all(Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')])),
);
const failures = [];
const requireText = (key, needle, reason) => {
  if (!files[key].includes(needle)) failures.push(`${REQUIRED_FILES[key]}: missing ${JSON.stringify(needle)} — ${reason}`);
};
const forbidText = (key, needle, reason) => {
  if (files[key].includes(needle)) failures.push(`${REQUIRED_FILES[key]}: forbidden ${JSON.stringify(needle)} — ${reason}`);
};

requireText('app', "import './ui/styles/deck-editor-compact-inspector-rail.css';", 'Batch 54 rail remains canonical');
requireText('app', "import './ui/styles/deck-editor-readable-inspector-ledger.css';", 'Batch 68 readable override must load after Batch 54');

for (const needle of [
  'const shouldOpenValidation = validation.status === \'blocked\' || errorCount > 0;',
  'aria-label="編集中デッキの構成"',
  'aria-label="検証問題の内訳"',
  '<ValidationIssueList issues={validation.issues} emptyMessage="問題なし。" />',
]) requireText('inspector', needle, 'inspector data and validation semantics stay unchanged');

for (const needle of [
  'grid-template-rows: minmax(0, 1fr) 54px;',
  'height: 54px;',
  'max-height: 54px;',
]) requireText('batch54Css', needle, 'Batch 68 must not grow the compact workbench rail');

for (const needle of [
  'Batch 68: compact DeckEditor inspector keeps the Batch 54 shallow rail',
  '@media (max-width: 899px), (max-height: 430px)',
  'grid-template-columns: auto auto minmax(0, 1fr) minmax(96px, 124px);',
  'grid-template-rows: repeat(2, minmax(0, 1fr));',
  'display: contents;',
  'grid-column: 1 / 4;',
  'grid-row: 2;',
  'grid-column: 4;',
  'grid-row: 1 / 3;',
  'font-size: 9px;',
  'font-size: 11px;',
  'min-height: 24px;',
]) requireText('css', needle, 'compact inspector must become a two-row readable ledger without changing height');
for (const forbidden of [
  'font-size: 7px;',
  'font-size: 8px;',
  '!important',
  'linear-gradient(',
  'radial-gradient(',
  'backdrop-filter:',
  'position: fixed',
  "data-skin='cute-pop'",
  "data-skin='yorunoshirube'",
]) forbidText('css', forbidden, 'Batch 68 stays readable, skin-neutral, and free of specificity/decorative escape hatches');

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "const STATES = ['clean', 'warning', 'blocked'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "page.getByRole('button', { name: 'この役を削除' })",
  "expect(geometry?.normalFontMin ?? 0).toBeGreaterThanOrEqual(9);",
  "expect(geometry?.majorFontMin ?? 0).toBeGreaterThanOrEqual(11);",
  "expect(geometry?.validationSummaryHeight ?? 0).toBeGreaterThanOrEqual(24);",
  "expect(geometry?.sideHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(58);",
  "expect(geometry?.panelDisplay).not.toBe('contents');",
  'deck-editor-readable-inspector-${skin}-${state}-${size.label}.png',
]) requireText('visual', needle, 'visual proof must cover readable compact state hierarchy and desktop non-regression');

for (const needle of [
  'const TABS = [',
  "{ name: /^基本/, id: 'basic' }",
  "{ name: /^カテゴリ/, id: 'categories' }",
  "{ name: /^牌/, id: 'tiles' }",
  "{ name: /^役/, id: 'roles' }",
  "{ name: /^ボーナス/, id: 'bonuses' }",
  'expect(geometry?.summaryVisibleCount).toBe(4);',
  'expect(geometry?.issueVisibleCount).toBe(3);',
]) requireText('batch54Visual', needle, 'Batch 54 remains the five-tab geometry regression proof');

requireText('packageJson', '"qa:batch68:deck-editor-readable-inspector-ledger-contract": "node scripts/qa/validate-batch68-deck-editor-readable-inspector-ledger-contract.mjs"', 'Batch 68 contract must be directly runnable');
requireText('workflow', 'pnpm qa:batch68:deck-editor-readable-inspector-ledger-contract', 'Batch 68 contract must block CI drift');
requireText('visualWorkflow', '- name: Verify Batch 68 DeckEditor readable inspector ledger', 'Batch 68 gets a named visual step');
requireText('visualWorkflow', 'pnpm exec playwright test tests/visual/batch68-deck-editor-readable-inspector-ledger-review.spec.ts', 'stateful visual proof runs before artifact upload');

if (failures.length > 0) {
  console.error('Batch 68 DeckEditor readable inspector ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 68 DeckEditor readable inspector ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
