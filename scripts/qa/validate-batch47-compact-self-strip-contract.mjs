import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  compactCss: 'src/ui/styles/batch14-landscape-game.css',
  screenCss: 'src/ui/styles/screens.css',
  playerPanel: 'src/ui/components/PlayerPanel.tsx',
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

for (const needle of [
  'Batch 47: center status already communicates whose turn it is',
  ".sp-table-stage [data-seat-position='self'] .sp-seat-played {",
  'bottom: 35px;',
]) {
  requireText('compactCss', needle, 'layout layer must retain the proven safe compact self river offset');
}

for (const needle of [
  'Batch 47 final ownership lives in screens',
  ".sp-table-stage [data-seat-position='self'] .sp-player-panel {",
  'min-height: 18px;',
  'height: 18px;',
  ".sp-table-stage [data-seat-position='self'] .sp-player-panel__seal {",
  'width: 14px;',
  'height: 14px;',
  ".sp-table-stage [data-seat-position='self'] .sp-player-panel__name {",
  'Compact rivers are tile geometry, not a mini table report',
  '.sp-match-screen .sp-seat-played__head {',
  'display: none;',
]) {
  requireText('screenCss', needle, 'screen layer must own final compact self sizing and keep river report chrome hidden');
}

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:']) {
  const start = files.screenCss.indexOf('/* Batch 47 final ownership lives in screens');
  const end = files.screenCss.indexOf('/* Batch 42:', start);
  const block = start >= 0 && end > start ? files.screenCss.slice(start, end) : '';
  if (block.includes(forbidden)) {
    failures.push(`${REQUIRED_FILES.screenCss}: Batch 47 ownership block contains forbidden ${JSON.stringify(forbidden)}`);
  }
}

for (const needle of [
  'className={`sp-player-panel${active ? \' sp-player-panel--active\' : \'\'}${self ? \' sp-player-panel--self\' : \'\'}`}',
  'role="group"',
  'aria-label={label}',
  "{kind === 'human' ? '君' : '灯'}",
  '<span className="sp-player-panel__name" title={name}>{name}</span>',
]) {
  requireText('playerPanel', needle, 'PlayerPanel DOM and accessibility semantics must remain intact');
}

for (const needle of [
  'selfPanelHeight',
  'selfSealHeight',
  'selfNameVisible',
  'selfRiverTileCollisions',
  ".sp-seat-played__tiles .sp-tile",
  'expect(geometry.selfPanelHeight).not.toBeNull();',
  'toBeLessThanOrEqual(20);',
  'toBeLessThanOrEqual(14.5);',
  'expect(geometry.selfRiverTileCollisions).toEqual([]);',
  "if (size.label === 'desktop')",
  'toBeGreaterThanOrEqual(30);',
  'expect(geometry.seatRiverCollisions).toEqual([]);',
]) {
  requireText('visual', needle, 'compact must protect visible river tiles while desktop retains full river-container collision protection');
}

requireText(
  'packageJson',
  '"qa:batch47:compact-self-strip-contract": "node scripts/qa/validate-batch47-compact-self-strip-contract.mjs"',
  'Batch 47 contract must be directly runnable',
);
requireText('workflow', 'pnpm qa:batch47:compact-self-strip-contract', 'Batch 47 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 47 compact self strip contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 47 compact self strip contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
