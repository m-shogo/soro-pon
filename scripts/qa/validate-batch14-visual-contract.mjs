import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  claude: 'CLAUDE.md',
  learning: 'docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md',
  template: 'docs/asset-requests/TEMPLATE.md',
  request017: 'docs/asset-requests/017-BATCH-14-YORUNOSHIRUBE-TABLE-BACKGROUND-REFINEMENT.md',
  request018: 'docs/asset-requests/018-BATCH-14-CUTE-POP-TABLE-BACKGROUND-REFINEMENT.md',
  app: 'src/App.tsx',
  authoredCss: 'src/ui/styles/authored-visual-polish.css',
  workspaceCss: 'src/ui/styles/deck-editor-authored-workspace.css',
  categoryWorkbench: 'src/ui/components/DeckCategoryWorkbench.tsx',
  categoryCss: 'src/ui/styles/deck-category-workbench.css',
  tileWorkbench: 'src/ui/components/DeckTileWorkbench.tsx',
  tileCss: 'src/ui/styles/deck-tile-workbench.css',
  roleWorkbench: 'src/ui/components/DeckRoleWorkbench.tsx',
  roleCss: 'src/ui/styles/deck-role-workbench.css',
  bonusWorkbench: 'src/ui/components/DeckBonusWorkbench.tsx',
  bonusCss: 'src/ui/styles/deck-bonus-workbench.css',
  inspectorCss: 'src/ui/styles/deck-editor-adaptive-inspector.css',
  deckBrowserCss: 'src/ui/styles/deck-browser-authored-workspace.css',
  resultCss: 'src/ui/styles/result-authored-workspace.css',
  matchRiverCss: 'src/ui/styles/match-river-polish.css',
  landscapeCss: 'src/ui/styles/batch14-landscape-game.css',
  match: 'src/ui/screens/MatchScreen.tsx',
  result: 'src/ui/screens/ResultScreen.tsx',
  deckList: 'src/ui/screens/DeckListScreen.tsx',
  editor: 'src/ui/screens/DeckEditorScreen.tsx',
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

// Authored visual policy and learning must remain inherited by future agents.
for (const needle of [
  'Batch 14 Visual Quality Contract',
  'CI green is necessary but never sufficient',
  'no generic AI ensemble/collage look',
]) {
  requireText('claude', needle, 'future agents must inherit the authored visual gate');
}
for (const code of ['AI-01', 'AI-02', 'AI-03', 'AI-04', 'AI-05', 'AI-06', 'AI-07', 'UI-01', 'GAME-01', 'ASSET-04']) {
  requireText('learning', code, 'visual failure taxonomy must remain reusable');
}
requireText('learning', 'weakest three', 'each visual pass must prioritize the largest defects');
requireText('learning', 'Candidate A/B/C must be conceptually different', 'asset candidates cannot collapse into seed variations');

for (const heading of [
  '## Visual Thesis',
  '## Composition Contract',
  '## Candidate Diversity',
  '## Prior Failure Check',
  '## Review Notes / Learning Capture',
]) {
  requireText('template', heading, 'asset request template must preserve authored generation fields');
  requireText('request017', heading, 'Yorunoshirube table brief must follow the authored request contract');
  requireText('request018', heading, 'Cute Pop table brief must follow the authored request contract');
}
for (const requestKey of ['request017', 'request018']) {
  requireText(requestKey, 'central 60-70%', 'gameplay center must stay quiet for tiles and discard rivers');
  requireText(requestKey, 'near-duplicate candidates', 'candidate diversity must stay explicit');
}
requireText('request017', 'one primary warm lantern source', 'Yorunoshirube lighting must stay authored rather than neon');
requireText('request018', 'matte printed board/paper', 'Cute Pop material must stay tactile rather than candy-gloss');
requireText('request018', 'rainbow or aurora gradients', 'Cute Pop anti-pattern guard must reject generic gradient polish');

// The app must load the current authored/workbench layers, not legacy editor layers.
for (const stylesheet of [
  'authored-visual-polish.css',
  'deck-editor-authored-workspace.css',
  'deck-category-workbench.css',
  'deck-tile-workbench.css',
  'deck-role-workbench.css',
  'deck-bonus-workbench.css',
  'deck-editor-adaptive-inspector.css',
  'result-authored-workspace.css',
  'batch14-landscape-game.css',
]) {
  requireText('app', `import './ui/styles/${stylesheet}';`, `${stylesheet} must stay loaded`);
}
forbidText('app', 'deck-role-composer.css', 'obsolete role composer stylesheet must never return');

