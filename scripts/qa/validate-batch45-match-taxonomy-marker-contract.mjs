import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  screenCss: 'src/ui/styles/screens.css',
  components: 'src/ui/components/components.css',
  matchScreen: 'src/ui/screens/MatchScreen.tsx',
  visual: 'tests/visual/batch26-midgame-review.spec.ts',
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
    failures.push(`${REQUIRED_FILES[fileKey]}: found forbidden ${JSON.stringify(needle)} — ${reason}`);
  }
}

for (const needle of [
  'Batch 45: during play, taxonomy is supporting information',
  '.sp-match-screen .sp-tile__band {',
  'height: 4px;',
  'min-height: 4px;',
  'flex: 0 0 4px;',
  'font-size: 0;',
  'color: transparent;',
  'var(--tile-category-color, var(--sp-color-chip-fallback)) 86%',
]) {
  requireText('screenCss', needle, 'live match taxonomy must collapse to a thin color marker');
}

const markerStart = files.screenCss.indexOf('/* Batch 45: during play, taxonomy is supporting information.');
const markerEnd = files.screenCss.indexOf('/* Match insight is a quiet table log', markerStart);
const markerBlock = markerStart >= 0 && markerEnd > markerStart ? files.screenCss.slice(markerStart, markerEnd) : '';
for (const forbidden of ['display: none', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', '!important']) {
  if (markerBlock.includes(forbidden)) {
    failures.push(`${REQUIRED_FILES.screenCss}: Batch 45 marker block contains forbidden ${JSON.stringify(forbidden)}`);
  }
}

for (const needle of [
  '.sp-tile__band {',
  'height: 22%;',
  'min-height: 14px;',
  'font-size: var(--sp-font-xs);',
]) {
  requireText('components', needle, 'shared TileCard must retain the full taxonomy label outside MatchScreen');
}

for (const needle of [
  'categoryColor: category.color',
  'categoryName: category.name',
  'showName={!small}',
]) {
  requireText('matchScreen', needle, 'category identity and accessible tile semantics must remain in MatchScreen');
}

for (const needle of [
  'taxonomyBandCount',
  'taxonomyBandMaxHeight',
  'taxonomyBandMaxFontSize',
  'taxonomyBandsOutsideTiles',
  'expect(geometry.taxonomyBandCount).toBeGreaterThan(0);',
  'toBeLessThanOrEqual(4.5);',
  'toBeLessThanOrEqual(0.5);',
  'expect(geometry.taxonomyBandsOutsideTiles).toEqual([]);',
]) {
  requireText('visual', needle, 'real midgame evidence must measure marker geometry across the existing 8-case matrix');
}

requireText(
  'packageJson',
  '"qa:batch45:match-taxonomy-marker-contract": "node scripts/qa/validate-batch45-match-taxonomy-marker-contract.mjs"',
  'Batch 45 contract must be directly runnable',
);
requireText('workflow', 'pnpm qa:batch45:match-taxonomy-marker-contract', 'Batch 45 contract must block CI drift');
forbidText('matchScreen', 'categoryName={undefined}', 'MatchScreen must not delete category semantics just to clean presentation');

if (failures.length > 0) {
  console.error('Batch 45 match taxonomy marker contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 45 match taxonomy marker contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
