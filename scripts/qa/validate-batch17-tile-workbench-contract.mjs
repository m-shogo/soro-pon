import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  app: 'src/App.tsx',
  editor: 'src/ui/screens/DeckEditorScreen.tsx',
  workbench: 'src/ui/components/DeckTileWorkbench.tsx',
  workbenchCss: 'src/ui/styles/deck-tile-workbench.css',
  workbenchTest: 'src/ui/components/DeckTileWorkbench.test.tsx',
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

requireText('app', "import './ui/styles/deck-tile-workbench.css';", 'tile workbench CSS must stay loaded');
requireText('editor', "import { DeckTileWorkbench } from '../components/DeckTileWorkbench';", 'editor must delegate tile editing to the workbench');
requireText('editor', '<DeckTileWorkbench', 'tile tab must render one focused workbench instead of repeated form rows');
requireText('editor', 'onUpdateTile={updateTile}', 'existing tile mutation semantics must stay wired');
requireText('editor', 'onToggleCategory={toggleTileCategory}', 'existing safe category membership semantics must stay wired');
requireText('editor', 'onRemoveTile={removeTile}', 'existing tile deletion semantics must stay wired');
forbidText('editor', 'className="sp-deck-editor-tile-preview"', 'repeated tile form rows must not return');
forbidText('editor', "import { TileCard } from '../components/TileCard';", 'production tile rendering should stay inside the workbench boundary');

for (const needle of [
  "import { TileCard } from './TileCard';",
  'const [selectedTileId, setSelectedTileId]',
  'aria-label="牌編集ワークベンチ"',
  'aria-label="編集する牌を選ぶ"',
  'aria-pressed={selected}',
  'data-selected={selected || undefined}',
  'className="sp-tile-workbench__editor"',
  'onUpdateTile(selectedTile.id, { name })',
  'onToggleCategory(selectedTile, category.id)',
  'onRemoveTile(selectedTile.id)',
  'label="主カテゴリ"',
]) {
  requireText('workbench', needle, 'tile workbench must keep direct tile selection and selected-only editing semantics');
}

for (const needle of [
  'The shelf is the primary surface',
  '.sp-tile-workbench__shelf',
  '.sp-tile-workbench__choice[data-selected=\'true\']',
  '.sp-tile-workbench__editor',
  'grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);',
  'grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);',
  'min-height: 78px;',
  'min-height: 26px;',
]) {
  requireText('workbenchCss', needle, 'desktop/compact tile workbench hierarchy and pointer targets must remain explicit');
}
for (const forbidden of ['radial-gradient(', 'linear-gradient(', 'backdrop-filter:', 'translateY(']) {
  forbidText('workbenchCss', forbidden, 'tile workbench must not use generic AI/SaaS decoration or hover lift');
}

for (const needle of [
  "getByRole('button', { name: 'ライオンを編集' })",
  "getByRole('region', { name: 'イルカの編集' })",
  "toHaveBeenCalledWith('tile-b', { name: '海イルカ' })",
  "toHaveBeenCalledWith(tiles[0], 'cat-b')",
  "toHaveBeenCalledWith('tile-a')",
]) {
  requireText('workbenchTest', needle, 'selection, editing, category and deletion behavior must stay unit-covered');
}

if (failures.length > 0) {
  console.error('Batch 17 tile-workbench contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 17 tile-workbench contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
