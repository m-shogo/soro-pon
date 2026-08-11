import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  workbench: 'src/ui/components/DeckRoleWorkbench.tsx',
  css: 'src/ui/styles/deck-role-workbench.css',
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
  "value={templateCategoryId}",
  "onChange={onTemplateCategoryChange}",
  "disabled={templateCategoryId === ''}",
  "onClick={() => onAddRoleFromTemplate('threeSameCategory', templateCategoryId)}",
  "disabled={categories.length < 3}",
  "onClick={() => onAddRoleFromTemplate('threeDifferentCategories')}",
  "onClick={() => onAddRoleFromTemplate('threeSameTile')}",
  'disabled={!canAddSpecificSetRole}',
  'onClick={() => onAddSpecificSetRole(templateCategoryId, setTileIds)}',
  '同カテゴリ3組 60点',
  '3カテゴリ1組ずつ 80点',
  '同じ牌3枚×3組 120点',
  '指定3枚 + 同カテゴリ2組 100点',
]) {
  requireText('workbench', needle, 'Batch 36 must preserve all safe role recipe actions and disabled conditions');
}

for (const needle of [
  'grid-template-columns: minmax(158px, 0.72fr) repeat(3, minmax(172px, 1fr));',
  'grid-template-columns: repeat(3, minmax(120px, 0.82fr)) minmax(240px, 1.54fr);',
  'white-space: nowrap;',
  'font-size: clamp(11px, 0.95vw, 13px);',
  'align-items: start;',
  '@media (max-width: 900px) and (max-height: 500px)',
  'grid-template-columns: minmax(118px, 0.82fr) repeat(3, minmax(118px, 1fr));',
  'grid-template-columns: repeat(3, minmax(105px, 0.88fr)) minmax(158px, 1.36fr);',
  'min-height: 30px;',
  'font-size: 8px;',
]) {
  requireText('css', needle, 'role recipes must stay one-line on desktop and fit each compact recipe section into one row');
}
for (const forbidden of ['linear-gradient(', 'radial-gradient(', 'translateY(', '!important']) {
  forbidText('css', forbidden, 'role recipe density must remain flat authored game UI');
}

for (const needle of [
  'deck-editor-roles-${skin}-${size.label}',
  "getByRole('tab', { name: /^役/ })",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
]) {
  requireText('visual', needle, 'canonical role evidence must continue covering both skins and target viewports');
}

requireText('packageJson', '"qa:batch36:role-recipe-density-contract": "node scripts/qa/validate-batch36-role-recipe-density-contract.mjs"', 'Batch 36 contract must be runnable directly');
requireText('workflow', 'pnpm qa:batch36:role-recipe-density-contract', 'Batch 36 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 36 role recipe density contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 36 role recipe density contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
