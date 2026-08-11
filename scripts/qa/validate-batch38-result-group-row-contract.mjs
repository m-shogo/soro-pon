import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  screen: 'src/ui/screens/ResultScreen.tsx',
  css: 'src/ui/styles/result-authored-workspace.css',
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
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: found forbidden ${JSON.stringify(needle)} — ${reason}`);
}

for (const needle of [
  'className="sp-result-screen__winning-groups"',
  'className="sp-result-screen__winning-group"',
  '{breakdown.groups.map((group, groupIndex) => (',
  '{group.tileInstanceIds.map((instanceId) => {',
  '<ScoreBreakdown breakdown={breakdown} animateTotal />',
]) {
  requireText('screen', needle, 'Batch 38 must only reflow canonical winning-group presentation and preserve score rendering');
}
for (const forbidden of ['state.result =', 'applyMatchAction(', 'Math.random', 'SHOW_RESULT']) {
  forbidText('screen', forbidden, 'Result layout must not synthesize or mutate engine state');
}

for (const needle of [
  '.sp-result-screen__winning-groups {',
  'grid-template-columns: repeat(3, minmax(0, 1fr));',
  '.sp-result-screen__winning-group {',
  'flex-wrap: wrap;',
  'justify-content: center;',
  '.sp-result-screen__winning-group > span {',
  'flex: 0 0 100%;',
  'text-align: center;',
  'padding: 1px 2px 4px;',
]) {
  requireText('css', needle, 'three winning groups must read horizontally on desktop and compact');
}
for (const forbidden of ['linear-gradient(', 'radial-gradient(', 'position: fixed', '!important']) {
  forbidText('css', forbidden, 'Batch 38 must stay a flat authored reflow without decorative or forced positioning');
}

for (const needle of [
  "getByRole('heading', { name: '対戦結果' })",
  'result-${skin}-${size.label}',
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  'fixed seed repeats the same semantic Result through real UI actions',
]) {
  requireText('visual', needle, 'canonical deterministic real-match Result evidence must cover both viewports and skins');
}

requireText('packageJson', '"qa:batch38:result-group-row-contract": "node scripts/qa/validate-batch38-result-group-row-contract.mjs"', 'Batch 38 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch38:result-group-row-contract', 'Batch 38 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 38 result group row contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 38 result group row contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
