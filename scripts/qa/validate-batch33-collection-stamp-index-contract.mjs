import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/CollectionScreen.tsx',
  css: 'src/ui/styles/collection-stamp-index.css',
  visual: 'tests/visual/batch22-collection-review.spec.ts',
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

requireText('app', "import './ui/styles/collection-stamp-index.css';", 'stamp index layer must load after collection ledger composition');
for (const needle of [
  'ACHIEVEMENTS.map((achievement)',
  'const done = unlocked.has(achievement.id);',
  "sp-clear-board__cell${done ? ' sp-clear-board__cell--done' : ''}",
  '{achievement.title}',
  '{achievement.description}',
]) {
  requireText('screen', needle, 'Batch 33 must preserve the canonical achievement source, unlock state and copy');
}

for (const needle of [
  'counter-reset: memory-stamp;',
  'grid-template-columns: repeat(5, minmax(0, 1fr));',
  'counter-increment: memory-stamp;',
  "content: counter(memory-stamp, decimal-leading-zero);",
  "content: '済';",
  'border-radius: 0;',
  'grid-template-columns: 34px minmax(0, 1fr);',
  'grid-template-columns: 25px minmax(0, 1fr);',
  '-webkit-line-clamp: 1;',
]) {
  requireText('css', needle, 'achievement board must read as a numbered 5x5 stamp index and remain compact');
}
for (const forbidden of ['radial-gradient(', 'linear-gradient(', 'backdrop-filter', 'translateY(', '!important']) {
  forbidText('css', forbidden, 'stamp index must not regress into decorative card or hover-lift treatment');
}

for (const needle of [
  "getByRole('heading', { name: '記憶帳' })",
  'collection-${skin}-${size.label}',
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "getByRole('button', { name: 'もどる' })",
]) {
  requireText('visual', needle, 'canonical Collection evidence must continue covering both target viewports and real navigation');
}

requireText('packageJson', '"qa:batch33:collection-stamp-index-contract": "node scripts/qa/validate-batch33-collection-stamp-index-contract.mjs"', 'Batch 33 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch33:collection-stamp-index-contract', 'Batch 33 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 33 collection stamp index contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 33 collection stamp index contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
