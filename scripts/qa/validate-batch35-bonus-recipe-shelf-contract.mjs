import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  workbench: 'src/ui/components/DeckBonusWorkbench.tsx',
  css: 'src/ui/styles/deck-bonus-workbench.css',
  visual: 'tests/visual/batch14-review-capture.spec.ts',
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
  'className="sp-bonus-workbench__preset-copy"',
  'className="sp-bonus-workbench__preset-action"',
  'sp-bonus-workbench__preset-action sp-bonus-workbench__preset-action--single',
  'value={templateCategoryId}',
  'onChange={onTemplateCategoryChange}',
  "disabled={templateCategoryId === ''}",
  'onClick={() => onAddSpecialBonus(templateCategoryId)}',
  'onClick={onAddScoreBonus}',
  'カテゴリ3枚以上 +20点',
  '同じ牌3枚 +15点',
  'このボーナスを削除',
]) {
  requireText('workbench', needle, 'Batch 35 must improve preset composition without changing bonus actions or destructive flow');
}

for (const needle of [
  '.sp-bonus-workbench__preset-copy {',
  '.sp-bonus-workbench__preset-action {',
  '.sp-bonus-workbench__preset-action--single {',
  'white-space: nowrap;',
  'grid-template-columns: minmax(0, 1.35fr) minmax(220px, 0.65fr);',
  'grid-template-columns: minmax(0, 1.28fr) minmax(185px, 0.72fr);',
  '.sp-bonus-workbench__preset-copy > span {\n    display: none;',
  'align-items: start;',
]) {
  requireText('css', needle, 'bonus presets must read as horizontal recipes on desktop and compact');
}
for (const forbidden of ['linear-gradient(', 'radial-gradient(', 'translateY(', '!important']) {
  forbidText('css', forbidden, 'recipe shelf must stay authored and flat rather than decorative web-card treatment');
}

for (const needle of [
  'deck-editor-bonuses-${skin}-${size.label}',
  "getByRole('tab', { name: /^ボーナス/ })",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
]) {
  requireText('visual', needle, 'canonical bonus evidence must continue through real tab navigation on both target viewports');
}

requireText('packageJson', '"qa:batch35:bonus-recipe-shelf-contract": "node scripts/qa/validate-batch35-bonus-recipe-shelf-contract.mjs"', 'Batch 35 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch35:bonus-recipe-shelf-contract', 'Batch 35 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 35 bonus recipe shelf contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 35 bonus recipe shelf contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
