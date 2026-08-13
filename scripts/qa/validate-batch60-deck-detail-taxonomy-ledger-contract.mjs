import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  categoryChip: 'src/ui/components/CategoryChip.tsx',
  deckDetailScreen: 'src/ui/screens/DeckDetailScreen.tsx',
  deckDetail: 'src/ui/styles/deck-detail-stage.css',
  taxonomyCss: 'src/ui/styles/deck-detail-desktop-taxonomy-ledger.css',
  visual: 'tests/visual/batch60-deck-detail-taxonomy-ledger-review.spec.ts',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
};

const files = Object.fromEntries(
  await Promise.all(Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')])),
);
const failures = [];

function requireText(fileKey, needle, reason) {
  if (!files[fileKey].includes(needle)) {
    failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
  }
}

function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) {
    failures.push(`${REQUIRED_FILES[fileKey]}: forbidden ${JSON.stringify(needle)} — ${reason}`);
  }
}

requireText(
  'app',
  "import './ui/styles/deck-detail-desktop-taxonomy-ledger.css';",
  'Batch 60 taxonomy override must load after the DeckDetail role/command ledger styles',
);

for (const needle of [
  'className="sp-category-chip"',
  'className="sp-category-chip__dot"',
  '{icon !== undefined && <span aria-hidden="true">{icon}</span>}',
  '{name}',
]) {
  requireText('categoryChip', needle, 'shared CategoryChip DOM, icon, marker, and text semantics must remain unchanged');
}

for (const needle of [
  'className="sp-deck-detail-stage__categories" aria-label="カテゴリ"',
  '{deck.categories.map((category) => (',
  '<CategoryChip',
  'name={category.name}',
  'color={category.color}',
]) {
  requireText('deckDetailScreen', needle, 'DeckDetail must continue rendering every category through the shared CategoryChip');
}

for (const needle of [
  '.sp-deck-detail-stage__categories {',
  'display: flex;',
  'flex-wrap: wrap;',
  '@media (max-width: 899px), (max-height: 430px)',
  'display: none;',
]) {
  requireText('deckDetail', needle, 'base category ownership and compact hidden behavior must remain intact');
}

for (const needle of [
  'Batch 60: desktop DeckDetail categories read as one taxonomy ledger',
  '@media (min-width: 900px) and (min-height: 431px)',
  '.sp-deck-detail-stage__categories {',
  'grid-template-columns: repeat(2, minmax(0, 1fr));',
  'gap: 0;',
  '.sp-deck-detail-stage__categories .sp-category-chip {',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  '.sp-deck-detail-stage__categories .sp-category-chip__dot {',
  'border-radius: 1px;',
]) {
  requireText('taxonomyCss', needle, 'desktop categories must render as a flat two-column taxonomy ledger without pill chrome');
}

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  forbidText('taxonomyCss', forbidden, 'Batch 60 must not add specificity hacks, decorative gradients/glass, or floating UI');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'toBeGreaterThan(0);',
  "expect(geometry?.display).toBe('none');",
  "expect(geometry?.columnCount).toBe(2);",
  "expect(geometry?.ledgerNeedsScroll).toBe(false);",
  "expect(geometry?.chipOverflow).toEqual([]);",
  'toBeLessThanOrEqual(1);',
  "expect(geometry?.allShadowless).toBe(true);",
  "expect(geometry?.allTransparent).toBe(true);",
  "expect(geometry?.allNamesVisible).toBe(true);",
  "expect(geometry?.allMarkersVisible).toBe(true);",
  'deck-detail-taxonomy-ledger-${skin}-${size.label}.png',
]) {
  requireText('visual', needle, 'Batch 60 evidence must prove both skins, preserved compact hiding, and desktop taxonomy geometry');
}

requireText('visualWorkflow', 'pnpm qa:batch14:review-capture', 'canonical Batch 14 review capture must remain intact');
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch60-deck-detail-taxonomy-ledger-review.spec.ts',
  'Batch 60 geometry proof must run in the Visual Review workflow without mutating the canonical capture command',
);
requireText(
  'packageJson',
  '"qa:batch60:deck-detail-taxonomy-ledger-contract": "node scripts/qa/validate-batch60-deck-detail-taxonomy-ledger-contract.mjs"',
  'Batch 60 contract must be runnable',
);
requireText(
  'workflow',
  'pnpm qa:batch60:deck-detail-taxonomy-ledger-contract',
  'Batch 60 contract must block CI drift',
);

if (failures.length > 0) {
  console.error('Batch 60 DeckDetail taxonomy ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 60 DeckDetail taxonomy ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
