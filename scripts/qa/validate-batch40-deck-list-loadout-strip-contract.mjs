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
  'onClick={() => onSelect(stored.deck.id)}',
  'aria-label={`${stored.deck.name}、${STATUS_LABEL[status]}、牌${totalTiles}枚`}',
  'onClick={onCreate}',
  'onClick={onImport}',
  'onClick={onBack}',
  'const previewTiles = stored.deck.tiles.slice(0, 8);',
  'stored.deck.categories.slice(0, 4)',
]) {
  requireText('screen', needle, 'Batch 40 must preserve selection, management and real-deck preview semantics');
}
for (const forbidden of ['decks[0]', 'onSelect(decks', 'Math.random']) {
  forbidText('screen', forbidden, 'compact presentation must not special-case or auto-select deck data');
}

for (const needle of [
  '@media (max-width: 899px), (max-height: 430px)',
  ".sp-deck-select__grid[data-deck-count='1']",
  'align-content: center;',
  'max-height: 190px;',
  'grid-template-columns: minmax(380px, 1.15fr) minmax(270px, 0.85fr);',
  '--tile-w: 48px;',
  '--tile-h: 64px;',
  'height: 76px;',
  'font-size: 10px;',
  'font-size: 11px;',
  'max-height: 30px;',
]) {
  requireText('css', needle, 'one-deck compact mode must be a bounded readable loadout strip without internal dead space');
}
for (const forbidden of ['radial-gradient(', 'linear-gradient(', 'translateY(-', '!important']) {
  forbidText('css', forbidden, 'compact loadout strip must remain authored game UI without promo-card effects or force overrides');
}

for (const needle of [
  "capture(page, `deck-list-${skin}-${size.label}`)",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "getByRole('heading', { name: 'デッキ選択' })",
]) {
  requireText('visual', needle, 'canonical deck-list evidence must stay current for both skins and target viewports');
}

requireText('packageJson', '"qa:batch40:deck-list-loadout-strip-contract": "node scripts/qa/validate-batch40-deck-list-loadout-strip-contract.mjs"', 'Batch 40 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch40:deck-list-loadout-strip-contract', 'Batch 40 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 40 compact deck-list loadout strip contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 40 compact deck-list loadout strip contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
