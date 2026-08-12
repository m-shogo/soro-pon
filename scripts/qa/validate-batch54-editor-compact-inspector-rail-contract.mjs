import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/DeckEditorScreen.tsx',
  inspector: 'src/ui/components/DeckEditorInspector.tsx',
  adaptiveCss: 'src/ui/styles/deck-editor-adaptive-inspector.css',
  css: 'src/ui/styles/deck-editor-compact-inspector-rail.css',
  visual: 'tests/visual/batch54-deck-editor-inspector-rail-review.spec.ts',
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
  if (files[fileKey].includes(needle)) failures.push(`${REQUIRED_FILES[fileKey]}: forbidden ${JSON.stringify(needle)} — ${reason}`);
}

requireText('app', "import './ui/styles/deck-editor-compact-inspector-rail.css';", 'Batch 54 screens-layer override must be loaded after the adaptive inspector');

for (const needle of [
  'role="tabpanel"',
  'id={`sp-tabpanel-${tab}`}',
  'sp-screen__col sp-screen__col--side sp-screen__col--scroll',
  '<DeckEditorInspector deck={draft} validation={validation} />',
]) requireText('screen', needle, 'editor DOM and inspector ownership must stay unchanged');

for (const needle of [
  'title="構成"',
  'aria-label="編集中デッキの構成"',
  'aria-label="検証問題の内訳"',
  'sp-deck-editor-inspector__validation',
  'sp-deck-editor-inspector__validation-clear',
]) requireText('inspector', needle, 'all inspector information and validation semantics must remain available');

for (const needle of [
  "width: min(240px, 24%);",
  'min-width: 190px;',
]) requireText('adaptiveCss', needle, 'desktop inspector rail remains the Batch 21 canonical composition');

for (const needle of [
  'Batch 54: compact deck editing is a workbench',
  '@layer screens',
  '@media (max-width: 899px), (max-height: 430px)',
  'grid-template-rows: minmax(0, 1fr) 54px;',
  "grid-row: 1;",
  'width: 100%;',
  'grid-row: 2;',
  'height: 54px;',
  'max-height: 54px;',
  'border-left: 0;',
  'grid-template-columns: minmax(0, 1fr) auto;',
  'grid-template-columns: auto auto minmax(250px, 1fr) auto;',
  'grid-template-columns: repeat(4, minmax(0, 1fr));',
  'grid-template-columns: repeat(3, auto);',
  '.sp-deck-editor-inspector__validation-clear {',
]) requireText('css', needle, 'compact editor must become a full-width workbench with a shallow information-complete bottom rail');

for (const forbidden of ['!important', 'linear-gradient(', 'radial-gradient(', 'backdrop-filter:', 'position: fixed']) {
  forbidText('css', forbidden, 'Batch 54 must not introduce specificity hacks, decorative glass, or floating UI');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "{ name: /^基本/, id: 'basic' }",
  "{ name: /^カテゴリ/, id: 'categories' }",
  "{ name: /^牌/, id: 'tiles' }",
  "{ name: /^役/, id: 'roles' }",
  "{ name: /^ボーナス/, id: 'bonuses' }",
  'inspectEditorGeometry',
  'toBeGreaterThanOrEqual(0.98)',
  'expect(geometry?.sideBelowMain).toBe(true);',
  'toBeLessThanOrEqual(58);',
  'expect(geometry?.summaryVisibleCount).toBe(4);',
  'expect(geometry?.issueVisibleCount).toBe(3);',
  'expect(geometry?.validationVisible).toBe(true);',
  'expect(geometry?.sideRightOfMain).toBe(true);',
  'const sideRatio = (geometry?.sideWidth ?? 0) / (geometry?.bodyWidth ?? 1);',
  'expect(sideRatio).toBeGreaterThanOrEqual(0.22);',
  'expect(sideRatio).toBeLessThanOrEqual(0.28);',
  'deck-editor-inspector-${skin}-${tab.id}-${size.label}.png',
]) requireText('visual', needle, 'canonical evidence must measure all five tabs, both skins, compact rail geometry and the existing desktop rail proportion');
forbidText('visual', 'toHaveScreenshot(', 'Batch 54 remains current-head artifact evidence rather than a stale pixel baseline');

requireText('packageJson', 'tests/visual/batch54-deck-editor-inspector-rail-review.spec.ts', 'canonical visual review command must execute Batch 54 geometry');
requireText('packageJson', '"qa:batch54:editor-compact-inspector-rail-contract": "node scripts/qa/validate-batch54-editor-compact-inspector-rail-contract.mjs"', 'Batch 54 contract must be directly runnable');
requireText('workflow', 'pnpm qa:batch54:editor-compact-inspector-rail-contract', 'Batch 54 contract must block CI drift');

if (failures.length > 0) {
  console.error('Batch 54 editor compact inspector rail contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 54 editor compact inspector rail contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
