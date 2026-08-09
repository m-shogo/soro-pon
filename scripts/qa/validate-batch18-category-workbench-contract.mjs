import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  editor: 'src/ui/screens/DeckEditorScreen.tsx',
  workbench: 'src/ui/components/DeckCategoryWorkbench.tsx',
  workbenchCss: 'src/ui/styles/deck-category-workbench.css',
  workbenchTest: 'src/ui/components/DeckCategoryWorkbench.test.tsx',
  capture: 'tests/visual/batch14-review-capture.spec.ts',
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

requireText('app', "import './ui/styles/deck-category-workbench.css';", 'category palette CSS must stay loaded');
requireText('editor', "import { DeckCategoryWorkbench } from '../components/DeckCategoryWorkbench';", 'editor must delegate category editing to the palette workbench');
requireText('editor', '<DeckCategoryWorkbench', 'category tab must render one focused palette instead of repeated rows');
requireText('editor', 'onUpdateCategory={updateCategory}', 'existing category mutation semantics must stay wired');
requireText('editor', 'onRemoveCategory={removeCategory}', 'existing category deletion semantics must stay wired');
forbidText('editor', '<CategoryChip', 'DeckEditorScreen itself must not regress to repeated category form rows');
forbidText('editor', '<ColorField', 'color editing belongs inside the selected-category workbench');

for (const needle of [
  'aria-label="カテゴリ編集パレット"',
  'aria-label="編集するカテゴリを選ぶ"',
  'aria-pressed={selected}',
  'data-selected={selected || undefined}',
  'className="sp-category-workbench__editor"',
  '使用牌 {usageCount(category.id)}種',
  'onUpdateCategory(selectedCategory.id, { name })',
  'onRemoveCategory(selectedCategory.id)',
  '削除すると使用中の牌が要修正になります',
]) {
  requireText('workbench', needle, 'category palette must keep direct selection, usage visibility and selected-only editing');
}

for (const needle of [
  'Categories are visual swatches first',
  '.sp-category-workbench__palette',
  ".sp-category-workbench__choice[data-selected='true']",
  '.sp-category-workbench__editor',
  'grid-template-columns: minmax(0, 1.08fr) minmax(260px, 0.92fr);',
  'grid-template-columns: minmax(0, 1fr) minmax(300px, 0.92fr);',
  'min-height: 74px;',
  'min-height: 26px;',
]) {
  requireText('workbenchCss', needle, 'desktop/compact category palette hierarchy and targets must remain explicit');
}
for (const forbidden of ['radial-gradient(', 'linear-gradient(', 'backdrop-filter:', 'translateY(']) {
  forbidText('workbenchCss', forbidden, 'category palette must not use generic AI/SaaS decoration or hover lift');
}

for (const needle of [
  "getByRole('button', { name: '哺乳類を編集' })",
  "getByRole('region', { name: '鳥の編集' })",
  "toHaveBeenCalledWith('cat-b', { name: '空の鳥' })",
  "toHaveBeenCalledWith('cat-a')",
]) requireText('workbenchTest', needle, 'selection/edit/delete behavior must stay unit-covered');

requireText('capture', 'deck-editor-categories-${skin}-${size.label}', 'category palette must stay in the current-head visual matrix');

if (failures.length > 0) {
  console.error('Batch 18 category-workbench contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 18 category-workbench contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
