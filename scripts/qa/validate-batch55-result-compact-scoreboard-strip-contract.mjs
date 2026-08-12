import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/ResultScreen.tsx',
  authoredCss: 'src/ui/styles/result-authored-workspace.css',
  css: 'src/ui/styles/result-compact-scoreboard-strip.css',
  visual: 'tests/visual/batch23-result-review.spec.ts',
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
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: forbidden ${JSON.stringify(needle)} — ${reason}`);
}

requireText('app', "import './ui/styles/result-compact-scoreboard-strip.css';", 'Batch 55 compact Result override must be loaded');

for (const needle of [
  'className="sp-screen__col sp-screen__col--side sp-result-screen__side"',
  'className="sp-result-screen__ledger"',
  'title="順位"',
  'title={`実績解除 ${newlyUnlocked.length}`}',
  'title="記憶コイン"',
  'aria-label="対戦結果の次の操作"',
  'もう一局',
  '記憶帳を見る',
  'TOPへ',
]) requireText('screen', needle, 'Result content, actions and semantics must remain unchanged');

for (const needle of [
  'width: min(268px, 27%);',
  'min-width: 214px;',
]) requireText('authoredCss', needle, 'desktop Result rail must retain its authored dimensions');

for (const needle of [
  'Batch 55: compact Result keeps its vertical budget',
  '@layer screens',
  '@media (max-width: 899px), (max-height: 430px)',
  'width: 166px;',
  'min-width: 166px;',
  '.sp-result-screen__ledger {',
  'background: var(--sp-surface-overlay);',
  '.sp-result-screen__ledger > .sp-paper-panel {',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  '.sp-result-screen__ledger > .sp-paper-panel > .sp-skin-layer {',
  'display: none;',
  '.sp-result-screen__ledger > .sp-paper-panel--selected {',
  'border-left: 2px solid',
  '.sp-result-screen__actions .sp-button {',
  'min-width: 0;',
]) requireText('css', needle, 'compact Result must become one narrow scoreboard strip without losing selected accent or actions');

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  forbidText('css', forbidden, 'Batch 55 must not add specificity hacks, decorative gradients/glass, or floating UI');
}

for (const needle of [
  'inspectResultComposition',
  'expectResultComposition',
  'expect(geometry?.sideWidth ?? 0).toBeGreaterThanOrEqual(160);',
  'expect(geometry?.sideWidth ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(174);',
  'toBeGreaterThanOrEqual(0.76)',
  'expect(geometry?.sideOverflow).toBe(false);',
  'expect(geometry?.ledgerOverflow).toBe(false);',
  'expect(geometry?.actionsOverflow).toBe(false);',
  'expect(geometry?.actionCount).toBe(3);',
  'expect(geometry?.maxPanelRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);',
  'expect(geometry?.panelsShadowless).toBe(true);',
  'expect(geometry?.visibleSkinLayerCount).toBe(0);',
  'expect(geometry?.sideTopAlignedWithMain).toBe(true);',
  'expect(geometry?.sideWidth ?? 0).toBeGreaterThanOrEqual(214);',
  'playRealMatchToResult',
  'await expectResultComposition(page, size);',
]) requireText('visual', needle, 'real-match Result evidence must measure compact strip geometry and desktop non-regression');
for (const forbidden of ['state.result =', "phase: 'result'", 'SHOW_RESULT', 'applyMatchAction(']) {
  forbidText('visual', forbidden, 'Result evidence must not inject or synthesize end state');
}

requireText('packageJson', '"qa:batch55:result-compact-scoreboard-strip-contract": "node scripts/qa/validate-batch55-result-compact-scoreboard-strip-contract.mjs"', 'Batch 55 contract must be runnable');
requireText('workflow', 'pnpm qa:batch55:result-compact-scoreboard-strip-contract', 'Batch 55 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 55 Result compact scoreboard strip contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 55 Result compact scoreboard strip contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