requireText('authoredCss', 'generic AI/SaaS treatments', 'authored anti-AI layer purpose must remain explicit');
requireText('authoredCss', '.sp-deck-select-card', 'deck selection must retain non-marketplace treatment');
requireText('authoredCss', '.sp-table-stage', 'match table must retain art-first treatment');
forbidText('authoredCss', "[style*='border-bottom']", 'authored CSS must not depend on serialized inline styles');
forbidText('authoredCss', '.sp-deck-editor-tile-preview', 'legacy repeated tile-row preview must not return');
forbidText('authoredCss', '#sp-tabpanel-roles > .sp-paper-panel', 'legacy role PaperPanel DOM must not return');
forbidText('authoredCss', '#sp-tabpanel-bonuses > .sp-paper-panel', 'legacy bonus PaperPanel DOM must not return');
forbidText('authoredCss', 'radial-gradient(', 'authored layer must not reintroduce decorative radial gradients');

requireText('workspaceCss', 'current workbench layers', 'editor shell must explicitly delegate tab visuals to current workbenches');
requireText('workspaceCss', 'border-left: 1px solid', 'validation rail must remain structurally separated');
forbidText('workspaceCss', '.sp-deck-editor-tile-preview', 'legacy tile preview selector must not return');
forbidText('workspaceCss', '#sp-tabpanel-tiles > .sp-paper-panel', 'legacy tile row DOM must not return');
forbidText('workspaceCss', '#sp-tabpanel-roles > .sp-paper-panel', 'legacy role preset DOM must not return');
forbidText('workspaceCss', '#sp-tabpanel-bonuses > .sp-paper-panel', 'legacy bonus preset DOM must not return');
forbidText('workspaceCss', "[style*='border-bottom']", 'editor shell must not depend on serialized inline styles');
forbidText('workspaceCss', 'radial-gradient(', 'editor shell must not use decorative radial gradients');
forbidText('workspaceCss', 'linear-gradient(', 'editor shell must not use decorative linear gradients');
forbidText('workspaceCss', 'backdrop-filter:', 'editor shell must not use glass blur');

// Current editor presentation boundaries.
for (const [componentName, className] of [
  ['DeckCategoryWorkbench', 'sp-category-workbench'],
  ['DeckTileWorkbench', 'sp-tile-workbench'],
  ['DeckRoleWorkbench', 'sp-role-workbench'],
  ['DeckBonusWorkbench', 'sp-bonus-workbench'],
]) {
  requireText('editor', `import { ${componentName} }`, `DeckEditor must delegate to ${componentName}`);
  requireText('editor', `<${componentName}`, `${componentName} must render from the editor tab`);
  const key = componentName === 'DeckCategoryWorkbench'
    ? 'categoryWorkbench'
    : componentName === 'DeckTileWorkbench'
      ? 'tileWorkbench'
      : componentName === 'DeckRoleWorkbench'
        ? 'roleWorkbench'
        : 'bonusWorkbench';
  requireText(key, `className=\"${className}`, `${componentName} must keep its dedicated authored surface`);
  requireText(key, 'aria-pressed=', `${componentName} selection must expose persistent state`);
}
forbidText('editor', 'className="sp-deck-editor-tile-preview"', 'editor must not regress to repeated per-tile form rows');
forbidText('editor', "import { TileCard } from '../components/TileCard';", 'production tile rendering belongs inside DeckTileWorkbench');

requireText('tileWorkbench', "import { TileCard } from './TileCard';", 'tile workbench must reuse the production tile renderer');
requireText('tileWorkbench', 'onToggleCategory(selectedTile, category.id)', 'tile categories must keep the existing safe callback');
requireText('tileCss', 'shelf is the primary surface', 'tile editing must remain object-first');
requireText('categoryCss', "[data-selected='true']", 'category selection must remain persistent');
requireText('roleCss', 'selection-based', 'role editor must remain preset/selection-led');
requireText('bonusCss', 'game-building workbench', 'bonus editor must remain preset/selection-led');
for (const key of ['categoryCss', 'tileCss', 'roleCss', 'bonusCss']) {
  forbidText(key, 'radial-gradient(', 'workbench layers must not use decorative radial gradients');
  forbidText(key, 'linear-gradient(', 'workbench layers must not use decorative linear gradients');
}
requireText('inspectorCss', 'width: min(158px, 21%);', 'compact adaptive inspector must leave width to the workbench');
requireText('inspectorCss', 'min-height: 28px;', 'compact validation disclosure must remain operable');

