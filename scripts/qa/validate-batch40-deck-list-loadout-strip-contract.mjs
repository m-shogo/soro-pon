import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  screen: 'src/ui/screens/DeckListScreen.tsx',
  css: 'src/ui/styles/deck-browser-authored-workspace.css',
  screenCss: 'src/ui/styles/screens.css',
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
  'grid-auto-rows: 166px;',
  'align-content: center;',
  'height: 166px;',
  'min-height: 166px;',
  'max-height: 166px;',
  'grid-template-columns: minmax(380px, 1.15fr) minmax(270px, 0.85fr);',
  '--tile-w: 48px;',
  '--tile-h: 64px;',
  'height: 76px;',
  'font-size: 10px;',
  'font-size: 11px;',
  'max-height: 30px;',
  '@layer screens',
  'block-size: 166px;',
  'min-block-size: 166px;',
  'max-block-size: 166px;',
]) {
  requireText('css', needle, 'one-deck compact mode must stay a hard-bounded readable loadout strip and own final screen geometry');
}
for (const forbidden of ['radial-gradient(', 'linear-gradient(', 'translateY(-', '!important']) {
  forbidText('css', forbidden, 'compact loadout strip must remain authored game UI without promo-card effects or force overrides');
}

for (const needle of [
  'Batch 40: this is a one-deck selection-screen geometry decision',
  ".sp-deck-select__grid[data-deck-count='1'] .sp-deck-select-card__preview",
  'inline-size: 48px;',
  'min-inline-size: 48px;',
  'max-inline-size: 48px;',
  'block-size: 64px;',
  'flex: 0 0 48px;',
]) {
  requireText('screenCss', needle, 'screen layer must preserve the measured compact tile size after card compression');
}

for (const needle of [
  "capture(page, `deck-list-${skin}-${size.label}`)",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "getByRole('heading', { name: 'デッキ選択' })",
  'async function expectCompactSingleDeckGeometry',
  "expect(geometry?.deckCount).toBe('1');",
  'expect(geometry?.cardHeight).toBeLessThanOrEqual(170);',
  'expect(geometry?.previewTopGap).toBeLessThanOrEqual(70);',
  'expect(geometry?.minTileWidth).toBeGreaterThanOrEqual(47);',
  "if (size.label === 'compact') await expectCompactSingleDeckGeometry(page);",
]) {
  requireText('visual', needle, 'canonical deck-list evidence must include a measured compact geometry gate, not screenshot presence alone');
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
