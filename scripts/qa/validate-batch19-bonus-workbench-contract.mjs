import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  editor: 'src/ui/screens/DeckEditorScreen.tsx',
  workbench: 'src/ui/components/DeckBonusWorkbench.tsx',
  css: 'src/ui/styles/deck-bonus-workbench.css',
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

requireText('app', "import './ui/styles/deck-bonus-workbench.css';", 'bonus workbench styles must stay loaded');
requireText('editor', "import { DeckBonusWorkbench }", 'editor must delegate bonus UI to the dedicated workbench');
requireText('editor', "tab === 'bonuses' && activeVariant", 'bonus workbench must use the active variant rather than a copied model');
requireText('editor', 'onAddSpecialBonus={addSpecialBonus}', 'existing safe special-bonus builder boundary must stay canonical');
requireText('editor', 'onAddScoreBonus={addScoreBonus}', 'existing safe score-bonus builder boundary must stay canonical');
forbidText('editor', 'title="特別ボーナス(単体ではあがれない)"', 'old repeated special-bonus form panel must not return');
forbidText('editor', 'title="スコアボーナス(機械的な加点)"', 'old repeated score-bonus form panel must not return');

for (const needle of [
  'aria-label="ボーナス編集ワークベンチ"',
  'aria-label="編集するボーナスを選ぶ"',
  'aria-pressed={isSelected}',
  'カテゴリ3枚以上 +20点',
  '同じ牌3枚 +15点',
  'このボーナスを削除',
]) {
  requireText('workbench', needle, 'selection, presets and destructive action must stay explicit');
}
forbidText('workbench', 'buildSpecialBonusTemplate', 'workbench must not duplicate special bonus construction semantics');
forbidText('workbench', 'buildScoreBonusTemplate', 'workbench must not duplicate score bonus construction semantics');

requireText('css', 'game-building workbench', 'visual thesis must remain explicit');
requireText('css', 'min-height: 44px;', 'bonus choices need frequent-action touch size on roomy layouts');
requireText('css', "[data-selected='true']", 'selection must have a non-hover visual state');
requireText('css', 'transform: none', 'bonus rows must not regain hover-lift behavior');
forbidText('css', 'linear-gradient(', 'bonus workbench must not use decorative gradients');
forbidText('css', 'radial-gradient(', 'bonus workbench must not use decorative gradients');

requireText('visual', 'deck-editor-bonuses-${skin}-${size.label}', 'bonus tab must stay in the canonical current-head visual matrix');
requireText('visual', "getByRole('tab', { name: /^ボーナス/ })", 'visual capture must reach bonus UI through the real tab interaction');

if (failures.length > 0) {
  console.error('Batch 19 bonus workbench contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 19 bonus workbench contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
