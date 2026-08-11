import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  compactCss: 'src/ui/styles/batch14-landscape-game.css',
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
  ".sp-table-stage [data-seat-position='self'] .sp-player-panel {",
  'min-height: 18px;',
  'height: 18px;',
  ".sp-table-stage [data-seat-position='self'] .sp-player-panel__seal {",
  'width: 14px;',
  'height: 14px;',
  ".sp-table-stage [data-seat-position='self'] .sp-player-panel__name {",
  "[data-seat-position='self'] .sp-seat-played {",
  'bottom: 22px;',
]) {
  requireText('compactCss', needle, 'compact self identity must be a thin ownership strip with its river repositioned safely');
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
  'expect(geometry.selfPanelHeight).not.toBeNull();',
  'toBeLessThanOrEqual(20);',
  'toBeLessThanOrEqual(14.5);',
  "expect(geometry.seatRiverCollisions).not.toContain('self');",
  'toBeGreaterThanOrEqual(30);',
]) {
  requireText('visual', needle, 'real 3p/4p midgame evidence must prove compact-only compression and desktop preservation');
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
