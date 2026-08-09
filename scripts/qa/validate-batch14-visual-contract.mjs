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
  deckBrowserCss: 'src/ui/styles/deck-browser-authored-workspace.css',
  matchRiverCss: 'src/ui/styles/match-river-polish.css',
  landscapeCss: 'src/ui/styles/batch14-landscape-game.css',
  match: 'src/ui/screens/MatchScreen.tsx',
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

requireText('claude', 'Batch 14 Visual Quality Contract', 'future agents must inherit the visual quality gate');
requireText('claude', 'CI green is necessary but never sufficient', 'visual approval must stay distinct from code correctness');
requireText('claude', 'no generic AI ensemble/collage look', 'generic generated composition must stay explicitly prohibited');

for (const code of ['AI-01', 'AI-02', 'AI-03', 'AI-04', 'AI-05', 'AI-06', 'AI-07', 'UI-01', 'GAME-01', 'ASSET-04']) {
  requireText('learning', code, 'visual failure taxonomy must remain machine-checkable and reusable');
}
requireText('learning', 'weakest three', 'every pass must identify the largest visual defects before adding polish');
requireText('learning', 'Candidate A/B/C must be conceptually different', 'candidate diversity cannot collapse to seed variations');

for (const heading of [
  '## Visual Thesis',
  '## Composition Contract',
  '## Candidate Diversity',
  '## Prior Failure Check',
  '## Review Notes / Learning Capture',
]) {
  requireText('template', heading, 'new asset requests must preserve authored generation fields');
  requireText('request017', heading, 'Yorunoshirube table brief must follow the authored request contract');
  requireText('request018', heading, 'Cute Pop table brief must follow the authored request contract');
}
for (const requestKey of ['request017', 'request018']) {
  requireText(requestKey, 'central 60-70%', 'gameplay center must stay quiet for tiles and discard rivers');
  requireText(requestKey, 'near-duplicate candidates', 'candidate diversity must remain explicit');
}
requireText('request017', 'one primary warm lantern source', 'Yorunoshirube lighting must stay authored rather than neon');
requireText('request018', 'matte printed board/paper', 'Cute Pop material must stay tactile rather than candy-gloss');
requireText('request018', 'rainbow or aurora gradients', 'Cute Pop anti-pattern guard must explicitly reject generic gradient polish');

requireText('app', "import './ui/styles/authored-visual-polish.css';", 'authored anti-AI override must stay loaded');
requireText('app', "import './ui/styles/deck-editor-authored-workspace.css';", 'authored editor workspace pass must stay loaded');
requireText('app', "import './ui/styles/deck-browser-authored-workspace.css';", 'authored deck browsing pass must stay loaded');
requireText('app', "import './ui/styles/batch14-landscape-game.css';", 'compact landscape composition must stay loaded after authored polish');
requireText('authoredCss', 'generic AI/SaaS treatments', 'file purpose must remain explicit');
requireText('authoredCss', '.sp-deck-select-card', 'deck selection must retain non-marketplace treatment');
requireText('authoredCss', '.sp-table-stage', 'match table must retain art-first treatment');
requireText('authoredCss', '.sp-deck-editor-tile-preview', 'editor must retain a visible game-object anchor beside form controls');
requireText('authoredCss', 'backdrop-filter: none', 'glass blur must stay actively neutralized in authored layer');
forbidText('authoredCss', 'radial-gradient(', 'authored layer must not reintroduce decorative radial gradients');

requireText('workspaceCss', 'game-building workbench', 'editor polish must keep a game-workspace visual thesis');
requireText('workspaceCss', '#sp-tabpanel-tiles > .sp-paper-panel > .sp-screen__col > div', 'tile-row styling must follow stable DOM structure');
requireText('workspaceCss', 'border-left: 1px solid', 'validation rail must remain structurally separated without becoming a floating card');
requireText('workspaceCss', 'transform: none', 'editor presets must not regain hover-lift behavior');
forbidText('workspaceCss', "[style*='border-bottom']", 'editor styling must not depend on serialized inline-style text');
forbidText('workspaceCss', 'radial-gradient(', 'editor workspace must not use decorative radial gradients');
forbidText('workspaceCss', 'linear-gradient(', 'editor workspace must not use decorative linear gradients');
forbidText('workspaceCss', 'backdrop-filter:', 'editor workspace must not use glass blur');

