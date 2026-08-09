import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  packageJson: 'package.json',
  visual: 'tests/visual/batch23-result-review.spec.ts',
  result: 'src/ui/screens/ResultScreen.tsx',
  resultCss: 'src/ui/styles/result-authored-workspace.css',
  controller: 'src/ui/hooks/useMatchController.ts',
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

requireText('packageJson', 'tests/visual/batch23-result-review.spec.ts', 'canonical visual command must include real-match Result evidence');
for (const needle of [
  'playRealMatchToResult',
  "getByRole('button', { name: /まず遊ぶ/ })",
  "getByRole('button', { name: '3人戦をはじめる' })",
  "getByRole('main', { name: '3人戦の対局卓' })",
  "getByRole('heading', { name: '対戦結果' })",
  "getByRole('button', { name: 'ツモ', exact: true })",
  "getByRole('button', { name: 'ロン', exact: true })",
  "getByRole('button', { name: '捨てる', exact: true })",
  'result-${skin}-${size.label}',
  'window.setTimeout =',
  'Math.min(Number(timeout ?? 0), 8)',
]) {
  requireText('visual', needle, 'Result must be reached through the production route and real UI actions');
}
for (const forbidden of ['state.result =', "phase: 'result'", 'SHOW_RESULT', 'applyMatchAction(']) {
  forbidText('visual', forbidden, 'visual test must not synthesize engine Result state');
}

requireText('controller', "case 'roundEnd':", 'production controller must remain responsible for round-end progression');
requireText('controller', "schedule({ type: 'SHOW_RESULT' }, 900);", 'production engine action path must remain canonical');
requireText('controller', 'gameplay stateの変更はすべてapplyMatchAction経由', 'UI controller boundary must remain explicit');

for (const needle of [
  'className="sp-screen sp-result-screen"',
  '<h1 className="sp-screen__title">対戦結果</h1>',
  "result?.reason === 'draw'",
  'もう一局',
  '記憶帳を見る',
  'TOPへ',
]) {
  requireText('result', needle, 'Result must keep outcome-first structure and clear continuation actions');
}
requireText('resultCss', 'The result, winning tiles and score are the event', 'Result visual thesis must remain outcome-first');
forbidText('resultCss', 'linear-gradient(', 'Result authored layer must not use decorative gradients');
forbidText('resultCss', 'radial-gradient(', 'Result authored layer must not use decorative gradients');
forbidText('resultCss', 'backdrop-filter:', 'Result authored layer must not use glass blur');

if (failures.length > 0) {
  console.error('Batch 23 result evidence contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 23 result evidence contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