requireText('deckBrowserCss', 'Deck identity must come from its actual tiles', 'deck browse/detail hierarchy must remain object-led');
requireText('deckBrowserCss', 'background: transparent', 'deck stat chrome must stay visually quiet');
forbidText('deckBrowserCss', 'radial-gradient(', 'deck browse/detail pass must not use decorative radial gradients');
forbidText('deckBrowserCss', 'linear-gradient(', 'deck browse/detail pass must not use decorative linear gradients');
forbidText('deckBrowserCss', 'translateY(', 'deck browse/detail pass must not reintroduce hover lift');

requireText('resultCss', 'The result, winning tiles and score are the event', 'Result hierarchy must stay outcome-first');
requireText('resultCss', '@layer screens', 'Result-specific styling must outrank generic component styling');
requireText('resultCss', '.sp-result-screen__actions', 'Result continuation controls must remain grouped');
requireText('resultCss', 'transform: none', 'Result actions must not regain hover lift');
forbidText('resultCss', 'radial-gradient(', 'Result authored layer must not use decorative radial gradients');
forbidText('resultCss', 'linear-gradient(', 'Result authored layer must not use decorative linear gradients');
forbidText('resultCss', 'backdrop-filter:', 'Result authored layer must not use glass blur');

requireText('matchRiverCss', 'regular blocks are easier to scan', 'discard rivers must stay grid-led and mahjong-readable');
requireText('matchRiverCss', 'physical edge rather than an ornamental glow/fog composition', 'self hand must keep authored physical grounding');
forbidText('matchRiverCss', 'radial-gradient(', 'match river layer must not use decorative radial gradients');
forbidText('matchRiverCss', 'linear-gradient(', 'match river layer must not use decorative linear gradients');

// Compact gameplay layer owns only match composition plus a shared editor main constraint.
for (const needle of [
  '844x390 is a game viewport',
  '.sp-match-utility',
  'grid-template-rows: minmax(0, 1fr) auto',
  '.sp-match-action-zone',
  'right: max(5px, var(--sp-safe-right))',
  '.sp-seat-played__head',
  '.sp-player-panel__meta',
  '.sp-self-hand-zone .sp-tile',
  'pointer-events: auto;',
]) {
  requireText('landscapeCss', needle, 'compact gameplay composition must remain explicit');
}
forbidText('landscapeCss', '#sp-tabpanel-roles', 'tab-specific role layout belongs to DeckRoleWorkbench CSS');
forbidText('landscapeCss', '#sp-tabpanel-bonuses', 'tab-specific bonus layout belongs to DeckBonusWorkbench CSS');
forbidText('landscapeCss', '#sp-tabpanel-tiles > .sp-paper-panel', 'legacy tile row layout must not return');
forbidText('landscapeCss', '.sp-deck-editor-tile-preview', 'legacy tile preview layout must not return');

forbidText('match', "from '../skins/useSkin'", 'skin/debug identity should not occupy match utility chrome');
forbidText('match', 'Cute Pop', 'match chrome must not display skin labels');
forbidText('match', 'ヨルノシルベ', 'match chrome must not display skin labels');
requireText('match', "turnStart: '準備'", 'phase language should stay compact and game-like');
requireText('match', "discardSelect: '打牌'", 'discard phase should use compact game vocabulary');
requireText('match', '<strong>そろぽん</strong>', 'utility identity should stay compact');

for (const needle of [
  'className="sp-screen sp-result-screen"',
  '<h1 className="sp-screen__title">対戦結果</h1>',
  '山が尽きました。',
  '記録用。対局性能には影響しません。',
  'もう一局',
  '記憶帳を見る',
  'TOPへ',
]) {
  requireText('result', needle, 'Result must keep direct outcome and continuation language');
}
forbidText('result', '夜の帳が下りた', 'poetic narration must not compete with the outcome');
forbidText('result', '今宵の勝者', 'poetic narration must not compete with the outcome');

requireText('deckList', "playable: '対局可'", 'deck list must use compact game-state language');
requireText('deckList', "created: '自作'", 'deck source copy must stay native');
requireText('deckList', '<h1 className="sp-screen__title">デッキ選択</h1>', 'deck list heading must stay direct');
forbidText('deckList', 'DECK SELECT', 'decorative English eyebrow must not return');
forbidText('deckList', 'OFFICIAL', 'source identity should stay compact Japanese copy');
forbidText('deckList', 'CUSTOM', 'source identity should stay compact Japanese copy');

if (failures.length > 0) {
  console.error('Batch 14 visual contract drift detected:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Batch 14 visual contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} current canonical files.`);
