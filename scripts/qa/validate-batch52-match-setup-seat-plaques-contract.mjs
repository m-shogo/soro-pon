import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  css: 'src/ui/styles/match-setup-seat-plaques.css',
  screen: 'src/ui/screens/MatchSetupScreen.tsx',
  playerPanel: 'src/ui/components/PlayerPanel.tsx',
  visual: 'tests/visual/batch44-match-setup-rack-review.spec.ts',
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

requireText('app', "import './ui/styles/match-setup-seat-plaques.css';", 'Batch 52 screen-specific plaque styling must be loaded');

for (const needle of [
  'Batch 52: setup needs visible member identity',
  '.sp-match-setup__lobby-seat .sp-player-panel {',
  'min-height: 36px;',
  'height: 36px;',
  'border-left: 2px solid',
  'border-radius: 3px;',
  'box-shadow: none;',
  '.sp-match-setup__lobby-seat .sp-player-panel__seal {',
  'width: 22px;',
  'height: 22px;',
  '.sp-match-setup__lobby-seat .sp-player-panel__meta {',
  'font-size: 9px;',
  ".sp-match-setup__lobby-seat[data-lobby-seat='top'] {",
  'top: 8px;',
  '@media (max-width: 899px), (max-height: 430px)',
  'min-height: 28px;',
  'height: 28px;',
  'width: 16px;',
  'height: 16px;',
  'font-size: 8px;',
  'top: 2px;',
]) {
  requireText('css', needle, 'MatchSetup seat plaques must stay thin, readable and explicitly clear the center panel');
}

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  if (files.css.includes(forbidden)) {
    failures.push(`${REQUIRED_FILES.css}: forbidden ${JSON.stringify(forbidden)} in Batch 52 plaque styling`);
  }
}

for (const needle of [
  '<PlayerPanel name="あなた" kind="human" handCount={8} discardCount={0} active />',
  '<PlayerPanel name={name} kind="cpu" handCount={8} discardCount={0} />',
  'data-lobby-seat="self"',
  'data-lobby-seat={position}',
]) {
  requireText('screen', needle, 'MatchSetup must keep the same PlayerPanel data and seat semantics');
}

for (const needle of [
  'role="group"',
  'aria-label={label}',
  "{...(active ? { 'aria-current': 'true' as const } : {})}",
  '<span className="sp-player-panel__meta">',
  '手牌 {handCount} / 捨て牌 {discardCount}',
]) {
  requireText('playerPanel', needle, 'shared PlayerPanel identity and accessibility semantics must remain unchanged');
}

for (const needle of [
  'inspectLobbySeats',
  "document.querySelector<HTMLElement>('.sp-match-setup__lobby')",
  'const centerWidth = center.offsetWidth;',
  'const centerHeight = center.offsetHeight;',
  'lobbyRect.left + (lobbyRect.width - centerWidth) / 2',
  'lobbyRect.top + (lobbyRect.height - centerHeight) / 2',
  'centerPanelCollisions',
  'topToCenterPanelGap',
  'visibleNameCount',
  'ariaLabelCount',
  'activeSemanticsValid',
  'maxRadius',
  'allShadowless',
  'maxSealSize',
  'expect(seats?.count).toBe(playerCount);',
  'expect(seats?.centerWidth ?? 0).toBeGreaterThan(0);',
  'expect(seats?.centerHeight ?? 0).toBeGreaterThan(0);',
  'expect(seats?.visibleNameCount).toBe(playerCount);',
  'expect(seats?.ariaLabelCount).toBe(playerCount);',
  'expect(seats?.centerPanelCollisions).toEqual([]);',
  'expect(seats?.topToCenterPanelGap ?? Number.NEGATIVE_INFINITY).toBeGreaterThanOrEqual(4);',
  'expect(seats?.maxRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(4);',
  'expect(seats?.allShadowless).toBe(true);',
  'expect(seats?.maxHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(30);',
  'expect(seats?.maxSealSize ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(16);',
  'expect(seats?.minHeight ?? 0).toBeGreaterThanOrEqual(32);',
  'expect(seats?.maxHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(40);',
]) {
  requireText('visual', needle, 'real MatchSetup evidence must prove plaque geometry against the reconstructed rendered center box');
}

requireText(
  'packageJson',
  '"qa:batch52:match-setup-seat-plaques-contract": "node scripts/qa/validate-batch52-match-setup-seat-plaques-contract.mjs"',
  'Batch 52 contract must be directly runnable',
);
requireText('workflow', 'pnpm qa:batch52:match-setup-seat-plaques-contract', 'Batch 52 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 52 MatchSetup seat plaque contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 52 MatchSetup seat plaque contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
