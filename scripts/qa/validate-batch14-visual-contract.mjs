import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = {
  claude: 'CLAUDE.md',
  learning: 'docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md',
  template: 'docs/asset-requests/TEMPLATE.md',
  request017: 'docs/asset-requests/017-BATCH-14-YORUNOSHIRUBE-TABLE-BACKGROUND-REFINEMENT.md',
  app: 'src/App.tsx',
  authoredCss: 'src/ui/styles/authored-visual-polish.css',
  match: 'src/ui/screens/MatchScreen.tsx',
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

// Durable agent instruction: CI green is not visual approval and anti-patterns
// are explicitly recorded rather than being chat-only taste.
requireText('claude', 'Batch 14 Visual Quality Contract', 'future agents must inherit the visual quality gate');
requireText('claude', 'CI green is necessary but never sufficient', 'visual approval must stay distinct from code correctness');
requireText('claude', 'no generic AI ensemble/collage look', 'generic generated composition must stay explicitly prohibited');

// Learning ledger + stable reason codes. These codes are used by future asset
// reviews so rejected concepts do not silently return with a different seed.
for (const code of ['AI-01', 'AI-02', 'AI-03', 'AI-04', 'AI-05', 'AI-06', 'AI-07', 'UI-01', 'GAME-01', 'ASSET-04']) {
  requireText('learning', code, 'visual failure taxonomy must remain machine-checkable and reusable');
}
requireText('learning', 'weakest three', 'every pass must identify the largest visual defects before adding polish');
requireText('learning', 'Candidate A/B/C must be conceptually different', 'candidate diversity cannot collapse to seed variations');

// Every new generation brief must carry enough art direction to prevent model
// defaults from choosing the composition/material/style by accident.
for (const heading of [
  '## Visual Thesis',
  '## Composition Contract',
  '## Candidate Diversity',
  '## Prior Failure Check',
  '## Review Notes / Learning Capture',
]) {
  requireText('template', heading, 'new asset requests must preserve authored generation fields');
  requireText('request017', heading, 'Batch 14 table background request must follow the authored request contract');
}
requireText('request017', 'central 60-70%', 'gameplay center must stay quiet for tiles and discard rivers');
requireText('request017', 'near-duplicate candidates', 'candidate diversity must remain explicit');

// The authored override intentionally comes after generic polish layers so it
// can remove SaaS/AI presentation defaults without rewriting semantic DOM.
requireText('app', "import './ui/styles/authored-visual-polish.css';", 'authored anti-AI override must stay loaded');
requireText('authoredCss', 'generic AI/SaaS treatments', 'file purpose must remain explicit');
requireText('authoredCss', '.sp-deck-select-card', 'deck selection must retain non-marketplace treatment');
requireText('authoredCss', '.sp-table-stage', 'match table must retain art-first treatment');
requireText('authoredCss', 'backdrop-filter: none', 'glass blur must stay actively neutralized in authored layer');
forbidText('authoredCss', 'radial-gradient(', 'authored layer must not reintroduce decorative radial gradients');

// Match chrome should not expose skin/debug identity or long assistant-like
// narration. State copy is intentionally compact and game-native.
forbidText('match', "from '../skins/useSkin'", 'skin/debug identity should not occupy match utility chrome');
forbidText('match', 'Cute Pop', 'match chrome must not display skin labels');
forbidText('match', 'ヨルノシルベ', 'match chrome must not display skin labels');
forbidText('match', '手番を準備しています', 'long assistant-like phase narration must not return');
forbidText('match', '山から1枚引いています', 'long assistant-like phase narration must not return');
requireText('match', "turnStart: '手番準備'", 'compact phase language is part of the authored game UI');
requireText('match', '<strong>そろぽん</strong>', 'utility identity should stay compact');

if (failures.length > 0) {
  console.error('Batch 14 visual contract drift detected:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Batch 14 visual contract: PASS');
console.log(`Checked ${Object.keys(REQUIRED_FILES).length} canonical files.`);
