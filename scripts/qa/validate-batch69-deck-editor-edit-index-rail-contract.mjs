import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/DeckEditorScreen.tsx',
  tab: 'src/ui/components/Tab.tsx',
  components: 'src/ui/components/components.css',
  css: 'src/ui/styles/deck-editor-edit-index-rail.css',
  visual: 'tests/visual/batch69-deck-editor-edit-index-rail-review.spec.ts',
  batch54Visual: 'tests/visual/batch54-deck-editor-inspector-rail-review.spec.ts',
  batch68Visual: 'tests/visual/batch68-deck-editor-readable-inspector-ledger-review.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
};

const files = Object.fromEntries(
  await Promise.all(Object.entries(REQUIRED_FILES).map(async ([key, path]) => [key, await readFile(path, 'utf8')])),
);
const failures = [];
const requireText = (key, needle, reason) => {
  if (!files[key].includes(needle)) failures.push(`${REQUIRED_FILES[key]}: missing ${JSON.stringify(needle)} — ${reason}`);
};
const forbidText = (key, needle, reason) => {
  if (files[key].includes(needle)) failures.push(`${REQUIRED_FILES[key]}: forbidden ${JSON.stringify(needle)} — ${reason}`);
};

requireText('app', "import './ui/styles/deck-editor-edit-index-rail.css';", 'Batch 69 screen override must load');
for (const needle of [
  "import { Tabs } from '../components/Tab';",
  "{ id: 'basic', label: '基本' }",
  "{ id: 'categories', label: `カテゴリ (${draft.categories.length})` }",
  "{ id: 'tiles', label: `牌 (${draft.tiles.length})` }",
  "{ id: 'roles', label: `役 (${activeVariant?.winRoles.length ?? 0})` }",
  "label: `ボーナス (${bonusCount})`",
  'activeId={tab}',
  'onSelect={setTab}',
  'role="tabpanel"',
  'id={`sp-tabpanel-${tab}`}',
  'aria-labelledby={`sp-tab-${tab}`}',
]) requireText('screen', needle, 'DeckEditor tab state/count labels/panel linkage must remain unchanged');

for (const needle of [
  'role="tablist"',
  'role="tab"',
  'aria-selected={item.id === activeId}',
  'aria-controls={`sp-tabpanel-${item.id}`}',
  'tabIndex={item.id === activeId ? 0 : -1}',
  "case 'ArrowRight':",
  "case 'ArrowLeft':",
  "case 'Home':",
  "case 'End':",
  'moveTo(index + 1);',
  'moveTo(index - 1);',
]) requireText('tab', needle, 'shared roving-tabindex keyboard and ARIA semantics must remain canonical');

for (const needle of [
  '.sp-tabs {',
  'display: flex;',
  'gap: var(--sp-space-4);',
  '.sp-tab--active {',
]) requireText('components', needle, 'shared Tab presentation remains untouched for non-DeckEditor consumers');

for (const needle of [
  'Batch 69: DeckEditor section navigation is one connected edit index',
  ".sp-screen:has([id^='sp-tabpanel-']) > .sp-tabs {",
  'width: min(100%, 760px);',
  'display: grid;',
  'grid-template-columns: repeat(5, minmax(0, 1fr));',
  'gap: 0;',
  "> .sp-tabs > .sp-tab {",
  'min-height: 36px;',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  'white-space: nowrap;',
  '> .sp-tabs > .sp-tab--active {',
  'border-bottom-color: var(--sp-color-lantern-0);',
  'font-weight: var(--sp-weight-strong);',
  '@media (max-width: 899px), (max-height: 430px)',
  'min-height: 32px;',
]) requireText('css', needle, 'DeckEditor tabs must remain a flat connected five-cell index');
for (const forbidden of [
  '!important',
  'linear-gradient(',
  'radial-gradient(',
  'backdrop-filter:',
  'position: fixed',
  "data-skin='cute-pop'",
  "data-skin='yorunoshirube'",
]) forbidText('css', forbidden, 'Batch 69 stays skin-neutral without decorative/specificity escape hatches');

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "{ id: 'basic', name: /^基本/ }",
  "{ id: 'categories', name: /^カテゴリ/ }",
  "{ id: 'tiles', name: /^牌/ }",
  "{ id: 'roles', name: /^役/ }",
  "{ id: 'bonuses', name: /^ボーナス/ }",
  "await basic.press('ArrowRight');",
  "await categories.press('End');",
  "await bonuses.press('Home');",
  "expect(geometry?.gridColumnCount).toBe(5);",
  "expect(geometry?.gap).toBe(0);",
  "expect(geometry?.allTextFits).toBe(true);",
  "expect(geometry?.activeCount).toBe(1);",
  "expect(geometry?.minimumHeight ?? 0).toBeGreaterThanOrEqual(32);",
  'deck-editor-edit-index-${skin}-${tab.id}-${size.label}.png',
]) requireText('visual', needle, 'current-head proof must cover keyboard semantics and all five active sections at both target sizes');

for (const needle of [
  'const TABS = [',
  'expect(geometry?.summaryVisibleCount).toBe(4);',
  'expect(geometry?.issueVisibleCount).toBe(3);',
]) requireText('batch54Visual', needle, 'Batch 54 five-tab inspector geometry remains independently enforced');
for (const needle of [
  "const STATES = ['clean', 'warning', 'blocked'] as const;",
  'expect(geometry?.normalFontMin ?? 0).toBeGreaterThanOrEqual(9);',
  'expect(geometry?.sideHeight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(58);',
]) requireText('batch68Visual', needle, 'Batch 68 readable inspector proof remains present');

requireText('packageJson', '"qa:batch69:deck-editor-edit-index-rail-contract": "node scripts/qa/validate-batch69-deck-editor-edit-index-rail-contract.mjs"', 'Batch 69 contract must be directly runnable');
requireText('workflow', 'pnpm qa:batch69:deck-editor-edit-index-rail-contract', 'Batch 69 contract must block CI drift');
requireText('visualWorkflow', '- name: Verify Batch 69 DeckEditor edit index rail', 'Batch 69 gets a named visual proof step');
requireText('visualWorkflow', 'pnpm exec playwright test tests/visual/batch69-deck-editor-edit-index-rail-review.spec.ts', 'dedicated five-tab proof runs before artifact upload');

if (failures.length > 0) {
  console.error('Batch 69 DeckEditor edit index rail contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 69 DeckEditor edit index rail contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
