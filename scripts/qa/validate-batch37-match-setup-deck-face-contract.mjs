import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  screen: 'src/ui/screens/MatchSetupScreen.tsx',
  face: 'src/ui/components/MatchSetupDeckFace.tsx',
  css: 'src/ui/styles/match-setup-authored.css',
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
  "import { MatchSetupDeckFace } from '../components/MatchSetupDeckFace';",
  '<MatchSetupDeckFace deck={deck} />',
  'disabled={!supported.includes(count)}',
  'onClick={() => setPlayerCount(count)}',
  'onClick={() => onStart(playerCount)}',
  '<small>山 {drawPileCount}枚</small>',
]) {
  requireText('screen', needle, 'setup must add deck identity without changing player-count or start semantics');
}
for (const forbidden of ['TileCard', 'Math.random', 'createInitialMatchState', 'applyMatchAction']) {
  forbidText('screen', forbidden, 'MatchSetupScreen must stay orchestration-only and outside engine/tile rendering responsibilities');
}

for (const needle of [
  "import { TileCard } from './TileCard';",
  'const categories = deck.categories ?? [];',
  'const tiles = deck.tiles ?? [];',
  'const previewTiles = tiles.slice(0, 8);',
  'const totalTiles = tiles.reduce((sum, tile) => sum + tile.count, 0);',
  'className="sp-match-setup__deck-face"',
  'className="sp-match-setup__deck-rack"',
  '{totalTiles}枚',
  '{tiles.length}種',
  '{categories.length}カテゴリ',
]) {
  requireText('face', needle, 'deck face must render real deck identity while remaining safe for lightweight presentation fixtures');
}

for (const needle of [
  '.sp-match-setup__deck-face {',
  'flex: 1;',
  '.sp-match-setup__deck-rack {',
  '--tile-w: clamp(38px, 3.8vw, 50px);',
  '.sp-match-setup__deck-meta {',
  'margin: 0;',
  '--tile-w: 30px;',
  '--tile-h: 40px;',
]) {
  requireText('css', needle, 'the previous setup whitespace must become a bounded real-tile rack without moving the rule rail');
}
for (const forbidden of ['linear-gradient(', 'radial-gradient(', '!important', 'position: fixed']) {
  forbidText('css', forbidden, 'deck face must not introduce decorative or forceful web-layout escape hatches');
}

for (const needle of [
  'const PLAYER_COUNTS = [3, 4] as const;',
  'match-setup-${skin}-${playerCount}p-${size.label}',
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
]) {
  requireText('visual', needle, 'canonical setup evidence must continue covering both player counts, skins and target viewports');
}

requireText('packageJson', '"qa:batch37:match-setup-deck-face-contract": "node scripts/qa/validate-batch37-match-setup-deck-face-contract.mjs"', 'Batch 37 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch37:match-setup-deck-face-contract', 'Batch 37 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 37 match setup deck face contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 37 match setup deck face contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
