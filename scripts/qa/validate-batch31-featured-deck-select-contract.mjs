import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  screen: 'src/ui/screens/DeckListScreen.tsx',
  css: 'src/ui/styles/deck-browser-authored-workspace.css',
  visual: 'tests/visual/batch14-review-capture.spec.ts',
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
  'data-deck-count={decks.length}',
  'aria-label="デッキのロードアウト一覧"',
  'onClick={() => onSelect(stored.deck.id)}',
  'variant={decks.length === 0 ? \'primary\' : \'ink\'}',
  'onClick={onCreate}',
  'onClick={onImport}',
  'onClick={onBack}',
]) {
  requireText('screen', needle, 'Deck selection must expose count for layout without changing selection or management semantics');
}
for (const forbidden of ['decks[0]', 'onSelect(decks', 'Math.random']) {
  forbidText('screen', forbidden, 'featured presentation must not special-case data semantics or auto-select a deck');
}

for (const needle of [
  ".sp-deck-select__grid[data-deck-count='1']",
  "grid-template-columns: minmax(0, min(980px, 100%));",
  ".sp-deck-select__grid[data-deck-count='1'] .sp-deck-select-card__body",
  'grid-template-columns: minmax(390px, 1.3fr) minmax(250px, 0.7fr);',
  '--tile-w: clamp(48px, 4.5vw, 62px);',
  '--tile-h: clamp(64px, 6vw, 82px);',
  "grid-template-columns: repeat(4, minmax(0, 1fr));",
  'grid-template-columns: minmax(300px, 1.2fr) minmax(210px, 0.8fr);',
  '--tile-w: 40px;',
  '--tile-h: 54px;',
]) {
  requireText('css', needle, 'one-deck libraries must become a wide loadout while compact stays bounded');
}
for (const forbidden of ['radial-gradient(', 'linear-gradient(', 'translateY(-', '!important']) {
  forbidText('css', forbidden, 'Batch 31 authored layer must not add promo-card glow, lift, or forceful overrides');
}

for (const needle of [
  "getByRole('heading', { name: 'デッキ選択' })",
  "capture(page, `deck-list-${skin}-${size.label}`)",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
]) {
  requireText('visual', needle, 'canonical shell flow must keep deck selection evidence at both target viewports');
}

requireText('packageJson', '"qa:batch31:featured-deck-select-contract": "node scripts/qa/validate-batch31-featured-deck-select-contract.mjs"', 'Batch 31 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch31:featured-deck-select-contract', 'Batch 31 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 31 featured deck selection contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 31 featured deck selection contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
