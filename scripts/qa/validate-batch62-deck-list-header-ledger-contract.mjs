import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/DeckListScreen.tsx',
  css: 'src/ui/styles/deck-list-header-ledger.css',
  batch40: 'scripts/qa/validate-batch40-deck-list-loadout-strip-contract.mjs',
  visual: 'tests/visual/batch62-deck-list-header-ledger-review.spec.ts',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
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
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: forbidden ${JSON.stringify(needle)} — ${reason}`);
}

requireText(
  'app',
  "import './ui/styles/deck-list-header-ledger.css';",
  'Batch 62 screen-specific ledger override must be loaded',
);

for (const needle of [
  'className="sp-deck-select__summary"',
  '<strong>{decks.length}</strong>デッキ',
  '<strong>{readyCount}</strong>対局可',
  'className="sp-deck-select__actions"',
  'onClick={onCreate}',
  'onClick={onImport}',
  'onClick={onBack}',
  '新しいデッキ',
  'デッキを読み込む',
  'TOPへ',
  'onClick={() => onSelect(stored.deck.id)}',
]) {
  requireText('screen', needle, 'DeckList data, management actions, and deck selection semantics must remain unchanged');
}

for (const needle of [
  'Batch 62: DeckList header reads as a catalog index plus one management',
  '.sp-deck-select__header {',
  'border-radius: 2px;',
  '.sp-deck-select__summary {',
  'grid-template-columns: repeat(2, minmax(0, 1fr));',
  'gap: 0;',
  '.sp-deck-select__summary span {',
  'border-radius: 0;',
  'background: transparent;',
  '.sp-deck-select__actions {',
  'grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.35fr) minmax(0, 0.7fr);',
  '.sp-deck-select__actions .sp-button {',
  'min-height: 38px;',
  'box-shadow: none;',
  'filter: none;',
  '.sp-deck-select__actions .sp-button:first-child {',
  'border-bottom-width: 2px;',
  '@media (max-width: 899px), (max-height: 430px)',
  'width: min(310px, 45vw);',
  'grid-template-columns: repeat(3, minmax(0, 1fr));',
  'min-height: 32px;',
]) {
  requireText('css', needle, 'DeckList header must remain a flat catalog/command ledger across desktop and compact');
}
for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  forbidText('css', forbidden, 'Batch 62 must not add specificity hacks, promo effects, glass, or floating UI');
}

for (const needle of [
  "grid-auto-rows: 166px;",
  'height: 166px;',
  'min-height: 166px;',
  'max-height: 166px;',
  'minTileWidth).toBeGreaterThanOrEqual(47);',
]) {
  requireText('batch40', needle, 'Batch 40 one-deck compact loadout strip remains an independent non-regression boundary');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "expect(geometry?.summaryCount).toBe(2);",
  "expect(geometry?.actionCount).toBe(3);",
  "expect(geometry?.actionLabels).toEqual(['新しいデッキ', 'デッキを読み込む', 'TOPへ']);",
  'toBeLessThanOrEqual(2);',
  "expect(geometry?.summaryGap).toBe(0);",
  "expect(geometry?.actionGap).toBe(0);",
  "expect(geometry?.allActionShadowless).toBe(true);",
  "expect(geometry?.allActionTransparent).toBe(true);",
  'toBeGreaterThanOrEqual(2);',
  'toBeLessThanOrEqual(170);',
  'toBeGreaterThanOrEqual(47);',
  'deck-list-header-ledger-${skin}-${size.label}.png',
]) {
  requireText('visual', needle, 'Batch 62 evidence must cover both skins, both sizes, ledger geometry and Batch 40 compact non-regression');
}

requireText('visualWorkflow', 'pnpm qa:batch14:review-capture', 'canonical Batch 14 capture command must remain intact');
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch62-deck-list-header-ledger-review.spec.ts',
  'Batch 62 exact geometry proof must run in Visual Review',
);
requireText(
  'packageJson',
  '"qa:batch62:deck-list-header-ledger-contract": "node scripts/qa/validate-batch62-deck-list-header-ledger-contract.mjs"',
  'Batch 62 contract must be directly runnable',
);
requireText(
  'workflow',
  'pnpm qa:batch62:deck-list-header-ledger-contract',
  'Batch 62 contract must block CI drift',
);

if (failures.length > 0) {
  console.error('Batch 62 DeckList header ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 62 DeckList header ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