requireText('deckBrowserCss', 'Deck identity must come from its actual tiles', 'deck browse/detail hierarchy must remain object-led');
requireText('deckBrowserCss', '.sp-deck-loadout__tile-item:hover .sp-tile', 'detail tiles must explicitly neutralize hover lift');
requireText('deckBrowserCss', '.sp-deck-select-card:hover .sp-deck-select-card__preview .sp-tile:nth-child(odd)', 'deck preview tiles must explicitly neutralize hover choreography');
requireText('deckBrowserCss', 'background: transparent', 'count/stat chrome must stay visually quiet');
forbidText('deckBrowserCss', 'radial-gradient(', 'deck browse/detail pass must not use decorative radial gradients');
forbidText('deckBrowserCss', 'linear-gradient(', 'deck browse/detail pass must not use decorative linear gradients');
forbidText('deckBrowserCss', 'translateY(', 'deck browse/detail pass must not reintroduce hover lift');

requireText('matchRiverCss', 'regular blocks are easier to scan', 'discard rivers must stay grid-led and mahjong-readable');
requireText('matchRiverCss', 'physical edge rather than an ornamental glow/fog composition', 'self hand must keep authored physical grounding');
requireText('matchRiverCss', 'border-radius: 0', 'empty-state/drawn markers must not regress into pill decoration');
forbidText('matchRiverCss', 'radial-gradient(', 'match river layer must not use decorative radial gradients');
forbidText('matchRiverCss', 'linear-gradient(', 'match river layer must not use decorative linear gradients');

requireText('landscapeCss', '844x390 is a game viewport', 'target viewport intent must remain explicit');
requireText('landscapeCss', '.sp-match-utility', 'utility overlay composition must remain defined');
requireText('landscapeCss', 'position: absolute', 'edge controls must not consume dedicated layout rows in compact landscape');
requireText('landscapeCss', 'grid-template-rows: minmax(0, 1fr) auto', 'table and hand must own the compact vertical layout');
requireText('landscapeCss', '.sp-match-action-zone', 'actions must remain an edge control rather than a full-width web toolbar');
requireText('landscapeCss', 'right: max(5px, var(--sp-safe-right))', 'right-edge action placement must respect safe area');
requireText('landscapeCss', '.sp-seat-played__head', 'discard river labels should disappear when space is scarce');
requireText('landscapeCss', '.sp-player-panel__meta', 'compact player panels must suppress redundant visible metadata');
requireText('landscapeCss', '#sp-tabpanel-roles', 'role composer must retain compact game-building treatment');

forbidText('match', "from '../skins/useSkin'", 'skin/debug identity should not occupy match utility chrome');
forbidText('match', 'Cute Pop', 'match chrome must not display skin labels');
forbidText('match', 'ヨルノシルベ', 'match chrome must not display skin labels');
forbidText('match', '手番を準備しています', 'long assistant-like phase narration must not return');
forbidText('match', '山から1枚引いています', 'long assistant-like phase narration must not return');
requireText('match', "turnStart: '手番準備'", 'compact phase language is part of the authored game UI');
requireText('match', '<strong>そろぽん</strong>', 'utility identity should stay compact');

requireText('editor', "import { TileCard } from '../components/TileCard';", 'editor must reuse the production tile renderer');
requireText('editor', 'className="sp-deck-editor-tile-preview"', 'tile rows must retain live visual preview');
requireText('editor', 'primaryCategory.color', 'preview must reflect the live primary category color');
requireText('editor', 'showName={false}', 'preview should remain a compact visual object rather than another text panel');

if (failures.length > 0) {
  console.error('Batch 14 visual contract drift detected:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Batch 14 visual contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);