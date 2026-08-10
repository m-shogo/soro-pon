import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
  visual: 'tests/visual/batch26-midgame-review.spec.ts',
  helper: 'tests/visual/helpers/real-match-evidence.ts',
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
  'tests/visual/batch26-midgame-review.spec.ts',
  'qa:batch26:midgame-evidence-contract',
]) {
  requireText('packageJson', needle, 'Batch 26 must be part of canonical visual review and have a named contract');
}
requireText('workflow', 'pnpm qa:batch26:midgame-evidence-contract', 'Batch 26 contract must block CI drift');

for (const needle of [
  "const PLAYER_COUNTS = [3, 4] as const",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'const TARGET_DISCARDS = 10',
  'playRealMatchToDiscardCount',
  'expect(geometry.outside).toEqual([])',
  'expect(geometry.riversNeedingScroll).toEqual([])',
  'match-midgame-',
]) {
  requireText('visual', needle, 'midgame evidence must cover both player counts, both canonical viewports, real play, geometry, and capture');
}
for (const needle of [
  'Date.now = () => fixedNowMs',
  'startRealMatch',
  'performReadyAction',
  'countVisibleDiscards',
  'playRealMatchToDiscardCount',
]) {
  requireText('helper', needle, 'shared real-match helper must keep deterministic production-path evidence behavior');
}

for (const forbidden of [
  'force: true',
  'state.result =',
  "phase: 'result'",
  'SHOW_RESULT',
  'applyMatchAction(',
  'Math.random =',
]) {
  forbidText('visual', forbidden, 'midgame evidence must not bypass pointer, reducer, engine, or RNG boundaries');
  forbidText('helper', forbidden, 'shared real-match helper must not bypass pointer, reducer, engine, or RNG boundaries');
}

if (failures.length > 0) {
  console.error('Batch 26 midgame evidence contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 26 midgame evidence contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
