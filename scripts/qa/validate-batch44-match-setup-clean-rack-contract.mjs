import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  face: 'src/ui/components/MatchSetupDeckFace.tsx',
  css: 'src/ui/styles/match-setup-authored.css',
  visual: 'tests/visual/batch44-match-setup-rack-review.spec.ts',
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
  "import { TileCard } from './TileCard';",
  'const categories = deck.categories ?? [];',
  'const previewTiles = tiles.slice(0, 8);',
  'fallbackLabel={tile.fallbackLabel}',
  'showName={false}',
  'interactive={false}',
  '{categories.length}カテゴリ',
]) {
  requireText('face', needle, 'MatchSetup deck face must keep real deck identity while presenting a clean tile rack');
}
for (const forbidden of ['categoryById', 'categoryName=', 'categoryColor=']) {
  forbidText('face', forbidden, 'MatchSetup preview must not repeat taxonomy on each tile');
}

for (const needle of [
  '.sp-match-setup__deck-rack {',
  '--tile-w: clamp(38px, 3.8vw, 50px);',
  '@media (max-width: 899px), (max-height: 430px)',
  '--tile-w: 34px;',
  '--tile-h: 46px;',
  'margin-left: -3px;',
]) {
  requireText('css', needle, 'compact preview must remain a readable one-row tile rack');
}
for (const forbidden of ['linear-gradient(', 'radial-gradient(', 'backdrop-filter:', '!important', 'position: fixed']) {
  forbidText('css', forbidden, 'Batch 44 must not introduce generic decoration or layout escape hatches');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  'const PLAYER_COUNTS = [3, 4] as const;',
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'expect(rack?.tileCount).toBe(8);',
  'expect(rack?.visibleBands).toBe(0);',
  'expect(rack?.rowSpread).toBeLessThanOrEqual(1);',
  'expect(rack?.minTileWidth).toBeGreaterThanOrEqual(34);',
]) {
  requireText('visual', needle, 'clean MatchSetup rack must be measured across both skins, player counts and viewports');
}

requireText('packageJson', 'tests/visual/batch44-match-setup-rack-review.spec.ts', 'canonical visual command must execute Batch 44 rack evidence');
requireText('packageJson', '"qa:batch44:match-setup-clean-rack-contract": "node scripts/qa/validate-batch44-match-setup-clean-rack-contract.mjs"', 'Batch 44 contract must be directly runnable');
requireText('workflow', 'pnpm qa:batch44:match-setup-clean-rack-contract', 'Batch 44 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 44 clean MatchSetup rack contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 44 clean MatchSetup rack contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
