import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  top: 'src/ui/screens/TopScreen.tsx',
  screenCss: 'src/ui/styles/screens.css',
  visual: 'tests/visual/batch42-top-rack-review.spec.ts',
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

for (const needle of [
  'const previewTiles = FEATURED_DECK.tiles.slice(0, 8);',
  'className="sp-top-stage__rack"',
  'className="sp-top-stage__deck-spec"',
  "{hasPlayableDeck ? 'まず遊ぶ' : 'デッキを準備'}",
  'onClick={hasPlayableDeck ? onPlayNow : onDeckList}',
  'onClick={onCollection}',
  'onClick={onImport}',
]) {
  requireText('top', needle, 'Batch 42 must preserve TOP deck identity and established navigation semantics');
}

for (const needle of [
  'TOP is a showcase rack',
  '.sp-top-stage__rack .sp-tile__band {',
  'display: none;',
  'Batch 42: keep the starter rack visual-first',
  '.sp-top-stage__rack {',
  '--tile-w: 44px;',
  '--tile-h: 59px;',
  'min-height: 61px;',
  '.sp-top-stage__rack .sp-tile {',
  'inline-size: 44px;',
  'min-inline-size: 44px;',
  'max-inline-size: 44px;',
  'block-size: 59px;',
]) {
  requireText('screenCss', needle, 'TOP rack must suppress repeated category bands and preserve readable compact tile geometry');
}

const showcaseStart = files.screenCss.indexOf('/* TOP is a showcase rack.');
const showcaseEnd = files.screenCss.indexOf('/* Match insight is a quiet table log', showcaseStart);
const showcaseCss = showcaseStart >= 0 && showcaseEnd > showcaseStart
  ? files.screenCss.slice(showcaseStart, showcaseEnd)
  : '';
const compactStart = files.screenCss.indexOf('/* Batch 42: keep the starter rack visual-first');
const compactEnd = files.screenCss.indexOf('/* Batch 40:', compactStart);
const compactRackCss = compactStart >= 0 && compactEnd > compactStart
  ? files.screenCss.slice(compactStart, compactEnd)
  : '';
const batch42Css = `${showcaseCss}\n${compactRackCss}`;
if (showcaseCss === '' || compactRackCss === '') {
  failures.push('src/ui/styles/screens.css: could not isolate Batch 42 rack rule blocks');
}
for (const forbidden of ['linear-gradient(', 'radial-gradient(', 'backdrop-filter:', '!important']) {
  if (batch42Css.includes(forbidden)) {
    failures.push(`src/ui/styles/screens.css: Batch 42 rack rules contain forbidden ${JSON.stringify(forbidden)}`);
  }
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'expect(rack?.tileCount).toBe(8);',
  'expect(rack?.visibleBands).toBe(0);',
  'expect(rack?.rowSpread).toBeLessThanOrEqual(1);',
  'expect(rack?.minTileWidth).toBeGreaterThanOrEqual(44);',
]) {
  requireText('visual', needle, 'TOP rack cleanup must be measured on both skins and target viewports');
}

requireText('packageJson', 'tests/visual/batch42-top-rack-review.spec.ts', 'canonical visual review must execute the TOP rack geometry test');
requireText('packageJson', '"qa:batch42:top-clean-tile-rack-contract": "node scripts/qa/validate-batch42-top-clean-tile-rack-contract.mjs"', 'Batch 42 contract must be directly runnable');
requireText('workflow', 'pnpm qa:batch42:top-clean-tile-rack-contract', 'Batch 42 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 42 clean TOP tile rack contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 42 clean TOP tile rack contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
