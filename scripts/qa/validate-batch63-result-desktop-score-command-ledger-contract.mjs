import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/ResultScreen.tsx',
  authoredCss: 'src/ui/styles/result-authored-workspace.css',
  compactCss: 'src/ui/styles/result-compact-scoreboard-strip.css',
  css: 'src/ui/styles/result-desktop-score-command-ledger.css',
  visual: 'tests/visual/batch23-result-review.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
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

requireText(
  'app',
  "import './ui/styles/result-desktop-score-command-ledger.css';",
  'Batch 63 desktop Result override must be loaded after compact Result ownership',
);

for (const needle of [
  'className="sp-screen__col sp-screen__col--side sp-result-screen__side"',
  'className="sp-result-screen__ledger"',
  'title="順位"',
  'title={`実績解除 ${newlyUnlocked.length}`}',
  'title="記憶コイン"',
  'className="sp-result-screen__actions" aria-label="対戦結果の次の操作"',
  'onClick={onRematch}',
  'onClick={onCollection}',
  'onClick={onBackToTop}',
  'もう一局',
  '記憶帳を見る',
  'TOPへ',
]) {
  requireText('screen', needle, 'Result side content, actions, and handlers must remain unchanged');
}

for (const needle of [
  'width: min(268px, 27%);',
  'min-width: 214px;',
  '.sp-result-screen__outcome {',
  '.sp-result-screen__winning-groups {',
]) {
  requireText('authoredCss', needle, 'desktop Result main composition and side dimensions must remain authored');
}

for (const needle of [
  'Batch 55: compact Result keeps its vertical budget',
  '@media (max-width: 899px), (max-height: 430px)',
  'width: 166px;',
  'min-width: 166px;',
]) {
  requireText('compactCss', needle, 'Batch 55 compact scoreboard ownership must remain intact');
}

for (const needle of [
  'Batch 63: desktop Result side information reads as one score ledger plus one',
  '@media (min-width: 900px) and (min-height: 431px)',
  '.sp-result-screen__ledger {',
  'gap: 0;',
  '.sp-result-screen__ledger > .sp-paper-panel {',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  '.sp-result-screen__ledger > .sp-paper-panel > .sp-skin-layer {',
  'display: none;',
  '.sp-result-screen__ledger > .sp-paper-panel--selected {',
  'border-left: 2px solid',
  '.sp-result-screen__actions {',
  'grid-template-columns: repeat(3, minmax(0, 1fr));',
  '.sp-result-screen__actions .sp-button {',
  'min-height: 40px;',
  'filter: none;',
  '.sp-result-screen__actions .sp-button:first-child {',
  'border-bottom-width: 2px;',
]) {
  requireText('css', needle, 'desktop Result must remain a connected score ledger plus command rail');
}
for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  forbidText('css', forbidden, 'Batch 63 must not add specificity hacks, promo effects, glass, or floating UI');
}

for (const needle of [
  'inspectResultComposition',
  'expectResultComposition',
  'playRealMatchToResult',
  "expect(geometry?.ledgerGap).toBe(0);",
  "expect(geometry?.actionGap).toBe(0);",
  'expect(geometry?.maxPanelRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);',
  'expect(geometry?.panelsShadowless).toBe(true);',
  'expect(geometry?.panelsTransparent).toBe(true);',
  'expect(geometry?.visibleSkinLayerCount).toBe(0);',
  'expect(geometry?.maxActionRadius ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);',
  'expect(geometry?.actionsShadowless).toBe(true);',
  'expect(geometry?.actionsTransparent).toBe(true);',
  'expect(geometry?.rematchAccentWidth ?? 0).toBeGreaterThanOrEqual(2);',
  'expect(geometry?.sideWidth ?? 0).toBeGreaterThanOrEqual(214);',
  'expect(geometry?.sideWidth ?? 0).toBeGreaterThanOrEqual(160);',
  'expect(geometry?.sideWidth ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(174);',
]) {
  requireText('visual', needle, 'real-match evidence must measure Batch 63 desktop geometry and retain Batch 55 compact gates');
}
for (const forbidden of ['state.result =', "phase: 'result'", 'SHOW_RESULT', 'applyMatchAction(']) {
  forbidText('visual', forbidden, 'Result evidence must not synthesize or inject an end state');
}

requireText(
  'packageJson',
  'tests/visual/batch23-result-review.spec.ts',
  'canonical Batch 14 review capture must continue to include real-match Result evidence',
);
requireText('visualWorkflow', 'pnpm qa:batch14:review-capture', 'Visual Review must run the canonical real-match Result capture');
requireText(
  'packageJson',
  '"qa:batch63:result-desktop-score-command-ledger-contract": "node scripts/qa/validate-batch63-result-desktop-score-command-ledger-contract.mjs"',
  'Batch 63 contract must be directly runnable',
);
requireText(
  'workflow',
  'pnpm qa:batch63:result-desktop-score-command-ledger-contract',
  'Batch 63 contract must block CI drift',
);

if (failures.length > 0) {
  console.error('Batch 63 Result desktop score command ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 63 Result desktop score command ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
