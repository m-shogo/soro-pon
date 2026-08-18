import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  screen: 'src/ui/screens/DeckEditorScreen.tsx',
  workbench: 'src/ui/components/DeckBonusWorkbench.tsx',
  baseCss: 'src/ui/styles/deck-bonus-workbench.css',
  css: 'src/ui/styles/deck-bonus-desktop-balanced-workbench.css',
  visual: 'tests/visual/batch72-deck-editor-bonus-balanced-workbench-review.spec.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/ci.yml',
  visualWorkflow: '.github/workflows/batch14-visual-review.yml',
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

requireText(
  'app',
  "import './ui/styles/deck-bonus-desktop-balanced-workbench.css';",
  'Batch 72 desktop balance layer must load after the canonical Bonus workbench styles',
);

for (const needle of [
  "{ id: 'bonuses',",
  'label: `ボーナス (${bonusCount})`',
  'tab === \'bonuses\' && activeVariant',
  '<DeckBonusWorkbench',
  'onAddSpecialBonus={addSpecialBonus}',
  'onAddScoreBonus={addScoreBonus}',
  'onUpdateSpecialBonus={updateSpecialBonus}',
  'onRemoveSpecialBonus={removeSpecialBonus}',
  'onUpdateScoreBonus={updateScoreBonus}',
  'onRemoveScoreBonus={removeScoreBonus}',
]) {
  requireText('screen', needle, 'Batch 72 must not move Bonus state or editing behavior out of DeckEditorScreen');
}

for (const needle of [
  'className="sp-bonus-workbench"',
  'className="sp-bonus-workbench__presets"',
  'className="sp-bonus-workbench__body"',
  'className="sp-bonus-workbench__list"',
  'className="sp-bonus-workbench__editor"',
  'onClick={() => onAddSpecialBonus(templateCategoryId)}',
  'onClick={onAddScoreBonus}',
  'onClick={removeSelected}',
]) {
  requireText('workbench', needle, 'Bonus DOM and actions must remain canonical while layout alone changes');
}

for (const needle of [
  '.sp-bonus-workbench__body {',
  'align-items: start;',
  '@media (max-width: 900px) and (max-height: 500px)',
  'grid-template-columns: minmax(150px, 0.72fr) minmax(230px, 1.28fr);',
]) {
  requireText('baseCss', needle, 'Batch 35/19 compact and baseline workbench ownership must remain intact');
}

for (const needle of [
  'Batch 72: desktop Bonus editing should occupy the available editor pane',
  '@media (min-width: 901px) and (min-height: 501px)',
  '#sp-tabpanel-bonuses > .sp-bonus-workbench {',
  'height: 100%;',
  'grid-template-rows: auto auto minmax(0, 1fr);',
  '#sp-tabpanel-bonuses .sp-bonus-workbench__body {',
  'align-items: stretch;',
  '#sp-tabpanel-bonuses .sp-bonus-workbench__list,',
  '#sp-tabpanel-bonuses .sp-bonus-workbench__editor {',
  'min-height: 100%;',
  'align-content: start;',
]) {
  requireText('css', needle, 'desktop Bonus workspace must use the available pane while keeping internal content top-aligned');
}
for (const forbidden of [
  '!important',
  'linear-gradient(',
  'radial-gradient(',
  'backdrop-filter:',
  'position: fixed',
  "data-skin='cute-pop'",
  "data-skin='yorunoshirube'",
  '@media (max-width:',
]) {
  forbidText('css', forbidden, 'Batch 72 must stay desktop-only, skin-neutral, and free of decorative/specificity escape hatches');
}

for (const needle of [
  "const SKINS = ['yorunoshirube', 'cute-pop'] as const;",
  "{ width: 844, height: 390, label: 'compact' }",
  "{ width: 1440, height: 900, label: 'desktop' }",
  "getByRole('tab', { name: /^ボーナス/ })",
  "getByRole('button', { name: '同じ牌3枚 +15点', exact: true })",
  "expect(geometry?.bodyAlignItems).toBe('stretch');",
  'expect(geometry?.workbenchCoverage ?? 0).toBeGreaterThanOrEqual(0.9);',
  'expect(geometry?.bodyBottomGap ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);',
  'expect(geometry?.columnBottomSpread ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);',
  "expect(geometry?.bodyAlignItems).toBe('start');",
  'deck-editor-bonus-balanced-${skin}-${size.label}.png',
]) {
  requireText('visual', needle, 'Visual proof must cover desktop balance and compact non-regression on both skins');
}

requireText(
  'packageJson',
  '"qa:batch72:deck-editor-bonus-balanced-workbench-contract": "node scripts/qa/validate-batch72-deck-editor-bonus-balanced-workbench-contract.mjs"',
  'Batch 72 contract must be directly runnable',
);
requireText(
  'workflow',
  'pnpm qa:batch72:deck-editor-bonus-balanced-workbench-contract',
  'Batch 72 contract must block CI drift',
);
requireText(
  'visualWorkflow',
  '- name: Verify Batch 72 DeckEditor Bonus balanced workbench',
  'Batch 72 must have a named current-head visual step',
);
requireText(
  'visualWorkflow',
  'pnpm exec playwright test tests/visual/batch72-deck-editor-bonus-balanced-workbench-review.spec.ts',
  'Batch 72 dedicated proof must run immediately before artifact upload',
);

if (failures.length > 0) {
  console.error('Batch 72 DeckEditor Bonus balanced workbench contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Batch 72 DeckEditor Bonus balanced workbench contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
