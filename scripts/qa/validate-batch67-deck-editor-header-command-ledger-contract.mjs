import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/DeckEditorScreen.tsx',
  button: 'src/ui/components/Button.tsx',
  css: 'src/ui/styles/deck-editor-header-command-ledger.css',
  visual: 'tests/visual/batch67-deck-editor-header-command-ledger-review.spec.ts',
  batch54: 'tests/visual/batch54-deck-editor-inspector-rail-review.spec.ts',
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

requireText('app', "import './ui/styles/deck-editor-header-command-ledger.css';", 'Batch 67 screen-layer override must be loaded');
for (const needle of [
  'const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(deck), [draft, deck]);',
  'const handleSave = () => {',
  'onClick={handleSave} disabled={!isDirty}',
  'onClick={() => (isDirty ? setLeaveConfirm(true) : onBack())}',
  'title="保存していない変更があります"',
]) requireText('screen', needle, 'save/dirty/back/leave-confirm semantics must remain unchanged');
requireText('button', "if (disabled) {\n    return 'button.disabled.background';", 'shared Button disabled semantics remain owned by Button');

for (const needle of [
  'Batch 67: DeckEditor save/back actions form one state-aware command ledger',
  '> .sp-screen__header {\n    gap: 0;',
  '> .sp-button--primary,',
  '> .sp-button--ghost {',
  'min-height: 40px;',
  'border-radius: 0;',
  'background: transparent;',
  'box-shadow: none;',
  'filter: none;',
  '> .sp-button > .sp-skin-layer {',
  'display: none;',
  '> .sp-button--primary:not(:disabled) {',
  'border-bottom-width: 2px;',
  '> .sp-button--primary:disabled {',
  'opacity: 0.42;',
  '@media (max-width: 899px), (max-height: 430px)',
  'min-height: 32px;',
]) requireText('css', needle, 'header actions must remain a flat state-aware two-command ledger');
for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed', "data-skin='cute-pop'", "data-skin='yorunoshirube'"]) {
  forbidText('css', forbidden, 'Batch 67 must remain skin-neutral without decorative/specificity escape hatches');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "const STATES = ['clean', 'dirty'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "page.getByRole('button', { name: '保存する' })",
  "page.getByRole('button', { name: 'もどる' })",
  "page.getByRole('textbox', { name: 'デッキ名' })",
  'expect(geometry?.saveDisabled).toBe(state === \'clean\');',
  'expect(geometry?.allShadowless).toBe(true);',
  'expect(geometry?.allTransparent).toBe(true);',
  'expect(geometry?.visibleSkinLayers).toBe(0);',
  'deck-editor-header-command-ledger-${skin}-${state}-${size.label}.png',
]) requireText('visual', needle, 'visual proof must cover clean/dirty state across both skins and target viewports');

for (const needle of [
  'const TABS = [',
  'expect((geometry?.mainWidth ?? 0) / (geometry?.bodyWidth ?? 1)).toBeGreaterThanOrEqual(0.98);',
  'expect(geometry?.sideBelowMain).toBe(true);',
]) requireText('batch54', needle, 'Batch 54 compact inspector geometry remains independently enforced');

requireText('packageJson', '"qa:batch67:deck-editor-header-command-ledger-contract": "node scripts/qa/validate-batch67-deck-editor-header-command-ledger-contract.mjs"', 'Batch 67 contract must be runnable');
requireText('workflow', 'pnpm qa:batch67:deck-editor-header-command-ledger-contract', 'Batch 67 contract must block CI drift');
requireText('visualWorkflow', '- name: Verify Batch 67 DeckEditor header command ledger', 'Batch 67 must have a named visual proof step');
requireText('visualWorkflow', 'pnpm exec playwright test tests/visual/batch67-deck-editor-header-command-ledger-review.spec.ts', 'dedicated proof must run before artifact upload');

if (failures.length > 0) {
  console.error('Batch 67 DeckEditor header command ledger contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 67 DeckEditor header command ledger contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
