import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  editor: 'src/ui/screens/DeckEditorScreen.tsx',
  workbench: 'src/ui/components/DeckRoleWorkbench.tsx',
  css: 'src/ui/styles/deck-role-workbench.css',
  visual: 'tests/visual/batch14-review-capture.spec.ts',
};

const files = Object.fromEntries(
  await Promise.all(
    Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')]),
  ),
);
const failures = [];

function requireText(fileKey, needle, reason) {
  if (!files[fileKey].includes(needle)) {
    failures.push(`${REQUIRED_FILES[fileKey]}: missing ${JSON.stringify(needle)} — ${reason}`);
  }
}
function forbidText(fileKey, needle, reason) {
  if (files[fileKey].includes(needle)) {
    failures.push(`${REQUIRED_FILES[fileKey]}: found forbidden ${JSON.stringify(needle)} — ${reason}`);
  }
}

requireText('app', "import './ui/styles/deck-role-workbench.css';", 'new role workbench styles must stay loaded');
forbidText('app', 'deck-role-composer.css', 'obsolete role composer layer must not return');
requireText('editor', "import { DeckRoleWorkbench }", 'editor must delegate role UI to the dedicated workbench');
requireText('editor', "tab === 'roles' && activeVariant", 'role workbench must edit the active variant');
requireText('editor', 'onAddRoleFromTemplate={addRoleFromTemplate}', 'safe role builders must stay in DeckEditor');
requireText('editor', 'onAddSpecificSetRole={addSpecificSetRole}', 'specific-set builder boundary must stay in DeckEditor');
forbidText('editor', 'title="役を追加(安全テンプレート)"', 'old role preset panel must not return');
forbidText('editor', 'title="役の一覧"', 'old repeated role rows must not return');

for (const needle of [
  'aria-label="役編集ワークベンチ"',
  'aria-label="編集する役を選ぶ"',
  'aria-pressed={selected}',
  '同カテゴリ3組 60点',
  '3カテゴリ1組ずつ 80点',
  '同じ牌3枚×3組 120点',
  '指定3枚 + 同カテゴリ2組 100点',
  '条件構造は安全テンプレート固定',
  'この役を削除',
]) {
  requireText('workbench', needle, 'role presets, selection and locked rule semantics must stay explicit');
}
for (const forbidden of [
  'buildSameCategoryRoleTemplate',
  'buildThreeDifferentCategoriesRoleTemplate',
  'buildSameTileRoleTemplate',
  'buildSpecificSetRoleTemplate',
]) {
  forbidText('workbench', forbidden, 'workbench must not duplicate role construction semantics');
}

requireText('css', 'selection-based', 'role visual thesis must remain explicit');
requireText('css', 'min-height: 44px;', 'roomy role targets must retain frequent-action touch sizing');
requireText('css', "[data-selected='true']", 'role selection needs a persistent non-hover state');
requireText('css', 'transform: none', 'role choices must not regain hover lift');
forbidText('css', 'linear-gradient(', 'role workbench must not use decorative gradients');
forbidText('css', 'radial-gradient(', 'role workbench must not use decorative gradients');

requireText('visual', 'deck-editor-roles-${skin}-${size.label}', 'role tab must remain in current-head visual evidence');
requireText('visual', "getByRole('tab', { name: /^役/ })", 'visual capture must use the real role tab interaction');

if (failures.length > 0) {
  console.error('Batch 20 role workbench contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 20 role workbench contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
