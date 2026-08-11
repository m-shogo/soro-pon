import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  screen: 'src/ui/screens/MatchSetupScreen.tsx',
  css: 'src/ui/styles/match-setup-authored.css',
  visual: 'tests/visual/batch14-review-capture.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
};

const files = Object.fromEntries(
  await Promise.all(
    Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')]),
  ),
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
  "type LobbySeatPosition = 'self' | 'left' | 'top' | 'right'",
  'playerCount === 3',
  "{ name: 'トモリ', position: 'left' }",
  "{ name: 'ナギ', position: 'top' }",
  "{ name: 'ミチル', position: 'right' }",
  'data-player-count={playerCount}',
  'data-lobby-seat="self"',
  'data-lobby-seat={position}',
  '<strong>{playerCount}人戦</strong>',
  '<small>山 {drawPileCount}枚</small>',
  'disabled={!supported.includes(count)}',
  'onClick={() => onStart(playerCount)}',
]) {
  requireText('screen', needle, 'setup lobby must visualize existing player-count state without duplicating gameplay rules');
}
for (const forbidden of [
  'Math.random',
  'createInitialMatchState',
  'applyMatchAction',
]) {
  forbidText('screen', forbidden, 'setup presentation must not absorb engine responsibilities');
}

for (const needle of [
  '.sp-match-setup__lobby {',
  'position: relative;',
  '.sp-match-setup__lobby-center',
  ".sp-match-setup__lobby-seat[data-lobby-seat='top']",
  ".sp-match-setup__lobby-seat[data-lobby-seat='self']",
  ".sp-match-setup__lobby-seat[data-lobby-seat='left']",
  ".sp-match-setup__lobby-seat[data-lobby-seat='right']",
  'width: min(148px, 42%);',
  'min-height: 0;',
]) {
  requireText('css', needle, 'lobby seats and center must stay spatially authored across desktop and compact');
}
for (const forbidden of ['!important', 'position: fixed']) {
  forbidText('css', forbidden, 'lobby layout must not use forceful escape hatches');
}

for (const needle of [
  'const PLAYER_COUNTS = [3, 4] as const;',
  'match-setup-${skin}-${playerCount}p-${size.label}',
  "getByRole('button', { name: `${playerCount}人戦`, exact: true })",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
]) {
  requireText('visual', needle, 'canonical current-head artifacts must keep both lobby sizes and both player counts visible');
}

requireText('packageJson', '"qa:batch29:match-setup-lobby-contract": "node scripts/qa/validate-batch29-match-setup-lobby-contract.mjs"', 'Batch 29 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch29:match-setup-lobby-contract', 'Batch 29 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 29 match setup lobby contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 29 match setup lobby contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
