import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/DeckEditorScreen.tsx',
  css: 'src/ui/styles/deck-basic-ledger.css',
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

requireText('app', "import './ui/styles/deck-basic-ledger.css';", 'basic ledger styles must load after editor composition');
for (const needle of [
  "import { TileCard } from '../components/TileCard';",
  "const previewTiles = draft.tiles.slice(0, 8);",
  'const totalTiles = draft.tiles.reduce((sum, tile) => sum + tile.count, 0);',
  'className="sp-deck-basic-ledger"',
  'className="sp-deck-basic-ledger__rack"',
  'className="sp-deck-basic-ledger__metrics"',
  'onChange={(name) => setDraft({ ...draft, name })}',
  'onChange={(description) => setDraft({ ...draft, description })}',
]) {
  requireText('screen', needle, 'Batch 34 must preserve basic editing while exposing real deck identity');
}

for (const needle of [
  '.sp-deck-basic-ledger {',
  'grid-template-columns: minmax(280px, 0.88fr) minmax(330px, 1.12fr);',
  '.sp-deck-basic-ledger__rack {',
  '.sp-deck-basic-ledger__metrics {',
  'grid-template-columns: repeat(5, minmax(0, 1fr));',
  '#sp-tabpanel-basic > .sp-paper-panel {',
  'min-height: clamp(330px, 45vh, 430px);',
  "@media (max-width: 899px), (max-height: 430px)",
  '--tile-w: 34px;',
  '--tile-h: 46px;',
]) {
  requireText('css', needle, 'basic editor must read as a compact two-part deck ledger across target viewports');
}
for (const forbidden of ['radial-gradient(', 'linear-gradient(', 'backdrop-filter', 'translateY(', '!important']) {
  forbidText('css', forbidden, 'basic ledger must not regress into decorative web-card treatment');
}

for (const needle of [
  "getByRole('heading', { name: 'デッキ編集' })",
  'deck-editor-${skin}-${size.label}',
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
]) {
  requireText('visual', needle, 'canonical editor evidence must keep covering Basic on both skins and target viewports');
}

requireText('packageJson', '"qa:batch34:basic-deck-ledger-contract": "node scripts/qa/validate-batch34-basic-deck-ledger-contract.mjs"', 'Batch 34 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch34:basic-deck-ledger-contract', 'Batch 34 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 34 basic deck ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 34 basic deck ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
