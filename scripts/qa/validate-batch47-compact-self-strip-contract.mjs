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
  'Batch 47: the bottom hand already establishes self ownership visually',
  ".sp-table-stage [data-seat-position='self'] .sp-player-panel {",
  'position: absolute;',
  'width: 1px;',
  'min-width: 1px;',
  'height: 1px;',
  'min-height: 1px;',
  'clip: rect(0 0 0 0);',
  'clip-path: inset(50%);',
  'white-space: nowrap;',
  'Compact rivers are tile geometry, not a mini table report',
  '.sp-match-screen .sp-seat-played__head {',
  'display: none;',
]) {
  requireText('screenCss', needle, 'compact must visually retire redundant self chrome while keeping river report chrome hidden');
}

const selfStart = files.screenCss.indexOf('/* Batch 47: the bottom hand already establishes self ownership visually.');
const riverStart = files.screenCss.indexOf('/* Compact rivers are tile geometry', selfStart);
const selfBlock = selfStart >= 0 && riverStart > selfStart ? files.screenCss.slice(selfStart, riverStart) : '';
for (const forbidden of ['display: none', 'visibility: hidden', '!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:']) {
  if (selfBlock.includes(forbidden)) {
    failures.push(`${REQUIRED_FILES.screenCss}: Batch 47 self semantic block contains forbidden ${JSON.stringify(forbidden)}`);
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
  'selfPanelWidth',
  'selfPanelHeight',
  'selfPanelDisplay',
  'selfPanelVisibility',
  'selfPanelClipPath',
  'selfPanelAriaLabel',
  'selfNameInDom',
  'expect(geometry.selfPanelAriaLabel).toBeTruthy();',
  'expect(geometry.selfNameInDom).toBe(true);',
  'toBeLessThanOrEqual(2);',
  "expect(geometry.selfPanelDisplay).not.toBe('none');",
  "expect(geometry.selfPanelVisibility).not.toBe('hidden');",
  "expect(geometry.selfPanelClipPath).not.toBe('none');",
  "if (size.label === 'desktop')",
  'toBeGreaterThanOrEqual(100);',
  'toBeGreaterThanOrEqual(30);',
  'expect(geometry.seatRiverCollisions).toEqual([]);',
]) {
  requireText('visual', needle, 'real 3p/4p midgame evidence must prove compact visual retirement with semantic preservation and desktop non-regression');
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
