import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  screen: 'src/ui/screens/ResultScreen.tsx',
  css: 'src/ui/styles/result-authored-workspace.css',
  visual: 'tests/visual/batch23-result-review.spec.ts',
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
  if (!files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
}
function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: found forbidden ${JSON.stringify(needle)} — ${reason}`);
}

for (const needle of [
  "const isDraw = result?.reason === 'draw';",
  "const methodLabel = isDraw ? '流局' : result?.reason === 'tsumo' ? 'ツモ' : 'ロン';",
  "const outcomeName = isDraw ? '勝負つかず' : winner?.name ?? '—';",
  'className="sp-result-screen__outcome"',
  'className="sp-result-screen__outcome-identity"',
  'className="sp-result-screen__outcome-facts" aria-label="対局結果の要約"',
  '<dd>{state.turnCount + 1}手</dd>',
  "<dd>{breakdown ? `${breakdown.totalPoints}点` : '—'}</dd>",
  '<ScoreBreakdown breakdown={breakdown} animateTotal />',
  "<Button variant=\"primary\" onClick={onRematch}>",
]) {
  requireText('screen', needle, 'Result must keep canonical semantics while making outcome immediately readable');
}
for (const forbidden of ['state.result =', 'SHOW_RESULT', 'applyMatchAction(', 'Math.random']) {
  forbidText('screen', forbidden, 'Result presentation must not synthesize engine state');
}

for (const needle of [
  '.sp-result-screen__outcome {',
  'grid-template-columns: minmax(180px, 0.8fr) minmax(300px, 1.2fr);',
  '.sp-result-screen__outcome-facts {',
  'grid-template-columns: repeat(3, minmax(0, 1fr));',
  '.sp-result-screen__outcome-identity > strong',
  'min-height: 72px;',
  'grid-template-columns: minmax(118px, 0.72fr) minmax(230px, 1.28fr);',
  'min-height: 34px;',
]) {
  requireText('css', needle, 'Outcome board must fill the main result surface without breaking compact height');
}
for (const forbidden of ['radial-gradient(', 'linear-gradient(', 'position: fixed', '!important']) {
  forbidText('css', forbidden, 'Result outcome board must stay authored and flat rather than decorative or force-positioned');
}

for (const needle of [
  "getByRole('heading', { name: '対戦結果' })",
  "getByRole('button', { name: 'もう一局' })",
  'result-${skin}-${size.label}',
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'fixed seed repeats the same semantic Result through real UI actions',
]) {
  requireText('visual', needle, 'canonical real-match Result evidence must continue covering both viewports and deterministic semantics');
}

requireText('packageJson', '"qa:batch30:result-outcome-board-contract": "node scripts/qa/validate-batch30-result-outcome-board-contract.mjs"', 'Batch 30 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch30:result-outcome-board-contract', 'Batch 30 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 30 result outcome board contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 30 result outcome board contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
