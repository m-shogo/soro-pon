import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  css: 'src/ui/styles/desktop-match-stage.css',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
  visual: 'tests/visual/batch26-midgame-review.spec.ts',
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

requireText('app', "import './ui/styles/desktop-match-stage.css';", 'desktop density layer must be loaded');

for (const needle of [
  '@media (min-width: 1200px) and (min-height: 640px)',
  'width: min(100%, 1080px);',
  'max-height: 610px;',
  "grid-template-columns: minmax(185px, 0.8fr) minmax(420px, 1.75fr) minmax(185px, 0.8fr);",
  '--tile-w: clamp(38px, 2.85vw, 42px);',
  '--tile-h: clamp(50px, 3.8vw, 56px);',
  "[data-seat-position='left'] .sp-seat-played",
  "[data-seat-position='right'] .sp-seat-played",
  "[data-seat-position='self'] .sp-seat-played",
  'bottom: 72px;',
  'width: min(100%, 980px);',
]) {
  requireText('css', needle, 'desktop table must stay bounded and rivers/hand must remain legible');
}

for (const forbidden of [
  '@media (max-width:',
  '@media (max-height:',
  'position: fixed',
  '!important',
]) {
  forbidText('css', forbidden, 'Batch 27 must not override compact ownership or use forceful layout escape hatches');
}

requireText(
  'packageJson',
  '"qa:batch27:desktop-table-density-contract": "node scripts/qa/validate-batch27-desktop-table-density-contract.mjs"',
  'Batch 27 contract must be runnable directly',
);
requireText(
  'workflow',
  'pnpm qa:batch27:desktop-table-density-contract',
  'Batch 27 contract must block CI drift',
);
for (const needle of [
  'const PLAYER_COUNTS = [3, 4] as const;',
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'seatRiverCollisions',
  'expect(geometry.outside).toEqual([])',
  'expect(geometry.riversNeedingScroll).toEqual([])',
  'expect(geometry.seatRiverCollisions).toEqual([])',
]) {
  requireText('visual', needle, 'canonical midgame evidence must cover viewport, river scrolling and seat/river separation');
}

if (failures.length > 0) {
  console.error('Batch 27 desktop table density contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 27 desktop table density contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
