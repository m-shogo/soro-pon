import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  css: 'src/ui/styles/compact-opponent-seat-tags.css',
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

requireText('app', "import './ui/styles/compact-opponent-seat-tags.css';", 'Batch 49 screen override must be loaded');

for (const needle of [
  'Batch 49: compact opponents read as seat labels',
  "[data-seat-position]:not([data-seat-position='self']) .sp-player-panel",
  'height: 22px;',
  'min-height: 22px;',
  'padding: 0 4px;',
  'border-radius: 3px;',
  '.sp-player-panel__seal',
  'width: 14px;',
  'height: 14px;',
  'font-size: 8px;',
  '.sp-player-panel__info',
  'flex-direction: row;',
  '.sp-player-panel__name',
  'font-size: 9px;',
  '.sp-player-panel--active',
  'box-shadow: inset 2px 0 0',
]) {
  requireText('css', needle, 'compact opponent seats must remain thin, readable and visibly active');
}

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:']) {
  if (files.css.includes(forbidden)) {
    failures.push(`${REQUIRED_FILES.css}: forbidden ${JSON.stringify(forbidden)} in Batch 49 seat-label styling`);
  }
}

const panelSelector = ".sp-table-stage [data-seat-position]:not([data-seat-position='self']) .sp-player-panel {";
const panelStart = files.css.indexOf(panelSelector);
const panelEnd = panelStart < 0 ? -1 : files.css.indexOf('}', panelStart);
const panelBlock = panelStart >= 0 && panelEnd > panelStart ? files.css.slice(panelStart, panelEnd + 1) : '';
for (const forbidden of ['display: none', 'visibility: hidden']) {
  if (panelBlock.includes(forbidden)) {
    failures.push(`${REQUIRED_FILES.css}: opponent PlayerPanel shell contains forbidden ${JSON.stringify(forbidden)}`);
  }
}

for (const needle of [
  'role="group"',
  'aria-label={label}',
  "{...(active ? { 'aria-current': 'true' as const } : {})}",
  "{kind === 'human' ? '君' : '灯'}",
  '<span className="sp-player-panel__name" title={name}>{name}</span>',
]) {
  requireText('playerPanel', needle, 'opponent identity and active-turn accessibility semantics must remain intact');
}

for (const needle of [
  'opponentPanelCount',
  'opponentPanelMaxHeight',
  'opponentPanelMinHeight',
  'opponentSealMaxSize',
  'opponentVisibleNameCount',
  'opponentAriaLabelCount',
  'activeOpponentSemanticsValid',
  'activeOpponentVisualValid',
  'opponentVisibleTileCollisions',
  'expect(geometry.opponentPanelCount).toBe(playerCount - 1);',
  'expect(geometry.opponentVisibleNameCount).toBe(playerCount - 1);',
  'expect(geometry.opponentAriaLabelCount).toBe(playerCount - 1);',
  'expect(geometry.opponentVisibleTileCollisions).toEqual([]);',
  'toBeLessThanOrEqual(24);',
  'toBeLessThanOrEqual(16);',
  'expect(geometry.opponentPanelMinHeight ?? 0).toBeGreaterThanOrEqual(30);',
]) {
  requireText('visual', needle, 'real 3p/4p evidence must prove compact seat-label density and desktop non-regression');
}

requireText(
  'packageJson',
  '"qa:batch49:compact-opponent-seat-tags-contract": "node scripts/qa/validate-batch49-compact-opponent-seat-tags-contract.mjs"',
  'Batch 49 contract must be directly runnable',
);
requireText('workflow', 'pnpm qa:batch49:compact-opponent-seat-tags-contract', 'Batch 49 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 49 compact opponent seat tags contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 49 compact opponent seat tags contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
